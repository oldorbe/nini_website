/**
 * Media handler that uses the GitHub Contents API for storage.
 *
 * On Vercel the filesystem is read-only, so we cannot write files locally.
 * Instead we commit / delete files directly in the GitHub repo via the API.
 * The same env vars used by Tina's GitHubProvider are reused here:
 *   GITHUB_PERSONAL_ACCESS_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH
 */

import type { IncomingMessage, ServerResponse } from "http";

// ---------------------------------------------------------------------------
// GitHub config (read once at cold-start)
// ---------------------------------------------------------------------------

function ghConfig() {
  const token = process.env.GITHUB_PERSONAL_ACCESS_TOKEN ?? "";
  const owner =
    process.env.GITHUB_OWNER || process.env.VERCEL_GIT_REPO_OWNER || "";
  const repo =
    process.env.GITHUB_REPO || process.env.VERCEL_GIT_REPO_SLUG || "";
  const branch =
    process.env.GITHUB_BRANCH ||
    process.env.VERCEL_GIT_COMMIT_REF ||
    "main";
  return { token, owner, repo, branch };
}

const MEDIA_ROOT = "content/uploads"; // path inside the repo

function ghHeaders() {
  const { token } = ghConfig();
  return {
    Authorization: `token ${token}`,
    Accept: "application/vnd.github.v3+json",
    "Content-Type": "application/json",
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getQueryParams(req: IncomingMessage): URLSearchParams {
  const url = req.url ?? "";
  const q = url.indexOf("?");
  return q >= 0 ? new URLSearchParams(url.slice(q)) : new URLSearchParams();
}

function parseMediaFolder(str: string): string {
  let s = str;
  if (s.startsWith("/")) s = s.slice(1);
  if (s.endsWith("/")) s = s.slice(0, -1);
  return s;
}

/** Convert a Buffer / Uint8Array to base64 */
function toBase64(data: Buffer | Uint8Array): string {
  return Buffer.from(data).toString("base64");
}

// ---------------------------------------------------------------------------
// LIST  – GET /api/media/list[/subfolder]
// ---------------------------------------------------------------------------

export async function listMedia(
  req: IncomingMessage,
  res: ServerResponse,
  segments: string[]
): Promise<void> {
  const folder = parseMediaFolder(segments.slice(1).join("/"));
  const repoPath = folder ? `${MEDIA_ROOT}/${folder}` : MEDIA_ROOT;
  const { owner, repo, branch } = ghConfig();

  const params = getQueryParams(req);
  const cursor = Number(params.get("cursor")) || 0;
  const limit = Number(params.get("limit")) || 20;

  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${repoPath}?ref=${branch}`;
  const ghRes = await fetch(apiUrl, { headers: ghHeaders() });

  if (ghRes.status === 404) {
    // Directory doesn't exist yet → return empty
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ files: [], directories: [], cursor: null }));
    return;
  }

  if (!ghRes.ok) {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        files: [],
        directories: [],
        cursor: null,
        error: `GitHub API ${ghRes.status}`,
      })
    );
    return;
  }

  const entries: any[] = await ghRes.json();
  // Filter out .gitkeep
  const filtered = entries.filter(
    (e: any) => e.name !== ".gitkeep"
  );

  const items = filtered.map((entry: any) => {
    const isFile = entry.type === "file";
    let src = `/${entry.name}`;
    if (folder) src = `/${folder}${src}`;
    src = `/${MEDIA_ROOT}${src}`;
    return { isFile, size: entry.size || 0, src, filename: entry.name };
  });

  // Sort: dirs first
  items.sort((a, b) => {
    if (a.isFile && !b.isFile) return 1;
    if (!a.isFile && b.isFile) return -1;
    return 0;
  });

  const slice = items.slice(cursor, cursor + limit);
  const files = slice.filter((x) => x.isFile);
  const directories = slice
    .filter((x) => !x.isFile)
    .map((x) => x.filename); // just folder name
  const nextCursor =
    items.length > cursor + limit ? String(cursor + limit) : null;

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ files, directories, cursor: nextCursor }));
}

// ---------------------------------------------------------------------------
// UPLOAD  – POST /api/media/upload[/subfolder/filename]
// ---------------------------------------------------------------------------

export async function uploadMedia(
  req: IncomingMessage,
  res: ServerResponse,
  segments: string[]
): Promise<void> {
  const { owner, repo, branch } = ghConfig();

  // Parse multipart form data to get the file
  const busboy = (await import("busboy")).default;
  const bb = busboy({ headers: (req as any).headers });

  const fileData = await new Promise<{
    filename: string;
    buffer: Buffer;
  } | null>((resolve) => {
    let filename = "";
    const chunks: Buffer[] = [];
    let resolved = false;

    bb.on(
      "file",
      (
        _fieldname: string,
        stream: NodeJS.ReadableStream,
        info: { filename?: string }
      ) => {
        filename = info.filename ?? "upload";
        stream.on("data", (chunk: Buffer) => chunks.push(chunk));
        stream.on("end", () => {
          if (!resolved) {
            resolved = true;
            resolve({ filename, buffer: Buffer.concat(chunks) });
          }
        });
      }
    );

    bb.on("error", () => {
      if (!resolved) {
        resolved = true;
        resolve(null);
      }
    });

    bb.on("close", () => {
      if (!resolved) {
        resolved = true;
        resolve(chunks.length > 0 ? { filename, buffer: Buffer.concat(chunks) } : null);
      }
    });

    req.pipe(bb);
  });

  if (!fileData) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ success: false, message: "No file received" }));
    return;
  }

  // Build the repo path from segments: ["upload", ...subfolderParts]
  const subPath = segments.slice(1).join("/");
  // subPath might already contain the filename (e.g. "image.jpg" or "subfolder/image.jpg")
  // or it might be empty and we use the multipart filename
  let repoFilePath: string;
  if (subPath) {
    repoFilePath = `${MEDIA_ROOT}/${subPath}`;
  } else {
    repoFilePath = `${MEDIA_ROOT}/${fileData.filename}`;
  }

  // Check if file already exists (we need its SHA to update)
  let existingSha: string | undefined;
  const checkUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${repoFilePath}?ref=${branch}`;
  const checkRes = await fetch(checkUrl, { headers: ghHeaders() });
  if (checkRes.ok) {
    const existing = await checkRes.json();
    existingSha = existing.sha;
  }

  // PUT the file via GitHub Contents API
  const putUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${repoFilePath}`;
  const body: Record<string, string> = {
    message: `Upload media: ${repoFilePath}`,
    content: toBase64(fileData.buffer),
    branch,
  };
  if (existingSha) {
    body.sha = existingSha;
  }

  const putRes = await fetch(putUrl, {
    method: "PUT",
    headers: ghHeaders(),
    body: JSON.stringify(body),
  });

  if (putRes.ok || putRes.status === 201) {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ success: true }));
  } else {
    const errData = await putRes.json().catch(() => ({}));
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        success: false,
        message: (errData as any).message || `GitHub API ${putRes.status}`,
      })
    );
  }
}

// ---------------------------------------------------------------------------
// CREATE FOLDER – POST /api/media/mkdir/folderName
// Git has no empty dirs; we create a .gitkeep inside the new folder.
// ---------------------------------------------------------------------------

export async function createFolder(
  _req: IncomingMessage,
  res: ServerResponse,
  segments: string[]
): Promise<void> {
  const { owner, repo, branch } = ghConfig();

  const folderName = segments.slice(1).join("/");
  if (!folderName) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: false, message: "missing folder name" }));
    return;
  }

  const repoPath = `${MEDIA_ROOT}/${folderName}/.gitkeep`;
  const putUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${repoPath}`;
  const putRes = await fetch(putUrl, {
    method: "PUT",
    headers: ghHeaders(),
    body: JSON.stringify({
      message: `Create media folder: ${folderName}`,
      content: "", // empty file
      branch,
    }),
  });

  if (putRes.ok || putRes.status === 201) {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: true }));
  } else {
    const errData = await putRes.json().catch(() => ({}));
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        ok: false,
        message: (errData as any).message || `GitHub API ${putRes.status}`,
      })
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE – DELETE /api/media/{path}
// ---------------------------------------------------------------------------

export async function deleteMedia(
  _req: IncomingMessage,
  res: ServerResponse,
  segments: string[]
): Promise<void> {
  const { owner, repo, branch } = ghConfig();

  const relativePath = segments.join("/");
  if (!relativePath) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: false, message: "missing path" }));
    return;
  }

  const repoPath = `${MEDIA_ROOT}/${relativePath}`;

  // Get the file's SHA (required for deletion)
  const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${repoPath}?ref=${branch}`;
  const getRes = await fetch(getUrl, { headers: ghHeaders() });
  if (!getRes.ok) {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({ ok: false, message: "File not found in repo" })
    );
    return;
  }
  const fileInfo = await getRes.json();

  // Delete via GitHub Contents API
  const delUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${repoPath}`;
  const delRes = await fetch(delUrl, {
    method: "DELETE",
    headers: ghHeaders(),
    body: JSON.stringify({
      message: `Delete media: ${repoPath}`,
      sha: (fileInfo as any).sha,
      branch,
    }),
  });

  if (delRes.ok) {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: true }));
  } else {
    const errData = await delRes.json().catch(() => ({}));
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        ok: false,
        message: (errData as any).message || `GitHub API ${delRes.status}`,
      })
    );
  }
}

// ---------------------------------------------------------------------------
// ROUTER
// ---------------------------------------------------------------------------

export async function mediaRouteHandler(
  req: IncomingMessage,
  res: ServerResponse,
  segments: string[]
): Promise<void> {
  const action = segments[0] ?? "";

  if (req.method === "GET" && action === "list") {
    await listMedia(req, res, segments);
    return;
  }
  if (req.method === "POST" && action === "upload") {
    await uploadMedia(req, res, segments);
    return;
  }
  if (req.method === "POST" && action === "mkdir") {
    await createFolder(req, res, segments);
    return;
  }
  if (
    req.method === "DELETE" &&
    action !== "list" &&
    action !== "upload" &&
    action !== "mkdir"
  ) {
    await deleteMedia(req, res, segments);
    return;
  }

  res.statusCode = 404;
  res.setHeader("Content-Type", "application/json");
  res.end(
    JSON.stringify({ error: "media route not found", action, segments })
  );
}

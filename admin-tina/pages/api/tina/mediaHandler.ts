import type { IncomingMessage, ServerResponse } from "http";
import path from "path";
import fs from "fs/promises";
import fsSync from "fs";

const PUBLIC_FOLDER = "public";
const MEDIA_ROOT = "content/uploads";

function getMediaFolder(): string {
  return path.join(process.cwd(), PUBLIC_FOLDER, MEDIA_ROOT);
}

function parseMediaFolder(str: string): string {
  let s = str;
  if (s.startsWith("/")) s = s.slice(1);
  if (s.endsWith("/")) s = s.slice(0, -1);
  return s;
}

function getQueryParams(req: IncomingMessage): URLSearchParams {
  const url = req.url ?? "";
  const q = url.indexOf("?");
  return q >= 0 ? new URLSearchParams(url.slice(q)) : new URLSearchParams();
}

/**
 * List media files.
 * @param segments  path segments after /api/media/, e.g. ["list"] or ["list", "subfolder"]
 */
export async function listMedia(
  req: IncomingMessage,
  res: ServerResponse,
  segments: string[]
): Promise<void> {
  // segments[0] === "list"; remaining is the subfolder
  const folder = parseMediaFolder(segments.slice(1).join("/"));
  const mediaFolder = getMediaFolder();
  const folderPath = path.join(mediaFolder, folder);

  const params = getQueryParams(req);
  const cursor = Number(params.get("cursor")) || 0;
  const limit = Number(params.get("limit")) || 20;

  try {
    await fs.access(folderPath);
  } catch {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ files: [], directories: [], cursor: null }));
    return;
  }

  const entries = await fs.readdir(folderPath, { withFileTypes: true });
  const items = await Promise.all(
    entries
      .filter((ent) => ent.name !== ".gitkeep")
      .map(async (ent) => {
        const filePath = path.join(folderPath, ent.name);
        const stat = await fs.stat(filePath);
        let src = `/${ent.name}`;
        if (folder) src = `/${folder}${src}`;
        if (MEDIA_ROOT) src = `/${MEDIA_ROOT}${src}`;
        return {
          isFile: stat.isFile(),
          size: stat.size,
          src,
          filename: ent.name,
        };
      })
  );

  const sorted = items.sort((a, b) => {
    if (a.isFile && !b.isFile) return 1;
    if (!a.isFile && b.isFile) return -1;
    return 0;
  });
  const slice = sorted.slice(cursor, cursor + limit);
  const files = slice.filter((x) => x.isFile);
  const directories = slice.filter((x) => !x.isFile).map((x) => x.src);
  const nextCursor =
    sorted.length > cursor + limit ? String(cursor + limit) : null;

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ files, directories, cursor: nextCursor }));
}

/**
 * Delete a media file.
 * @param segments  path segments after /api/media/, e.g. ["content", "uploads", "foo.jpg"]
 */
export async function deleteMedia(
  _req: IncomingMessage,
  res: ServerResponse,
  segments: string[]
): Promise<void> {
  const relativePath = segments.join("/");
  if (!relativePath) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: false, message: "missing path" }));
    return;
  }
  const mediaFolder = getMediaFolder();
  const filePath = path.join(mediaFolder, relativePath);

  try {
    await fs.stat(filePath);
    await fs.rm(filePath);
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: true }));
  } catch (err) {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        ok: false,
        message: err instanceof Error ? err.message : String(err),
      })
    );
  }
}

/**
 * Upload a media file (multipart).
 * @param segments  path segments after /api/media/upload/, e.g. [] or ["subfolder"]
 */
export async function uploadMedia(
  req: IncomingMessage,
  res: ServerResponse,
  segments: string[]
): Promise<void> {
  // segments[0] === "upload"; rest is the destination subfolder
  const subPath = segments.slice(1).join("/");
  const mediaFolder = getMediaFolder();
  const destDir = path.join(mediaFolder, subPath);

  const busboy = (await import("busboy")).default;
  const bb = busboy({ headers: (req as any).headers });
  const writePromises: Promise<void>[] = [];

  bb.on("file", (_name: string, file: NodeJS.ReadableStream, info: { filename?: string }) => {
    const filename = info.filename ?? "upload";
    const saveTo = path.join(destDir, filename);
    const p = fs
      .mkdir(path.dirname(saveTo), { recursive: true })
      .then(() => {
        const writeStream = fsSync.createWriteStream(saveTo);
        file.pipe(writeStream);
        return new Promise<void>((resolve, reject) => {
          writeStream.on("finish", resolve);
          writeStream.on("error", reject);
          file.on("error", reject);
        });
      });
    writePromises.push(p);
  });

  bb.on("error", (err: Error) => {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: String(err) }));
  });

  bb.on("close", async () => {
    await Promise.all(writePromises);
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ success: true }));
  });

  req.pipe(bb);
}

/**
 * Route media requests based on parsed path segments.
 * @param segments  e.g. ["list"], ["list","subfolder"], ["upload"], ["upload","subfolder"], ["content","uploads","foo.jpg"]
 */
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
  if (req.method === "DELETE" && action !== "list" && action !== "upload") {
    await deleteMedia(req, res, segments);
    return;
  }

  res.statusCode = 404;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ error: "media route not found", action, segments }));
}

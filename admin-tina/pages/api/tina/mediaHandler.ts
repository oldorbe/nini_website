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

const MEDIA_API_PREFIX = "/api/media/";

/** Parse path after /api/media/ from req.url */
function getMediaPath(req: IncomingMessage): string {
  const url = req.url ?? "";
  const idx = url.indexOf("?");
  const pathPart = idx >= 0 ? url.slice(0, idx) : url;
  if (!pathPart.startsWith(MEDIA_API_PREFIX)) return "";
  return decodeURIComponent(pathPart.slice(MEDIA_API_PREFIX.length));
}

function getMediaPathFromMediaPrefix(req: IncomingMessage, prefix: string): string {
  const full = getMediaPath(req);
  if (!full.startsWith(prefix)) return "";
  return full.slice(prefix.length);
}

export async function listMedia(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  const pathAfterMedia = getMediaPath(req);
  const folder =
    pathAfterMedia === "list" || pathAfterMedia === "list/"
      ? ""
      : parseMediaFolder(pathAfterMedia.startsWith("list/") ? pathAfterMedia.slice(5) : pathAfterMedia);
  const mediaFolder = getMediaFolder();
  const folderPath = path.join(mediaFolder, folder);

  const limit = 20;
  let cursor = 0;
  const url = req.url ?? "";
  const q = url.indexOf("?");
  if (q >= 0) {
    const params = new URLSearchParams(url.slice(q));
    const l = params.get("limit");
    const c = params.get("cursor");
    if (c !== null) cursor = Number(c) || 0;
  }

  try {
    await fs.access(folderPath);
  } catch {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({ files: [], directories: [], cursor: null })
    );
    return;
  }

  const entries = await fs.readdir(folderPath, { withFileTypes: true });
  const items = await Promise.all(
    entries.map(async (ent) => {
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
  res.end(
    JSON.stringify({ files, directories, cursor: nextCursor })
  );
}

export async function deleteMedia(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  const pathAfterMedia = getMediaPath(req);
  if (!pathAfterMedia) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: false, message: "missing path" }));
    return;
  }
  const mediaFolder = getMediaFolder();
  const filePath = path.join(mediaFolder, pathAfterMedia);

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

export async function uploadMedia(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  const pathAfterUpload = getMediaPathFromMediaPrefix(req, "upload/");
  const mediaFolder = getMediaFolder();
  const destDir = path.join(mediaFolder, pathAfterUpload);

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

export async function mediaRouteHandler(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  const pathAfterMedia = getMediaPath(req);

  if (req.method === "GET" && (pathAfterMedia === "list" || pathAfterMedia.startsWith("list/"))) {
    await listMedia(req, res);
    return;
  }
  if (req.method === "DELETE" && pathAfterMedia && !pathAfterMedia.startsWith("list") && !pathAfterMedia.startsWith("upload")) {
    await deleteMedia(req, res);
    return;
  }
  if (req.method === "POST" && pathAfterMedia.startsWith("upload")) {
    await uploadMedia(req, res);
    return;
  }

  res.statusCode = 404;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ error: "media route not found" }));
}

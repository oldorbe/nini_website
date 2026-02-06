/**
 * Custom MediaStore for self-hosted TinaCMS on Vercel.
 *
 * The built-in TinaMediaStore switches to Tina Cloud's assets API in
 * production (isLocal=false), which doesn't exist for self-hosted setups.
 * This store always calls our own /media routes regardless of environment.
 */

import type {
  Media,
  MediaStore,
  MediaUploadOptions,
  MediaList,
  MediaListOptions,
  MediaListError,
} from "tinacms";

export default class SelfHostedMediaStore implements MediaStore {
  accept = "*";

  private get url(): string {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/media`;
    }
    return "/media";
  }

  async persist(files: MediaUploadOptions[]): Promise<Media[]> {
    const uploaded: Media[] = [];

    for (const { file, directory } of files) {
      let dir = directory || "";
      if (dir.startsWith("/")) dir = dir.slice(1);
      if (dir.endsWith("/")) dir = dir.slice(0, -1);

      let uploadPath = dir ? `${dir}/${file.name}` : file.name;
      if (uploadPath.startsWith("/")) uploadPath = uploadPath.slice(1);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("directory", directory);
      formData.append("filename", file.name);

      const res = await fetch(`${this.url}/upload/${uploadPath}`, {
        method: "POST",
        body: formData,
      });

      if (res.status !== 200) {
        let msg = "Upload failed";
        try {
          const data = await res.json();
          msg = data.message || msg;
        } catch {}
        throw new Error(msg);
      }

      const result = await res.json();
      if (result?.success) {
        // Build src the same way Tina's local persist does
        const src = `/content/uploads/${dir ? `${dir}/` : ""}${file.name}`;
        uploaded.push({
          type: "file",
          id: file.name,
          filename: file.name,
          directory,
          src,
        });
      } else {
        throw new Error("Unexpected error uploading media");
      }
    }

    return uploaded;
  }

  async list(options?: MediaListOptions): Promise<MediaList> {
    const dir = options?.directory || "";
    const limit = options?.limit || 20;
    const offset = options?.offset ?? "";

    const qs = `limit=${limit}${offset ? `&cursor=${offset}` : ""}`;
    const res = await fetch(`${this.url}/list/${dir}?${qs}`);

    if (res.status === 401) {
      const err = new Error("Unauthorized") as any;
      err.ERR_TYPE = "MediaListError";
      err.title = "Unauthorized";
      err.docsLink = "";
      throw err;
    }
    if (res.status === 404) {
      const err = new Error(
        "The media API route is missing or misconfigured."
      ) as any;
      err.ERR_TYPE = "MediaListError";
      err.title = "Bad Route";
      err.docsLink = "";
      throw err;
    }

    const { cursor, files = [], directories = [] } = await res.json();
    const items: Media[] = [];

    for (const d of directories) {
      const dirname = typeof d === "string" ? d.split("/").pop() || d : d;
      items.push({
        type: "dir",
        id: dirname,
        directory: dir,
        filename: dirname,
      });
    }

    for (const file of files) {
      items.push({
        type: "file",
        id: file.filename,
        filename: file.filename,
        directory: dir,
        src: file.src,
      });
    }

    return {
      items,
      nextOffset: cursor || 0,
    };
  }

  async delete(media: Media): Promise<void> {
    const filePath = media.directory
      ? `${media.directory}/${media.filename}`
      : media.filename;
    await fetch(`${this.url}/${filePath}`, { method: "DELETE" });
  }
}

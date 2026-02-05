declare module "busboy" {
  import type { IncomingHttpHeaders } from "http";

  interface BusboyConfig {
    headers: IncomingHttpHeaders;
  }

  interface FileInfo {
    filename?: string;
    encoding?: string;
    mimeType?: string;
  }

  interface Busboy extends NodeJS.WritableStream {
    on(
      event: "file",
      callback: (
        fieldname: string,
        file: NodeJS.ReadableStream,
        info: FileInfo
      ) => void
    ): this;
    on(event: "error", callback: (err: Error) => void): this;
    on(event: "close", callback: () => void): this;
  }

  interface BusboyConstructor {
    new (config: BusboyConfig): Busboy;
    (config: BusboyConfig): Busboy;
  }

  const busboy: BusboyConstructor;
  export default busboy;
}

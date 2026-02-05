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

  interface Busboy {
    on(
      event: "file",
      callback: (
        fieldname: string,
        file: NodeJS.ReadableStream,
        info: FileInfo
      ) => void
    ): void;
    on(event: "error", callback: (err: Error) => void): void;
    on(event: "close", callback: () => void): void;
  }

  interface BusboyConstructor {
    new (config: BusboyConfig): Busboy;
    (config: BusboyConfig): Busboy;
  }

  const busboy: BusboyConstructor;
  export default busboy;
}

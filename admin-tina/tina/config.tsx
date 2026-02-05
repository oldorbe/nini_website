import {
  UsernamePasswordAuthJSProvider,
  TinaUserCollection,
} from "tinacms-authjs/dist/tinacms";
import { defineConfig, LocalAuthProvider } from "tinacms";
import { installationsCollection } from "./collections/installations";
import { videotapesCollection } from "./collections/videotapes";
import { textsCollection } from "./collections/texts";

const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === "true";

export default defineConfig({
  authProvider: isLocal
    ? new LocalAuthProvider()
    : new UsernamePasswordAuthJSProvider(),
  contentApiUrlOverride: "/api/tina/gql",
  build: {
    publicFolder: "public",
    outputFolder: "admin",
  },
  media: {
    tina: {
      mediaRoot: "content/uploads",
      publicFolder: "",
      static: true,
    },
  },
  schema: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    collections: [
      TinaUserCollection as any,
      installationsCollection,
      videotapesCollection,
      textsCollection,
    ],
  },
});

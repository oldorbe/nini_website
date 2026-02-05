import type { Collection } from "tinacms";
import { RichTextEditorField } from "../components/RichTextEditor";

/**
 * Single-document JSON for content/about.json.
 * Output shape: { "body": "HTML string", "resumeUrl": string }
 */
export const aboutCollection: Collection = {
  name: "about",
  label: "About",
  path: "content",
  format: "json",
  match: { include: "about" },
  ui: {
    allowedActions: { create: false, delete: false },
  },
  fields: [
    {
      type: "string",
      name: "body",
      label: "About 正文",
      description: "About 页面的段落内容（支持简单格式）",
      ui: { component: RichTextEditorField },
    },
    {
      type: "string",
      name: "resumeUrl",
      label: "Resume 链接",
      description: "例如 resume.html 或完整 URL",
    },
  ],
};

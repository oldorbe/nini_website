import type { Collection } from "tinacms";
import { ImageUrlPreviewField } from "../components/ImageUrlPreview";
import { RichTextEditorField } from "../components/RichTextEditor";

/**
 * Single-document JSON collection for content/texts.json.
 * Output shape: { "entries": [ { "id", "title", "featuredImage", "body", "attachments": [ { "label", "url" } ] } ] }
 */
export const textsCollection: Collection = {
  name: "texts",
  label: "Texts",
  path: "content",
  format: "json",
  match: { include: "texts" },
  ui: {
    allowedActions: { create: false, delete: false },
  },
  fields: [
    {
      type: "object",
      list: true,
      name: "entries",
      label: "Entries",
      ui: {
        itemProps: (item) => {
          const p = item as { title?: string };
          return { label: p?.title || "Entry" };
        },
      },
      fields: [
        {
          type: "string",
          name: "id",
          label: "ID",
          required: true,
          description: "URL slug，如 my-text（只能用小写字母、数字和横杠）",
          ui: {
            validate: (value) => {
              if (!value) return "ID 是必填项";
              if (!/^[a-z0-9-]+$/.test(value)) return "只能包含小写字母、数字和横杠";
            },
          },
        },
        { type: "string", name: "title", label: "Title", required: true },
        {
        type: "string",
        name: "featuredImage",
        label: "Featured Image",
        ui: { component: ImageUrlPreviewField },
      },
        {
          type: "string",
          name: "body",
          label: "正文内容",
          ui: { component: RichTextEditorField },
        },
        {
          type: "object",
          list: true,
          name: "attachments",
          label: "Attachments",
          ui: { itemProps: (item) => ({ label: (item as { label?: string })?.label || "Attachment" }) },
          fields: [
            { type: "string", name: "label", label: "Label" },
            { type: "string", name: "url", label: "URL" },
          ],
        },
      ],
    },
  ],
};

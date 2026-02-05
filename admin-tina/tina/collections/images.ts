import type { Collection } from "tinacms";
import { ImageUrlPreviewField } from "../components/ImageUrlPreview";

/**
 * Single-document JSON collection for content/images.json.
 * Output shape must match: { "projects": [ { "id", "title", "year", "images": [ { "src", "alt" } ] } ] }
 * so the frontend (GitHub Pages) loadContent() continues to work unchanged.
 */
export const imagesCollection: Collection = {
  name: "images",
  label: "Images",
  path: "content",
  format: "json",
  match: { include: "images" },
  ui: {
    allowedActions: { create: false, delete: false },
  },
  fields: [
    {
      type: "object",
      list: true,
      name: "projects",
      label: "Projects",
      ui: {
        itemProps: (item) => {
          const p = item as { title?: string };
          return { label: p?.title || "Project" };
        },
      },
      fields: [
        {
          type: "string",
          name: "id",
          label: "ID",
          required: true,
          description: "URL slug，如 punchdrunk（只能用小写字母、数字和横杠）",
          ui: {
            validate: (value) => {
              if (!value) return "ID 是必填项";
              if (!/^[a-z0-9-]+$/.test(value)) return "只能包含小写字母、数字和横杠";
            },
          },
        },
        { type: "string", name: "title", label: "Title", required: true },
        { type: "string", name: "year", label: "Year" },
        {
          type: "object",
          list: true,
          name: "images",
          label: "Images",
          ui: { itemProps: (item) => ({ label: (item as { alt?: string })?.alt || "Image" }) },
          fields: [
            {
              type: "string",
              name: "src",
              label: "预览",
              ui: { component: ImageUrlPreviewField },
            },
            { type: "string", name: "alt", label: "Alt text" },
          ],
        },
      ],
    },
  ],
};

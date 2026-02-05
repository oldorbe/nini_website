import type { Collection } from "tinacms";
import { VideoUrlPreviewField } from "../components/VideoUrlPreview";
import { ImageUrlPreviewField } from "../components/ImageUrlPreview";
import { RichTextEditorField } from "../components/RichTextEditor";

/**
 * Single-document JSON collection for content/videotapes.json.
 * Output shape: { "projects": [ { "id", "title", "videoUrl", "thumbnail", "description" } ] }
 */
export const videotapesCollection: Collection = {
  name: "videotapes",
  label: "Videotapes",
  path: "content",
  format: "json",
  match: { include: "videotapes" },
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
          return { label: p?.title || "Video" };
        },
      },
      fields: [
        {
          type: "string",
          name: "id",
          label: "ID",
          required: true,
          description: "URL slug，如 my-video（只能用小写字母、数字和横杠）",
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
          name: "videoUrl",
          label: "Video URL",
          description: "Embed URL (YouTube / Vimeo / Bilibili 等) – 下方可预览",
          ui: { component: VideoUrlPreviewField },
        },
        {
          type: "string",
          name: "thumbnail",
          label: "Thumbnail",
          ui: { component: ImageUrlPreviewField },
        },
        { type: "string", name: "description", label: "Description", ui: { component: RichTextEditorField } },
      ],
    },
  ],
};

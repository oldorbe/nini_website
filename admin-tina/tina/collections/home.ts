import type { Collection } from "tinacms";
import { ImageUrlPreviewField } from "../components/ImageUrlPreview";

/**
 * Single-document JSON for content/home.json.
 * Output shape: { "slides": [ { "image", "caption" } ], "excerpt": string }
 * Frontend uses this for the homepage hero slider and the short bio excerpt below it.
 */
export const homeCollection: Collection = {
  name: "home",
  label: "Home",
  path: "content",
  format: "json",
  match: { include: "home" },
  ui: {
    allowedActions: { create: false, delete: false },
  },
  fields: [
    {
      type: "object",
      list: true,
      name: "slides",
      label: "首页相册轮播",
      description: "首页顶部轮播的图片与标题",
      ui: {
        itemProps: (item) => {
          const s = item as { caption?: string };
          return { label: s?.caption || "Slide" };
        },
      },
      fields: [
        {
          type: "string",
          name: "image",
          label: "图片",
          ui: { component: ImageUrlPreviewField },
        },
        { type: "string", name: "caption", label: "标题/说明" },
      ],
    },
    {
      type: "string",
      name: "excerpt",
      label: "首页简介段落",
      description: "轮播下方的一小段文字",
      ui: { component: "textarea" },
    },
  ],
};

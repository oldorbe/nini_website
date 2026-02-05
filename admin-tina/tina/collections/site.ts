import type { Collection } from "tinacms";

/**
 * Single-document JSON for content/site.json.
 * Output shape: { "heading": string } — used for logo and sidebar title on all pages.
 */
export const siteCollection: Collection = {
  name: "site",
  label: "Site",
  path: "content",
  format: "json",
  match: { include: "site" },
  ui: {
    allowedActions: { create: false, delete: false },
  },
  fields: [
    {
      type: "string",
      name: "heading",
      label: "站点标题（左上角 Logo / 侧栏标题）",
      description: "显示在每页左上角和侧栏顶部的标题",
      required: true,
    },
  ],
};

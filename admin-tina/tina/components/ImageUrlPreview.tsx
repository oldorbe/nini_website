import React from "react";
import { wrapFieldsWithMeta, ImageField } from "tinacms";

function isImageUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  const u = url.trim();
  if (!u) return false;
  return /^https?:\/\//i.test(u);
}

/** Preview src: allow full URL or relative path (e.g. /uploads/xxx) for preview */
function previewSrc(value: string): string | null {
  const v = (value || "").trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  if (v.startsWith("/")) return v;
  return `/${v.replace(/^\//, "")}`;
}

/**
 * Safely extract a string value.
 * TinaCMS ImageField may pass a Media object instead of a plain string
 * when the user selects/uploads via the media manager.
 */
function toStringValue(val: unknown): string {
  if (typeof val === "string") return val;
  if (val && typeof val === "object") {
    const obj = val as Record<string, unknown>;
    if (typeof obj.src === "string") return obj.src;
    if (typeof obj.filename === "string") return obj.filename;
  }
  return val ? String(val) : "";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ImageUrlPreview(props: any) {
  const { input } = props;
  const rawValue = toStringValue(input.value);
  const src = rawValue.trim();
  const showPreview = src && (isImageUrl(src) || src.startsWith("/") || !src.includes("://"));
  const imgSrc = previewSrc(src);

  // Wrap input for ImageField so it always stores a string, not a Media object
  const imageFieldProps = {
    ...props,
    input: {
      ...input,
      value: rawValue,
      onChange: (val: unknown) => input.onChange(toStringValue(val)),
    },
  };

  return (
    <div className="tina-image-url-preview space-y-4">
      <div>
        <div className="text-sm font-medium text-gray-700 mb-1.5">输入图片 URL</div>
        <input
          type="url"
          value={rawValue}
          onChange={(e) => input.onChange(e.target.value)}
          placeholder="粘贴图片链接（图床 URL）"
          className="block w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
        {showPreview && imgSrc && (
          <div className="mt-2 rounded overflow-hidden border border-gray-200 bg-gray-100 max-w-sm">
            <img
              src={imgSrc}
              alt="Preview"
              className="w-full h-auto block"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}
      </div>
      <div>
        <div className="text-sm font-medium text-gray-700 mb-1.5">或上传图片文件</div>
        <ImageField {...imageFieldProps} />
      </div>
      {src ? (
        <button
          type="button"
          onClick={() => input.onChange("")}
          className="px-3 py-1.5 text-sm font-medium rounded border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
        >
          删除图片
        </button>
      ) : null}
    </div>
  );
}

export const ImageUrlPreviewField = wrapFieldsWithMeta(ImageUrlPreview);

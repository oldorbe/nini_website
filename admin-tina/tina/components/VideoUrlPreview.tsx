import React from "react";
import { wrapFieldsWithMeta } from "tinacms";

/**
 * Normalize common video URLs to embed URL for iframe src.
 */
function toEmbedUrl(url: string): string | null {
  if (!url || typeof url !== "string") return null;
  const u = url.trim();
  if (!u) return null;
  // Already embed-style
  if (/youtube\.com\/embed\//i.test(u) || /youtu\.be\//i.test(u)) return u;
  if (/player\.vimeo\.com\/video\//i.test(u)) return u;
  if (/player\.bilibili\.com/i.test(u)) return u;
  // YouTube watch -> embed
  const ytMatch = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/i);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  // Vimeo video page -> embed
  const vimeoMatch = u.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  // Assume it might be an embed URL
  if (/^https?:\/\//i.test(u)) return u;
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function VideoUrlPreview({ input }: any) {
  const embedSrc = toEmbedUrl(input.value || "");

  return (
    <div className="tina-video-url-preview">
      <input
        type="url"
        value={input.value || ""}
        onChange={(e) => input.onChange(e.target.value)}
        placeholder="https://www.youtube.com/embed/... or https://player.vimeo.com/video/..."
        className="block w-full rounded border border-gray-300 px-3 py-2 text-sm"
      />
      {embedSrc && (
        <div className="mt-3 rounded overflow-hidden border border-gray-200 bg-gray-100" style={{ aspectRatio: "16/9", maxWidth: 560 }}>
          <iframe
            src={embedSrc}
            title="Video preview"
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
}

export const VideoUrlPreviewField = wrapFieldsWithMeta(VideoUrlPreview);

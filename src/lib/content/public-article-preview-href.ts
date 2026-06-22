/**
 * Public preview URL for an article row by API `content_type`.
 * Video/audio use dedicated routes; everything else uses the article reader.
 */
export function previewHrefForContentType(contentType: string | undefined, articleId: string): string {
  const t = (contentType || "article").toLowerCase().replace(/-/g, "_");
  const id = encodeURIComponent(articleId);
  if (t === "video") return `/content/video?id=${id}`;
  if (t === "audio") return `/content/audio?id=${id}`;
  if (t === "gallery") return `/content/gallery?id=${id}`;
  if (t === "thread") return `/content/threads?id=${id}`;
  return `/content/article?id=${id}`;
}

/**
 * Public preview URL for an article row by API `content_type`.
 * Video/audio use dedicated routes; everything else uses the article reader.
 * Plain articles with a slug get the SEO-friendly path; other types (and
 * articles without a slug yet) fall back to the ?id= query route.
 */
export function previewHrefForContentType(
  contentType: string | undefined,
  articleId: string,
  slug?: string | null,
): string {
  const t = (contentType || "article").toLowerCase().replace(/-/g, "_");
  const id = encodeURIComponent(articleId);
  if (t === "video") return `/content/video?id=${id}`;
  if (t === "audio") return `/content/audio?id=${id}`;
  if (t === "gallery") return `/content/gallery?id=${id}`;
  if (t === "thread") return `/content/threads?id=${id}`;
  if (slug) return `/content/article/${slug}`;
  return `/content/article?id=${id}`;
}

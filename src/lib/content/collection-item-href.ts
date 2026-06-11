/** Maps a collection item's content_type to the public reader route.
 *  Unknown / figma / artwork fall back to the article reader (no dedicated
 *  reader exists for those yet). */
export function collectionItemHref(
  contentType: string | null | undefined,
  id: string,
): string {
  const q = `?id=${encodeURIComponent(id)}`;
  switch ((contentType ?? "").toLowerCase()) {
    case "video":
      return `/content/video${q}`;
    case "audio":
      return `/content/audio${q}`;
    case "thread":
      return `/content/threads${q}`;
    case "article":
    case "figma":
    case "artwork":
    default:
      return `/content/article${q}`;
  }
}

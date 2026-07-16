/**
 * Small presentation helpers shared across magazine-next sections. Kept
 * flat and dependency-light so both server and client sections can import
 * them.
 */
import { resolveArticleMediaSrc } from "@/lib/content/article-media-url";

const FALLBACK_IMAGE = "/images/image.png";

/** Resolve a cover ref to a usable src, falling back to the house placeholder. */
export function coverSrc(ref: string | null | undefined): string {
  const s = (ref ?? "").trim();
  if (!s) return FALLBACK_IMAGE;
  return resolveArticleMediaSrc(s);
}

/** Strip HTML tags from an excerpt so line-clamp measures plain text. */
export function stripHtml(html: string | null | undefined): string {
  return (html ?? "").replace(/<[^>]*>/g, "").trim();
}

/** Localized short date (e.g. "Jul 2026" / Arabic month), empty on bad input. */
export function shortDate(iso: string | null | undefined, locale: string): string {
  const s = (iso ?? "").trim();
  if (!s) return "";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "";
  try {
    const fmt = new Intl.DateTimeFormat(locale, { month: "short", year: "numeric" });
    return fmt.format(d);
  } catch {
    return "";
  }
}

/** First-letter avatar fallback when no photo exists. */
export function initial(name: string | null | undefined): string {
  return (name ?? "").trim().charAt(0).toUpperCase() || "•";
}

/** Reader link for an article by id (matches the public reader route). */
export function articleHref(id: string): string {
  return "/content/article?id=" + encodeURIComponent(id);
}

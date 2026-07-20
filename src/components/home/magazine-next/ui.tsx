/**
 * Small presentation helpers shared across magazine-next sections. Kept
 * flat and dependency-light so both server and client sections can import
 * them.
 */
import { htmlToPlainText } from "@/lib/content/html-text";

// coverSrc moved to lib/content/article-media-url (beside the resolver it
// wraps) so shared UI can use it without importing from a feature directory.
// Re-exported here for the magazine-next sections that already import it.
export { coverSrc } from "@/lib/content/article-media-url";

/**
 * Plain text from an excerpt or CMS rich-text field, for consumers that render
 * it as a React text child (line-clamped excerpts, the hero subtitle). Callers
 * that can render markup should use `RichContent` instead of this.
 */
export function stripHtml(html: string | null | undefined): string {
  return htmlToPlainText(html);
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

/**
 * Pair a CTA label with its destination, or nothing. Both halves are edited
 * as separate CMS fields, and a button with a label but no link (or a link
 * with no label) is a dead control — so a CTA renders only when both are set.
 * Shared by the live hero and the admin preview so the two cannot disagree
 * about when a button appears.
 */
export function heroCta(
  label: string | null | undefined,
  href: string | null | undefined,
): { label: string; href: string } | undefined {
  const l = (label ?? "").trim();
  const h = (href ?? "").trim();
  return l && h ? { label: l, href: h } : undefined;
}

/** First-letter avatar fallback when no photo exists. */
export function initial(name: string | null | undefined): string {
  return (name ?? "").trim().charAt(0).toUpperCase() || "•";
}

/** Reader link for an article by id (matches the public reader route). */
export function articleHref(id: string): string {
  return "/content/article?id=" + encodeURIComponent(id);
}

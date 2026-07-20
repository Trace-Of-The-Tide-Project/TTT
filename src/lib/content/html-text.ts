/**
 * Turning editor HTML into plain text, for the places that need a bare string
 * rather than rendered markup — line-clamped excerpts, meta descriptions, and
 * any component that renders its text as a React child (which re-escapes, so
 * an undecoded `&amp;` reaches the reader literally).
 */

/** Decode the handful of HTML entities that survive tag stripping. */
export function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

/**
 * Plain single-line text from editor HTML. Block ends and `<br>` become a
 * space first — stripping tags outright would weld "First line.</p><p>Second"
 * into "First line.Second" — then entities are decoded and runs of whitespace
 * collapsed.
 *
 * ponytail: regex, not a parser, matching the existing block-splitter in
 * article-blocks-to-sections.ts. The corpus is TipTap output. Two older
 * private copies of decodeEntities still live in article-blocks-to-sections.ts
 * and build-thread-content-page.ts; fold them into this module next time one
 * of them needs a change.
 */
export function htmlToPlainText(html: string | null | undefined): string {
  const spaced = (html ?? "")
    .replace(/<\s*br\s*\/?>/gi, " ")
    .replace(/<\/(p|div|li|h[1-6]|blockquote|figcaption)\s*>/gi, " ");
  return decodeEntities(spaced.replace(/<[^>]*>/g, ""))
    .replace(/\s+/g, " ")
    .trim();
}

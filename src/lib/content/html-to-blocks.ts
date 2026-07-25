/**
 * Converts a normalized HTML document (from the Google Drive import
 * endpoint — a Google Doc export, mammoth's .docx conversion, or rendered
 * markdown) into the article editor's ContentBlock[] shape. Runs client-side
 * only (DOMParser) so the import feature needs no new frontend dependency.
 *
 * ponytail: tables flatten to plain-text paragraphs; multi-column layouts,
 * footnotes, and Docs comments/suggestions are dropped. Add handling when a
 * real import needs it.
 */
import { sanitizeHtml } from "@/lib/sanitize";
import type { ContentBlock } from "@/components/dashboard/admin/articles/articles-editor/ContentBlocks";

function wrap(doc: Document, node: Node, tagName: string): Node {
  const wrapper = doc.createElement(tagName);
  node.parentNode?.insertBefore(wrapper, node);
  wrapper.appendChild(node);
  return wrapper;
}

/**
 * Google Docs export expresses bold/italic/underline as inline `style` on
 * `<span>`. `sanitizeHtml`'s style allowlist doesn't include font-weight /
 * font-style / text-decoration, so without this pass every bit of emphasis
 * is silently stripped on sanitize. Must run BEFORE sanitizeHtml.
 *
 * mammoth's .docx conversion already emits semantic `<strong>`/`<em>` — this
 * is a no-op there, so it's safe to run unconditionally on all three sources.
 */
export function normalizeDocsEmphasis(html: string): string {
  if (typeof window === "undefined") return html;
  const doc = new DOMParser().parseFromString(html, "text/html");

  Array.from(doc.querySelectorAll("span[style]")).forEach((span) => {
    const style = span.getAttribute("style") ?? "";
    const bold = /font-weight\s*:\s*(7|8|9)00|font-weight\s*:\s*bold/i.test(style);
    const italic = /font-style\s*:\s*italic/i.test(style);
    const underline = /text-decoration\s*:\s*underline/i.test(style);

    let node: Node = span;
    if (bold) node = wrap(doc, node, "strong");
    if (italic) node = wrap(doc, node, "em");
    if (underline) wrap(doc, node, "u");
  });

  // Unwrap every remaining <span> shell (styled or not) — replace it with
  // its children so no bare span (dropped by sanitizeHtml's tag allowlist
  // anyway) silently eats the text inside it.
  Array.from(doc.querySelectorAll("span")).forEach((span) => {
    const parent = span.parentNode;
    if (!parent) return;
    while (span.firstChild) parent.insertBefore(span.firstChild, span);
    parent.removeChild(span);
  });

  return doc.body.innerHTML;
}

/** A `<p>` (or bare top-level) element that contains exactly one image and
 * no other text — these become image blocks, not paragraph blocks. */
function soleImage(el: Element): HTMLImageElement | null {
  if (el.tagName === "IMG") return el as HTMLImageElement;
  const imgs = el.querySelectorAll("img");
  const text = (el.textContent ?? "").trim();
  return imgs.length === 1 && !text ? (imgs[0] as HTMLImageElement) : null;
}

export function htmlToContentBlocks(rawHtml: string): ContentBlock[] {
  if (typeof window === "undefined") return [];

  const clean = sanitizeHtml(normalizeDocsEmphasis(rawHtml));
  const doc = new DOMParser().parseFromString(clean, "text/html");
  const out: ContentBlock[] = [];

  for (const el of Array.from(doc.body.children)) {
    const tag = el.tagName.toLowerCase();

    const img = soleImage(el);
    if (img) {
      const src = img.getAttribute("src")?.trim();
      if (src) {
        out.push({
          id: crypto.randomUUID(),
          type: "image",
          imageUrl: src,
          imageCaption: img.getAttribute("alt")?.trim() || undefined,
        });
      }
      continue;
    }

    if (tag === "h1" || tag === "h2") {
      const content = el.innerHTML.trim();
      if (content) out.push({ id: crypto.randomUUID(), type: "heading", headingLevel: 2, content });
      continue;
    }
    if (/^h[3-6]$/.test(tag)) {
      const content = el.innerHTML.trim();
      if (content) out.push({ id: crypto.randomUUID(), type: "heading", headingLevel: 3, content });
      continue;
    }
    if (tag === "blockquote") {
      const content = el.innerHTML.trim();
      if (content) out.push({ id: crypto.randomUUID(), type: "quote", content });
      continue;
    }
    if (tag === "hr") {
      out.push({ id: crypto.randomUUID(), type: "divider" });
      continue;
    }
    if (tag === "ul" || tag === "ol") {
      // Kept as a paragraph block: build-api-blocks auto-tags a paragraph
      // whose content starts with <ul>/<ol> as block_type "list" on save.
      const content = el.outerHTML.trim();
      if (content) out.push({ id: crypto.randomUUID(), type: "paragraph", content });
      continue;
    }
    if (tag === "p") {
      const content = el.innerHTML.trim();
      if (content) out.push({ id: crypto.randomUUID(), type: "paragraph", content });
      continue;
    }

    // Anything else (div, table, ...) — flatten to a plain-text paragraph
    // rather than dropping the content outright.
    const text = (el.textContent ?? "").trim();
    if (text) out.push({ id: crypto.randomUUID(), type: "paragraph", content: text });
  }

  return out;
}

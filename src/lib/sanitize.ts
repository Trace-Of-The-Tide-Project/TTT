import DOMPurify from "dompurify";

/**
 * Central, isomorphic HTML sanitizer for all rich-text rendered via
 * dangerouslySetInnerHTML. One allowlist, used on both server (SSR) and
 * client so the markup matches and hydration never diverges.
 *
 * `dompurify` v3 runs in Node 20+ using the built-in DOM-less path; in the
 * browser it uses the real window. We don't pass a custom window — the
 * library picks the right environment automatically.
 */

/** Tags the rich editor can emit and we allow through. */
const ALLOWED_TAGS = [
  "p", "br", "span", "strong", "em", "u", "s", "mark",
  "h1", "h2", "h3", "blockquote",
  "ul", "ol", "li",
  "a", "img", "hr", "code", "pre",
];

/** Attributes we allow (note: `style` is further scoped below). */
const ALLOWED_ATTR = [
  "href", "target", "rel", "src", "alt", "title", "class", "style", "dir",
];

/** CSS properties permitted inside an inline `style=""` (drop the rest). */
const ALLOWED_STYLE_PROPS = new Set([
  "color",
  "background-color",
  "text-align",
  "font-family",
  "font-size",
  "line-height",
  "margin-inline-start",
  "list-style-type",
]);

let hooksInstalled = false;

function installHooks() {
  if (hooksInstalled) return;
  hooksInstalled = true;

  // Force safe link behaviour on every anchor.
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node.tagName === "A") {
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener noreferrer");
    }
    // Scope inline styles to the allowlist; strip anything else.
    const style = node.getAttribute?.("style");
    if (style) {
      const safe = style
        .split(";")
        .map((d) => d.trim())
        .filter(Boolean)
        .filter((d) => {
          const prop = d.split(":")[0]?.trim().toLowerCase();
          return prop ? ALLOWED_STYLE_PROPS.has(prop) : false;
        })
        .join("; ");
      if (safe) node.setAttribute("style", safe);
      else node.removeAttribute("style");
    }
  });
}

/**
 * Sanitize an HTML string for safe rendering. Plain-text input (no tags)
 * passes through unchanged, so legacy plain-text content keeps working.
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty) return "";
  installHooks();
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    // Only allow http(s), relative, mailto, and data:image URIs.
    ALLOWED_URI_REGEXP:
      /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.:-]|$)|data:image\/)/i,
  });
}

import { sanitizeHtml } from "@/lib/sanitize";

type RichContentProps = {
  /** HTML string. Legacy plain text is rendered safely as text. */
  html: string | null | undefined;
  /** `block` wraps in a `.prose` div with its own paragraph spacing;
   *  `inline` renders into an existing host without block wrappers. */
  variant?: "block" | "inline";
  dir?: "ltr" | "rtl";
  className?: string;
};

/**
 * Renders sanitized rich HTML. The ONLY approved place in the app to put
 * authored HTML into the DOM — always routes through `sanitizeHtml`.
 *
 * `inline` returns a <span> so it can live inside an existing <p>,
 * <blockquote>, or line-clamp container without breaking it.
 */
export function RichContent({
  html,
  variant = "block",
  dir,
  className,
}: RichContentProps) {
  const clean = sanitizeHtml(html ?? "");
  if (!clean) return null;

  if (variant === "inline") {
    // CMS rich text wraps content in block <p> elements. The inline variant is
    // hosted inside an existing <p>/<blockquote>, and a <p> nested in a <p> is
    // invalid HTML — the browser hoists the inner <p> out, corrupting the DOM
    // and breaking hydration (server markup ≠ browser-parsed DOM). Flatten the
    // block paragraphs to inline content with <br> breaks (see `.prose-inline
    // br { display: block }`) so the span is valid wherever it's hosted.
    //
    // Per-paragraph text-align (from the editor's alignment buttons, stored by
    // TipTap as `style="text-align:…"`) would be lost in a naive flatten, so a
    // paragraph that carries an alignment is converted to a block-level <span>
    // that keeps it instead of being dropped. Pure, deterministic string op →
    // identical output on server and client.
    const inlineClean = clean
      .replace(/<p\b([^>]*)>([\s\S]*?)<\/p>/gi, (_m, attrs: string, content: string) => {
        const align = /text-align:\s*(left|right|center|justify|start|end)/i.exec(attrs);
        return align
          ? `<span style="display:block;text-align:${align[1].toLowerCase()}">${content}</span>`
          : `${content}<br>`;
      })
      // Defensive: strip any stray/unbalanced <p> tags the pass above missed.
      .replace(/<\/?p(?:\s[^>]*)?>/gi, "")
      .replace(/(?:\s*<br>\s*)+$/i, "")
      .trim();
    if (!inlineClean) return null;
    return (
      <span
        dir={dir}
        className={`prose-inline ${className ?? ""}`}
        dangerouslySetInnerHTML={{ __html: inlineClean }}
      />
    );
  }
  return (
    <div
      dir={dir}
      className={`prose ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}

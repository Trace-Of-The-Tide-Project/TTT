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
    // br { display: block }`) so the span is valid wherever it's hosted. Pure,
    // deterministic string op → identical output on server and client.
    const inlineClean = clean
      .replace(/<p(?:\s[^>]*)?>/gi, "")
      .replace(/<\/p>/gi, "<br>")
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

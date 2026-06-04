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
    return (
      <span
        dir={dir}
        className={`prose-inline ${className ?? ""}`}
        dangerouslySetInnerHTML={{ __html: clean }}
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

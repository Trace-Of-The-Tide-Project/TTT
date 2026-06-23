import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { FirstWordGold } from "./FirstWordGold";

/**
 * Flatten a possibly-rich CMS string to plain text. Admin copy is
 * authored as HTML (the editor is a rich-text field), but the section
 * eyebrow / heading / subtitle are short plain-text slots — so strip
 * tags and decode the handful of entities that survive. Keeps a stray
 * `<p style=…>` from leaking markup into a heading.
 */
export function plainText(s: string | undefined): string | undefined {
  if (!s) return s;
  const out = s
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
  return out;
}

export type MagazineSectionProps = {
  /** Small uppercase label above the heading (e.g. "ISSUE"). Optional. */
  eyebrow?: string;
  /** Section heading — painted with the signature gold→strong gradient. */
  heading: string;
  /** One short line under the heading explaining the section. Optional. */
  subtitle?: string;
  /** Optional "view more" affordance on the trailing edge of the header. */
  viewMore?: { label: string; href: string };
  /** Anchor id for in-page links. */
  id?: string;
  children: ReactNode;
};

/**
 * Shared shell for every Magazine tab so the page reads as one calm,
 * consistent system instead of five differently-styled walls.
 *
 *   ┌ eyebrow ─────────────────────────── view more → ┐
 *   │ Heading (gold→strong gradient)                   │
 *   │ one-line subtitle                                │
 *   ├──────────────────────────────────────────────────┤
 *   │  …section content…                                │
 *   └──────────────────────────────────────────────────┘
 *
 * Header copy + the "view more" link are passed in already-localised,
 * so this stays a pure presentational component (no i18n/hooks) and
 * can render on the server. Everything is theme-token driven and
 * RTL-safe (the arrow mirrors, the layout uses logical flow order).
 *
 * The honeycomb motif lives once at the foot of the page (the
 * newsletter band), not behind every section — so sections stay clean.
 */
export function MagazineSection({
  eyebrow,
  heading,
  subtitle,
  viewMore,
  id,
  children,
}: MagazineSectionProps) {
  const eyebrowText = plainText(eyebrow);
  const headingText = plainText(heading) ?? "";
  const subtitleText = plainText(subtitle);

  return (
    <section id={id} className="relative w-full overflow-hidden">
      <div className="relative z-10 grid w-full gap-8 px-4 sm:gap-10 sm:px-6 md:px-8">
        <header className="flex w-full flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            {eyebrowText ? (
              <p
                className="mb-2 text-xs font-medium uppercase tracking-[0.18em]"
                style={{ color: "var(--tott-home-eyebrow)" }}
              >
                {eyebrowText}
              </p>
            ) : null}
            <h2 className="text-2xl font-medium tracking-tight sm:text-3xl">
              <FirstWordGold raw={headingText} />
            </h2>
            {subtitleText ? (
              <p
                className="mt-2 max-w-[52ch] text-sm sm:text-[0.95rem]"
                style={{ color: "var(--tott-home-text-muted)" }}
              >
                {subtitleText}
              </p>
            ) : null}
          </div>
          {viewMore ? (
            <Link
              href={viewMore.href}
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-80"
              style={{ color: "var(--tott-accent-gold)" }}
            >
              {viewMore.label}
              <span aria-hidden className="inline-block rtl:-scale-x-100">
                →
              </span>
            </Link>
          ) : null}
        </header>

        {children}
      </div>
    </section>
  );
}

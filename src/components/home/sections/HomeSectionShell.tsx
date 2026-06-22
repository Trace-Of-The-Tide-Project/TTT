import type { ReactNode } from "react";
import { theme } from "@/lib/theme";

/**
 * Standard framing for a homepage rail/section: a themed full-bleed
 * band with a constrained header (eyebrow + heading + optional
 * subheading + "view all" link) and a content slot. Keeps every section
 * visually consistent while each owns its own card layout. Semantic
 * `<section>` with an `aria-labelledby` heading.
 *
 * Server component — no client state. The id is derived from the
 * heading so the reading-view TOC pattern (and in-page anchors) can
 * target it; callers pass a stable `anchorId`.
 */
export function HomeSectionShell({
  anchorId,
  eyebrow,
  heading,
  subheading,
  viewAllHref,
  viewAllLabel,
  surface = theme.homeSurface,
  children,
  dir,
}: {
  anchorId: string;
  eyebrow?: string;
  heading: string;
  subheading?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  surface?: string;
  children: ReactNode;
  dir?: "rtl" | "ltr";
}) {
  const headingId = `${anchorId}-heading`;
  return (
    <section
      id={anchorId}
      aria-labelledby={headingId}
      dir={dir}
      className="relative overflow-x-hidden py-12 sm:py-16"
      style={{ backgroundColor: surface }}
    >
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <header className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            {eyebrow ? (
              <span
                className="text-xs font-semibold uppercase tracking-[0.18em]"
                style={{ color: theme.accentGold }}
              >
                {eyebrow}
              </span>
            ) : null}
            <h2
              id={headingId}
              className="text-2xl font-medium leading-tight text-foreground sm:text-3xl"
              style={{ fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)" }}
            >
              {heading}
            </h2>
            {subheading ? (
              <p className="max-w-2xl text-sm leading-relaxed text-[var(--tott-muted)]">
                {subheading}
              </p>
            ) : null}
          </div>
          {viewAllHref ? (
            <a
              href={viewAllHref}
              className="shrink-0 whitespace-nowrap text-sm font-medium hover:underline"
              style={{ color: theme.accentGold }}
            >
              {viewAllLabel ?? "View all"} <span aria-hidden>→</span>
            </a>
          ) : null}
        </header>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

import type { ReactNode } from "react";

/**
 * Homepage-rebuild section frame (rebuild Sessions 0–6; the old homepage
 * uses sections/HomeSectionShell.tsx — leave that one alone).
 *
 * Semantic <section> with aria-labelledby, shared vertical rhythm, and a
 * constrained header. `fullBleed` unconstrains only the children slot —
 * the header stays constrained. All colors/type come from --tott-* tokens;
 * never hardcode hex in sections. Layout uses logical properties only.
 *
 * Server component — no client state. Direction cascades from html[dir].
 */
export function SectionShell({
  id,
  eyebrow,
  title,
  standfirst,
  fullBleed = false,
  children,
  className,
}: {
  /** Stable anchor id; heading id derives as `${id}-heading`. */
  id: string;
  eyebrow?: string;
  /** Omit when the section owns its own heading (e.g. Hero's <h1>). */
  title?: string;
  standfirst?: string;
  /** Children span the full viewport width; header stays constrained. */
  fullBleed?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const headingId = title ? `${id}-heading` : undefined;
  const hasHeader = Boolean(eyebrow || title || standfirst);
  return (
    <section id={id} aria-labelledby={headingId} className={`py-16 sm:py-24 ${className ?? ""}`}>
      {hasHeader ? (
        <header className="mx-auto max-w-6xl px-6 sm:px-10">
          {eyebrow ? (
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--tott-gold-muted)]">
              {eyebrow}
            </span>
          ) : null}
          {title ? (
            <h2
              id={headingId}
              className="mt-2 font-display text-3xl text-[var(--tott-home-text-warm)] sm:text-4xl"
              style={{
                lineHeight: "var(--tott-display-leading)",
                letterSpacing: "var(--tott-display-tracking)",
              }}
            >
              {title}
            </h2>
          ) : null}
          {standfirst ? (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--tott-salt)]">
              {standfirst}
            </p>
          ) : null}
        </header>
      ) : null}
      <div className={fullBleed ? "mt-10" : "mx-auto mt-10 max-w-6xl px-6 sm:px-10"}>
        {children}
      </div>
    </section>
  );
}

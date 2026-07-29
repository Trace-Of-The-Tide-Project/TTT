/**
 * Editorial section divider: a thin gold hairline with a small centered
 * hex glyph, used between major storytelling sections instead of a hard
 * background-color seam. Purely decorative — aria-hidden.
 */
export function V3SectionDivider() {
  return (
    <div aria-hidden className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-2 sm:px-10">
      <span
        className="h-px flex-1"
        style={{
          background:
            "linear-gradient(to var(--tott-divider-to, right), transparent, var(--tott-card-border), transparent)",
        }}
      />
      <span
        className="h-1.5 w-1.5 rotate-45"
        style={{ backgroundColor: "var(--tott-gold-muted)" }}
      />
      <span
        className="h-px flex-1"
        style={{
          background:
            "linear-gradient(to var(--tott-divider-to, right), transparent, var(--tott-card-border), transparent)",
        }}
      />
    </div>
  );
}

"use client";

/** Renders a heading string with the magazine's signature two-tone
 * gold-to-strong gradient — gold radial bleeds in from the left edge
 * and fades into the page's strong text color across the width of
 * the text. Theme-aware: the strong-color base swaps automatically
 * with the page surface, so the gradient reads correctly on dark
 * (gold → near-white) and light (gold → near-black). The parent
 * element controls font size / weight; this just paints the text. */
export function FirstWordGold({ raw }: { raw: string }) {
  return (
    <span
      style={{
        backgroundImage:
          "radial-gradient(100% 100% at 0% 50%, var(--tott-accent-gold) 0%, rgba(0, 0, 0, 0) 50%)",
        backgroundColor: "var(--tott-home-text-strong)",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
        color: "transparent",
      }}
    >
      {raw}
    </span>
  );
}

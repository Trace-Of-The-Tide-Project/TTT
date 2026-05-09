"use client";

/**
 * Decorative masked hex-pattern backdrop. Fills its parent and renders
 * the homepage-share-hex-pattern.svg as a CSS mask, so the pattern
 * cells stay at full size and pick up the theme-aware
 * --tott-home-hex-stroke colour. Same approach as the home page's
 * "Share your story" band.
 *
 * The pattern bleeds wider than the parent on small viewports (140%)
 * and tightens to 100% on md+; the parent is expected to have
 * `overflow-hidden` to clip the bleed.
 */
export function HexPatternBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      <div
        className="w-[min(140%,1232px)] max-w-none sm:w-[min(120%,1232px)] md:w-[min(100%,1232px)]"
        style={{
          aspectRatio: "1232 / 294",
          backgroundColor: "var(--tott-home-hex-stroke)",
          WebkitMaskImage: "url(/images/home/homepage-share-hex-pattern.svg)",
          maskImage: "url(/images/home/homepage-share-hex-pattern.svg)",
          WebkitMaskSize: "100% 100%",
          maskSize: "100% 100%",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
        }}
      />
    </div>
  );
}

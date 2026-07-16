"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Horizontal drag/scroll carousel with prev/next buttons. Shared by the
 * issues, books, and videos rows.
 *
 * - No CSS scroll-snap (conflicts with Lenis, per the homepage contract).
 * - Native horizontal scroll handles touch/trackpad drag.
 * - Buttons scroll by ~90% of the visible width. `scrollBy` with a
 *   direction-aware delta works across LTR and RTL because the browser
 *   normalizes the sign to the visual direction for `scrollBy`.
 * - The whole track lives in its own overflow-x container so it never
 *   pushes the page body into horizontal scroll.
 */
export function MagCarousel({
  children,
  prevLabel,
  nextLabel,
}: {
  children: ReactNode;
  prevLabel: string;
  nextLabel: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    // Normalize scroll position to a 0..max magnitude regardless of RTL sign.
    const max = el.scrollWidth - el.clientWidth;
    const pos = Math.abs(el.scrollLeft);
    setAtStart(pos <= 1);
    setAtEnd(pos >= max - 1 || max <= 0);
  }, []);

  useEffect(() => {
    update();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const scrollByDir = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const isRtl = getComputedStyle(el).direction === "rtl";
    const amount = el.clientWidth * 0.9 * dir * (isRtl ? -1 : 1);
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="flex gap-5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      {/* Buttons: logical start = prev, logical end = next. Hidden on touch
          via pointer media query classes; disabled at the edges. */}
      <div className="pointer-events-none absolute inset-y-0 start-0 end-0 hidden items-center justify-between sm:flex">
        <button
          type="button"
          aria-label={prevLabel}
          onClick={() => scrollByDir(-1)}
          disabled={atStart}
          className="pointer-events-auto -ms-3 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--tott-card-border)] bg-[color-mix(in_srgb,var(--tott-well-bg)_78%,transparent)] text-[var(--tott-home-text-warm)] backdrop-blur transition-opacity hover:border-[var(--tott-accent-gold)] disabled:pointer-events-none disabled:opacity-0"
        >
          <Chevron dir="start" />
        </button>
        <button
          type="button"
          aria-label={nextLabel}
          onClick={() => scrollByDir(1)}
          disabled={atEnd}
          className="pointer-events-auto -me-3 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--tott-card-border)] bg-[color-mix(in_srgb,var(--tott-well-bg)_78%,transparent)] text-[var(--tott-home-text-warm)] backdrop-blur transition-opacity hover:border-[var(--tott-accent-gold)] disabled:pointer-events-none disabled:opacity-0"
        >
          <Chevron dir="end" />
        </button>
      </div>
    </div>
  );
}

/**
 * Chevron that points toward the logical start or end. Uses `rtl:` variants
 * so it flips with the document direction, keeping "next" always pointing
 * to the reading-forward edge.
 */
function Chevron({ dir }: { dir: "start" | "end" }) {
  const points = dir === "start" ? "15 18 9 12 15 6" : "9 18 15 12 9 6";
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="rtl:-scale-x-100"
      aria-hidden
    >
      <polyline points={points} />
    </svg>
  );
}

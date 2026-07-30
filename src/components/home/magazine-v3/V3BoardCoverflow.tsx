"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { TOTT_AUTH_HEX_CLIP_PATH } from "@/components/auth/shared/authHexClipPath";
import { dirFor } from "@/i18n/dir";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { HeroSlide } from "./V3Hero";

/**
 * 3D coverflow for the Board writers strip: active card centered/scaled,
 * side cards rotated and receded, dot pagination + prev/next pill below.
 * Hex-clipped instead of the usual rounded-rectangle coverflow card.
 *
 * RTL-aware: `isRtl` flips both the rotateY direction (so the "far" side
 * still recedes away from the reader) and the prev/next button mapping,
 * same convention as MagCarousel's scrollByDir sign flip.
 */
export function V3BoardCoverflow({
  slides,
  prevLabel,
  nextLabel,
  isRtl,
}: {
  slides: HeroSlide[];
  prevLabel: string;
  nextLabel: string;
  isRtl: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(() => Math.floor((slides.length - 1) / 2));
  const [paused, setPaused] = useState(false);
  const flip = isRtl ? -1 : 1;

  const goTo = (index: number) => setActiveIndex(Math.max(0, Math.min(slides.length - 1, index)));
  const toPrev = () => goTo(activeIndex - 1);
  const toNext = () => goTo(activeIndex + 1);

  // Autoplay: advance every 5s, looping back to the start. Paused on
  // hover/focus so it doesn't fight a reader who's actively browsing, and
  // disabled entirely under reduced motion.
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || paused || slides.length <= 1) return;
    const id = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, [reduced, paused, slides.length]);

  if (slides.length === 0) return null;

  return (
    <div
      className="flex w-full flex-col items-center"
      style={{ perspective: "1600px" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        className="relative flex h-[420px] w-full items-center justify-center"
        style={{ transformStyle: "preserve-3d" }}
      >
        {slides.map((slide, i) => {
          const offset = i - activeIndex;
          const absOffset = Math.abs(offset);
          const isActive = offset === 0;
          const isPast = offset < 0;

          return (
            <motion.div
              key={slide.id}
              className="absolute h-[362px] w-[340px]"
              initial={false}
              animate={{
                x: offset * 130 * flip,
                rotateY: isActive ? 0 : (isPast ? 38 : -38) * flip,
                z: isActive ? 60 : -absOffset * 70,
                scale: isActive ? 1 : Math.max(0.68, 1 - absOffset * 0.15),
                opacity: absOffset > 3 ? 0 : 1 - absOffset * 0.22,
              }}
              transition={{ type: "spring", stiffness: 220, damping: 26 }}
              style={{ zIndex: 100 - absOffset, pointerEvents: isActive ? "auto" : "none" }}
            >
              <Link
                href={slide.href}
                className="group relative block h-full w-full overflow-hidden outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--tott-accent-gold-focus)]"
                style={{ clipPath: TOTT_AUTH_HEX_CLIP_PATH }}
                tabIndex={isActive ? 0 : -1}
              >
                <div className="absolute inset-0 bg-[var(--tott-elevated)]" />
                {slide.avatar ? (
                  <Image src={slide.avatar} alt="" fill sizes="340px" className="object-cover" />
                ) : null}
                <div
                  className="absolute inset-x-0 bottom-0 flex h-[200px] flex-col items-center justify-end px-8 pb-20 pt-8 backdrop-blur-[2px]"
                  style={{
                    background:
                      "linear-gradient(to bottom, rgba(23,23,23,0) 0%, rgba(23,23,23,0.64) 50%, rgba(23,23,23,0.88) 100%)",
                  }}
                >
                  <p
                    dir={dirFor(slide.lang)}
                    className="line-clamp-2 w-full text-center font-['IBM_Plex_Sans'] text-[24px] font-medium leading-[32px] text-white"
                    style={{ textShadow: "0 1px 2px rgba(0,0,0,0.24)" }}
                  >
                    {slide.name}
                  </p>
                </div>
                <div
                  className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-[var(--tott-card-border)]"
                  style={{ clipPath: TOTT_AUTH_HEX_CLIP_PATH }}
                />
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Pagination pill: prev, dots, next — logical start/end via flip so it
          matches the reading direction, same convention MagCarousel uses. */}
      <div className="z-20 mt-6 flex w-fit items-center justify-center gap-2 rounded-full border border-[var(--tott-card-border)] bg-[color-mix(in_srgb,var(--tott-well-bg)_78%,transparent)] px-1.5 py-1 backdrop-blur">
        <button
          type="button"
          aria-label={prevLabel}
          onClick={toPrev}
          disabled={activeIndex === 0}
          className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--tott-home-text-warm)] transition-colors hover:bg-white/10 disabled:pointer-events-none disabled:opacity-30"
        >
          <Chevron dir="start" />
        </button>
        <div className="flex items-center justify-center gap-1">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              aria-label={slide.name}
              aria-current={activeIndex === i}
              onClick={() => goTo(i)}
              className={`h-1 rounded-full transition-all duration-300 ${
                activeIndex === i
                  ? "w-4 bg-[var(--tott-accent-gold-focus)]"
                  : "w-1 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          aria-label={nextLabel}
          onClick={toNext}
          disabled={activeIndex === slides.length - 1}
          className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--tott-home-text-warm)] transition-colors hover:bg-white/10 disabled:pointer-events-none disabled:opacity-30"
        >
          <Chevron dir="end" />
        </button>
      </div>
    </div>
  );
}

function Chevron({ dir }: { dir: "start" | "end" }) {
  const points = dir === "start" ? "15 18 9 12 15 6" : "9 18 15 12 9 6";
  return (
    <svg
      width={14}
      height={14}
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

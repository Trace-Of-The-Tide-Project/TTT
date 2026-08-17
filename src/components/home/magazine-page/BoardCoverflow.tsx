"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { dirFor } from "@/i18n/dir";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { HeroSlide } from "./Hero";

const CARD_PITCH = 272; // Figma spacing between card left edges (264 + 8 gap)
const CARD_PITCH_MOBILE = 228; // 220 card + 8 gap, for narrow viewports below `sm`
const CARD_SIZE = { width: 264, height: 281 };
const CARD_SIZE_MOBILE = { width: 220, height: 235 };

// Same silk-hex frame as FeaturedHexCard — home "Follow our Writers" /
// writing-room "Discover Featured Writing" rows use it too, so all writer
// rails read as one system.
const WRITER_CARD = "/images/home/Image-2.png";
const WRITER_TOP_ICON = "/images/home/Icon-4.svg";
// Clip the avatar to the silk-hex silhouette using the frame PNG's own
// alpha as a mask — pixel-accurate against the art (a hand-authored
// clip-path polygon drifts from it at odd sizes).
const HEX_PHOTO_MASK: CSSProperties = {
  WebkitMaskImage: `url(${WRITER_CARD})`,
  maskImage: `url(${WRITER_CARD})`,
  WebkitMaskSize: "100% auto",
  maskSize: "100% auto",
  WebkitMaskPosition: "center center",
  maskPosition: "center center",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
};

/**
 * Flat slider for the Board writers strip (Figma: 6 cards, 264×281, fixed
 * pitch, no depth) — a horizontal translate track rather than the coverflow
 * this used to be, plus dedicated 40×40 prev/next arrow buttons flanking
 * the row (Figma `Slide Navigator Button`) instead of a dot-pagination
 * pill. Card silhouette is the shared silk-hex frame (`FeaturedHexCard`'s
 * Image-2.png + mask technique) instead of a hand-authored clip-path.
 *
 * RTL-aware: `isRtl` flips both the track direction and the prev/next
 * button mapping, same convention as MagCarousel's scrollByDir sign flip.
 */
export function BoardCoverflow({
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
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const flip = isRtl ? -1 : 1;

  // How many full cards fit in the viewport track — derived from live
  // container width so the max index can stop at "last card flush with
  // the edge" instead of always centering the active card (which leaves
  // blank track past the last card once there's nothing left to center
  // against on one side).
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [visibleCount, setVisibleCount] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const cardPitch = isMobile ? CARD_PITCH_MOBILE : CARD_PITCH;
  const cardSize = isMobile ? CARD_SIZE_MOBILE : CARD_SIZE;

  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const measure = () => {
      const mobile = el.clientWidth < 640;
      setIsMobile(mobile);
      const pitch = mobile ? CARD_PITCH_MOBILE : CARD_PITCH;
      setVisibleCount(Math.max(1, Math.round(el.clientWidth / pitch)));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const maxIndex = Math.max(0, slides.length - visibleCount);
  useEffect(() => {
    queueMicrotask(() => setActiveIndex((i) => Math.min(i, maxIndex)));
  }, [maxIndex]);

  const goTo = (index: number) => setActiveIndex(Math.max(0, Math.min(maxIndex, index)));
  const toPrev = () => goTo(activeIndex - 1);
  const toNext = () => goTo(activeIndex + 1);

  // Autoplay: advance every 5s, looping back to the start. Paused on
  // hover/focus so it doesn't fight a reader who's actively browsing, and
  // disabled entirely under reduced motion.
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || paused || slides.length <= 1) return;
    const id = window.setInterval(() => {
      setActiveIndex((i) => (i >= maxIndex ? 0 : i + 1));
    }, 8000);
    return () => window.clearInterval(id);
  }, [reduced, paused, slides.length, maxIndex]);

  if (slides.length === 0) return null;

  return (
    <div
      className="relative flex w-full items-center justify-center gap-4 px-6 sm:px-10 lg:px-16"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <button
        type="button"
        aria-label={prevLabel}
        onClick={toPrev}
        disabled={activeIndex === 0}
        className="z-20 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--tott-card-border)] bg-[color-mix(in_srgb,var(--tott-well-bg)_78%,transparent)] text-[var(--tott-home-text-warm)] backdrop-blur transition-colors hover:bg-white/10 disabled:pointer-events-none disabled:opacity-30"
      >
        <Chevron dir="start" />
      </button>

      <div
        ref={viewportRef}
        className="relative flex-1 overflow-hidden"
        style={{ height: `${cardSize.height}px` }}
      >
        <div
          className="absolute inset-y-0 start-0 flex items-center gap-2"
          style={{
            transform: `translateX(${-activeIndex * cardPitch * flip}px)`,
            transition: "transform 0.9s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {slides.map((slide, i) => (
            <Link
              key={slide.id}
              href={slide.href}
              className="group relative block shrink-0 outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--tott-accent-gold-focus)]"
              style={{ width: `${cardSize.width}px`, height: `${cardSize.height}px` }}
              tabIndex={i === activeIndex ? 0 : -1}
            >
              {/* Silk hex frame — base fill so a real photo (layered on top
                  below) isn't washed out by the silk texture. */}
              <Image
                src={WRITER_CARD}
                alt=""
                fill
                className="select-none object-contain"
                sizes="(max-width: 640px) 220px, 264px"
                draggable={false}
              />
              {slide.avatar ? (
                <Image
                  src={slide.avatar}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 220px, 264px"
                  className="absolute inset-0 select-none object-cover"
                  style={HEX_PHOTO_MASK}
                  draggable={false}
                />
              ) : null}

              <div
                aria-hidden
                className="absolute z-10"
                style={
                  isMobile
                    ? { width: "34px", height: "34px", left: "calc(50% - 17px)", top: "6px" }
                    : { width: "40px", height: "40px", left: "calc(50% - 20px)", top: "8px" }
                }
              >
                <Image src={WRITER_TOP_ICON} alt="" fill sizes="40px" className="select-none" draggable={false} />
              </div>

              <div
                className="absolute bottom-0 left-0 z-10 flex w-full flex-col items-center justify-end"
                style={{
                  height: "55.78%",
                  padding: "24px 24px 40px",
                  background: "var(--tott-writer-card-fade)",
                }}
              >
                <p
                  dir={dirFor(slide.lang)}
                  className="line-clamp-2 w-full text-center font-['IBM_Plex_Sans'] text-[20px] font-medium leading-[28px] text-[var(--tott-home-text-strong)]"
                  style={{ textShadow: "var(--tott-home-text-shadow)" }}
                >
                  {slide.name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <button
        type="button"
        aria-label={nextLabel}
        onClick={toNext}
        disabled={activeIndex >= maxIndex}
        className="z-20 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--tott-card-border)] bg-[color-mix(in_srgb,var(--tott-well-bg)_78%,transparent)] text-[var(--tott-home-text-warm)] backdrop-blur transition-colors hover:bg-white/10 disabled:pointer-events-none disabled:opacity-30"
      >
        <Chevron dir="end" />
      </button>
    </div>
  );
}

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

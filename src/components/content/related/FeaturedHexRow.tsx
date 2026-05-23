"use client";
/* eslint-disable react-hooks/set-state-in-effect -- carousel snaps its index back into range when the item-list size changes */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { FirstWordGold } from "@/components/home/magazine/FirstWordGold";
import { FeaturedHexCard, type FeaturedHexItem } from "./FeaturedHexCard";

// Ghost-fade filler that masks the next/previous hexagon peeking in
// from off-screen. Same asset as the writing-room carousel.
const FILLER = "/images/home/Content Grid Filler.png";
const CAROUSEL_TRANSITION_MS = 400;
const GHOST_WIDTH = 138;
const SMALL_CARD_W_CSS = "min(85vw, 276px)";
const SMALL_CARD_GAP = 24;

function SmallCardSlot({ item, isActive }: { item: FeaturedHexItem; isActive: boolean }) {
  return (
    <div
      className="shrink-0"
      style={{ width: SMALL_CARD_W_CSS, opacity: isActive ? 1 : 0.45, transition: "opacity 400ms ease" }}
      aria-hidden={isActive ? undefined : true}
    >
      <FeaturedHexCard
        title={item.title}
        author={item.author}
        coverImage={item.coverImage}
        chipLabel={item.chipLabel}
        href={item.href}
      />
    </div>
  );
}

/** Round gold ← / → arrow pair for the small-screen carousel. */
function SmallNavArrows({ onPrev, onNext }: { onPrev: () => void; onNext: () => void }) {
  return (
    <div className="flex items-center" style={{ gap: "80px" }}>
      <button
        type="button"
        aria-label="Previous"
        onClick={onPrev}
        className="flex h-10 w-10 items-center justify-center rounded-full transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tott-accent-gold)]"
        style={{ border: "2px solid var(--tott-accent-gold)", color: "var(--tott-accent-gold)" }}
      >
        <span aria-hidden className="text-xl">
          ←
        </span>
      </button>
      <button
        type="button"
        aria-label="Next"
        onClick={onNext}
        className="flex h-10 w-10 items-center justify-center rounded-full transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tott-accent-gold)]"
        style={{ border: "2px solid var(--tott-accent-gold)", color: "var(--tott-accent-gold)" }}
      >
        <span aria-hidden className="text-xl">
          →
        </span>
      </button>
    </div>
  );
}

const ArrowRight = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="13 6 19 12 13 18" />
  </svg>
);

type FeaturedHexRowProps = {
  items: FeaturedHexItem[];
  heading: string;
  subtitle?: string;
  viewMoreHref?: string;
  viewMoreLabel?: string;
};

/**
 * Silk-hex circular carousel — the same row the writing-room
 * "Discover Featured Writing" section uses (`FeaturedWritingRow`),
 * lifted into a reusable component. On xl viewports it breaks out of
 * the page container to span the full screen and behaves as a circular
 * gallery (ghost-faded edges + prev/next arrows that loop); below xl it
 * falls back to a single-card centred carousel. The consumer must place
 * this inside an `overflow-x-hidden` ancestor (the xl row is 100vw).
 */
export function FeaturedHexRow({ items, heading, subtitle, viewMoreHref, viewMoreLabel }: FeaturedHexRowProps) {
  const itemCount = items.length;
  const [visible, setVisible] = useState(4);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setVisible(w >= 1920 ? 6 : w >= 1600 ? 5 : 4);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  const hasCarousel = itemCount > visible;
  const hasSmallCarousel = itemCount > 1;
  const [position, setPosition] = useState(0);
  const [active, setActive] = useState(0);
  const [animate, setAnimate] = useState(true);
  const wrapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setPosition((p) => (p >= itemCount || p < 0 ? 0 : p));
    setActive((a) => (a >= itemCount || a < 0 ? 0 : a));
  }, [itemCount]);

  useEffect(() => {
    return () => {
      if (wrapTimer.current) clearTimeout(wrapTimer.current);
    };
  }, []);

  const goNext = () => {
    if (itemCount <= 1) return;
    if (wrapTimer.current) return;
    if (position >= itemCount - 1) {
      setPosition(itemCount);
      setActive(0);
      wrapTimer.current = setTimeout(() => {
        setAnimate(false);
        setPosition(0);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setAnimate(true);
            wrapTimer.current = null;
          });
        });
      }, CAROUSEL_TRANSITION_MS);
    } else {
      setPosition((p) => p + 1);
      setActive((a) => a + 1);
    }
  };

  const goPrev = () => {
    if (itemCount <= 1) return;
    if (wrapTimer.current) return;
    if (position <= 0) {
      setPosition(-1);
      setActive(itemCount - 1);
      wrapTimer.current = setTimeout(() => {
        setAnimate(false);
        setPosition(itemCount - 1);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setAnimate(true);
            wrapTimer.current = null;
          });
        });
      }, CAROUSEL_TRANSITION_MS);
    } else {
      setPosition((p) => p - 1);
      setActive((a) => a - 1);
    }
  };

  return (
    <section aria-label={heading}>
      <header className="mx-auto flex max-w-6xl items-start justify-between gap-4 px-6 sm:px-10">
        <div className="flex flex-col" style={{ gap: "4px" }}>
          <h2
            className="min-[1600px]:text-[28px]! min-[1920px]:text-[32px]!"
            style={{
              fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
              fontWeight: 500,
              fontSize: "clamp(1rem, 2vw, 1.125rem)",
              lineHeight: 1.35,
              margin: 0,
            }}
          >
            <FirstWordGold raw={heading} />
          </h2>
          {subtitle ? <p className="text-sm text-[var(--tott-muted)]">{subtitle}</p> : null}
        </div>
        {viewMoreHref ? (
          <Link
            href={viewMoreHref}
            className="flex shrink-0 items-center gap-1 text-sm font-medium hover:underline"
            style={{ color: "var(--tott-accent-gold)" }}
          >
            {viewMoreLabel ?? "View more"} <ArrowRight />
          </Link>
        ) : null}
      </header>

      {/* Mobile / tablet / lg — single-card centred carousel. */}
      <div className="mt-8 xl:hidden">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-6 sm:px-10" style={{ padding: "16px 0 8px", gap: "24px" }}>
          <div className="relative w-full overflow-hidden" role="region" aria-label={heading} aria-roledescription="carousel">
            <div
              className="flex"
              style={{
                gap: `${SMALL_CARD_GAP}px`,
                justifyContent: hasSmallCarousel ? "flex-start" : "center",
                transform: hasSmallCarousel
                  ? `translateX(calc(50% - ${itemCount + position} * (${SMALL_CARD_W_CSS} + ${SMALL_CARD_GAP}px) - ${SMALL_CARD_W_CSS} / 2))`
                  : undefined,
                transition: animate ? `transform ${CAROUSEL_TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)` : "none",
              }}
            >
              {hasSmallCarousel ? (
                <>
                  {items.map((item) => (
                    <SmallCardSlot key={`s-pre-${item.id}`} item={item} isActive={false} />
                  ))}
                  {items.map((item, i) => (
                    <SmallCardSlot key={`s-real-${item.id}`} item={item} isActive={i === active} />
                  ))}
                  {items.map((item) => (
                    <SmallCardSlot key={`s-post-${item.id}`} item={item} isActive={false} />
                  ))}
                </>
              ) : (
                items.map((item) => <SmallCardSlot key={`s-${item.id}`} item={item} isActive />)
              )}
            </div>
          </div>

          {hasSmallCarousel ? <SmallNavArrows onPrev={goPrev} onNext={goNext} /> : null}
        </div>
      </div>

      {/* xl+ — full-bleed circular gallery. */}
      <div
        className="relative mt-8 hidden overflow-hidden xl:block [--carousel-card-w:276px] [--carousel-gap:8px] min-[1600px]:[--carousel-card-w:320px] min-[1600px]:[--carousel-gap:12px] min-[1920px]:[--carousel-card-w:360px] min-[1920px]:[--carousel-gap:16px]"
        style={{ width: "100vw", marginLeft: "calc(50% - 50vw)", marginRight: "calc(50% - 50vw)" }}
      >
        <div
          className="relative mx-auto"
          style={{
            width: `calc(${Math.min(visible, itemCount)} * var(--carousel-card-w) + ${Math.max(0, Math.min(visible, itemCount) - 1)} * var(--carousel-gap))`,
          }}
        >
          <div className="relative overflow-hidden">
            <div
              className="relative flex items-start"
              style={{
                gap: "var(--carousel-gap)",
                transform: hasCarousel
                  ? `translateX(calc(-1 * ${itemCount + position} * (var(--carousel-card-w) + var(--carousel-gap))))`
                  : undefined,
                transition: animate ? `transform ${CAROUSEL_TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)` : "none",
                justifyContent: hasCarousel ? "flex-start" : "center",
              }}
            >
              {hasCarousel ? (
                <>
                  {items.map((item) => (
                    <FeaturedHexCard key={`pre-${item.id}`} title={item.title} author={item.author} coverImage={item.coverImage} chipLabel={item.chipLabel} href={item.href} />
                  ))}
                  {items.map((item) => (
                    <FeaturedHexCard key={`real-${item.id}`} title={item.title} author={item.author} coverImage={item.coverImage} chipLabel={item.chipLabel} href={item.href} />
                  ))}
                  {items.map((item) => (
                    <FeaturedHexCard key={`post-${item.id}`} title={item.title} author={item.author} coverImage={item.coverImage} chipLabel={item.chipLabel} href={item.href} />
                  ))}
                </>
              ) : (
                items.map((item) => (
                  <FeaturedHexCard key={`d-${item.id}`} title={item.title} author={item.author} coverImage={item.coverImage} chipLabel={item.chipLabel} href={item.href} />
                ))
              )}
            </div>
          </div>

          {hasCarousel ? (
            <>
              <div
                aria-hidden
                className="pointer-events-none absolute top-0 z-10 min-[1600px]:w-40! min-[1600px]:h-[341px]! min-[1600px]:-left-[176px]! min-[1920px]:w-[180px]! min-[1920px]:h-[384px]! min-[1920px]:-left-[196px]!"
                style={{ left: `-${GHOST_WIDTH + 16}px`, width: `${GHOST_WIDTH}px`, height: "294px" }}
              >
                <Image
                  src={FILLER}
                  alt=""
                  fill
                  className="select-none object-cover"
                  style={{ transform: "scaleX(-1)", filter: "var(--tott-image-invert)" }}
                  sizes="(min-width: 1920px) 180px, (min-width: 1600px) 160px, 138px"
                  draggable={false}
                />
              </div>

              <div
                aria-hidden
                className="pointer-events-none absolute top-0 z-10 min-[1600px]:w-40! min-[1600px]:h-[341px]! min-[1600px]:-right-[176px]! min-[1920px]:w-[180px]! min-[1920px]:h-[384px]! min-[1920px]:-right-[196px]!"
                style={{ right: `-${GHOST_WIDTH + 16}px`, width: `${GHOST_WIDTH}px`, height: "294px" }}
              >
                <Image
                  src={FILLER}
                  alt=""
                  fill
                  className="select-none object-cover"
                  style={{ filter: "var(--tott-image-invert)" }}
                  sizes="(min-width: 1920px) 180px, (min-width: 1600px) 160px, 138px"
                  draggable={false}
                />
              </div>
            </>
          ) : null}

          {hasCarousel ? (
            <>
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous"
                className="absolute z-20 flex items-center justify-center transition-opacity hover:opacity-80 min-[1600px]:w-12! min-[1600px]:h-12! min-[1600px]:top-[148px]! min-[1600px]:-left-24! min-[1920px]:w-14! min-[1920px]:h-14! min-[1920px]:top-[165px]! min-[1920px]:-left-28!"
                style={{
                  width: "40px",
                  height: "40px",
                  left: "-72px",
                  top: "127px",
                  borderRadius: "999px",
                  backgroundColor: "var(--tott-panel-bg)",
                  border: "1px solid var(--tott-card-border)",
                  color: "var(--tott-home-text-strong)",
                  boxShadow: "0px 1px 3px rgba(23, 23, 23, 0.4)",
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="11 6 5 12 11 18" />
                </svg>
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Next"
                className="absolute z-20 flex items-center justify-center transition-opacity hover:opacity-80 min-[1600px]:w-12! min-[1600px]:h-12! min-[1600px]:top-[148px]! min-[1600px]:-right-24! min-[1920px]:w-14! min-[1920px]:h-14! min-[1920px]:top-[165px]! min-[1920px]:-right-28!"
                style={{
                  width: "40px",
                  height: "40px",
                  right: "-72px",
                  top: "127px",
                  borderRadius: "999px",
                  backgroundColor: "var(--tott-panel-bg)",
                  border: "1px solid var(--tott-card-border)",
                  color: "var(--tott-home-text-strong)",
                  boxShadow: "0px 1px 3px rgba(23, 23, 23, 0.4)",
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="13 6 19 12 13 18" />
                </svg>
              </button>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}

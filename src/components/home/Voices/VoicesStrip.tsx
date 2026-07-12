"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, type Variants } from "motion/react";
import { Link } from "@/i18n/navigation";
import { reveal, staggerParent } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export type VoiceCard = {
  id: string;
  name: string;
  headline: string | null;
  avatar: string | null;
  href: string;
};

/** First grapheme of up to two name words — spread handles surrogate pairs,
 * and a single first char keeps Arabic letterforms intact. */
function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => [...part][0] ?? "")
    .join("");
}

/* Strip start/end aligns with SectionShell's constrained header
 * (max-w-6xl px-6 sm:px-10) while staying full-bleed scrollable. */
const EDGE_PAD =
  "ps-6 pe-6 sm:ps-[max(2.5rem,calc((100vw-72rem)/2+2.5rem))] sm:pe-[max(2.5rem,calc((100vw-72rem)/2+2.5rem))]";

const ARROW_BUTTON_CLASS =
  "grid h-10 w-10 shrink-0 place-items-center border border-[color-mix(in_srgb,var(--tott-salt)_35%,transparent)] text-[var(--tott-gold-primary)] transition-colors hover:border-[var(--tott-gold-muted)] hover:text-[var(--tott-gold-bright)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tott-gold-bright)] disabled:cursor-default disabled:opacity-35 disabled:hover:border-[color-mix(in_srgb,var(--tott-salt)_35%,transparent)] disabled:hover:text-[var(--tott-gold-primary)]";

function ArrowIcon({ className }: { className: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        d="M2 8h11M9 3.5 13.5 8 9 12.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function VoicesStrip({
  cards,
  rtl,
  prevLabel,
  nextLabel,
}: {
  cards: VoiceCard[];
  rtl: boolean;
  prevLabel: string;
  nextLabel: string;
}) {
  const reduced = useReducedMotion();
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef<{
    startX: number;
    startScroll: number;
    moved: boolean;
  } | null>(null);
  const suppressClick = useRef(false);
  const [dragging, setDragging] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  // In RTL, scrollLeft runs 0 → negative (spec behavior in all modern
  // browsers), so bounds use Math.abs and scrollBy flips its sign.
  const updateEdges = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const pos = Math.abs(el.scrollLeft);
    setAtStart(pos <= 1);
    setAtEnd(pos >= max - 1);
  }, []);

  useEffect(() => {
    updateEdges();
    const el = scrollerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(updateEdges);
    observer.observe(el);
    return () => observer.disconnect();
  }, [updateEdges]);

  const scrollByDir = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const step = Math.max(el.clientWidth * 0.8, 240);
    el.scrollBy({
      left: (rtl ? -1 : 1) * dir * step,
      behavior: reduced ? "auto" : "smooth",
    });
  };

  // Drag-to-scroll for mouse only — touch keeps native scrolling, and
  // scrollLeft deltas are direction-agnostic so no RTL branch is needed.
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const el = scrollerRef.current;
    if (!el) return;
    dragState.current = {
      startX: e.clientX,
      startScroll: el.scrollLeft,
      moved: false,
    };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    const d = dragState.current;
    if (!el || !d) return;
    const dx = e.clientX - d.startX;
    if (!d.moved && Math.abs(dx) > 4) {
      d.moved = true;
      el.setPointerCapture(e.pointerId);
    }
    if (d.moved) el.scrollLeft = d.startScroll - dx;
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragState.current;
    if (!d) return;
    suppressClick.current = d.moved;
    dragState.current = null;
    setDragging(false);
    const el = scrollerRef.current;
    if (el?.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
  };

  const onClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!suppressClick.current) return;
    suppressClick.current = false;
    e.preventDefault();
    e.stopPropagation();
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, x: rtl ? -32 : 32 },
    visible: { opacity: 1, x: 0, transition: reveal },
  };

  return (
    <div>
      <div className="mx-auto flex max-w-6xl items-center justify-end gap-2 px-6 sm:px-10">
        <button
          type="button"
          aria-label={prevLabel}
          disabled={atStart}
          onClick={() => scrollByDir(-1)}
          className={ARROW_BUTTON_CLASS}
        >
          <ArrowIcon className="tott-voices-arrow-prev" />
        </button>
        <button
          type="button"
          aria-label={nextLabel}
          disabled={atEnd}
          onClick={() => scrollByDir(1)}
          className={ARROW_BUTTON_CLASS}
        >
          <ArrowIcon className="tott-voices-arrow-next" />
        </button>
      </div>

      <motion.div
        ref={scrollerRef}
        variants={staggerParent}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        data-dragging={dragging || undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
        onDragStart={(e) => e.preventDefault()}
        onScroll={updateEdges}
        className={`tott-voices-strip mt-8 flex gap-5 overflow-x-auto ${EDGE_PAD}`}
      >
        {cards.map((card) => (
          <motion.div
            key={card.id}
            variants={cardVariants}
            className="w-52 shrink-0 sm:w-60"
          >
            <Link
              href={card.href}
              className="tott-voices-card group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--tott-gold-bright)]"
            >
              <span
                className={`tott-voices-frame relative block aspect-[3/4] overflow-hidden bg-[var(--tott-elevated)] ${
                  card.avatar ? "" : "border border-[var(--tott-gold-muted)]"
                }`}
              >
                {card.avatar ? (
                  <Image
                    src={card.avatar}
                    alt=""
                    fill
                    unoptimized
                    draggable={false}
                    sizes="(min-width: 640px) 240px, 208px"
                    className="tott-voices-portrait object-cover"
                  />
                ) : (
                  <span
                    aria-hidden
                    className="grid h-full w-full place-items-center font-display text-4xl text-[var(--tott-gold-bright)]"
                  >
                    {initialsOf(card.name)}
                  </span>
                )}
              </span>
              <span
                className="mt-4 block font-display text-lg text-[var(--tott-home-text-warm)]"
                style={{
                  lineHeight: "var(--tott-display-leading)",
                  letterSpacing: "var(--tott-display-tracking)",
                }}
              >
                {card.name}
              </span>
              {card.headline ? (
                <span className="mt-1 line-clamp-1 block text-sm text-[var(--tott-salt)]">
                  {card.headline}
                </span>
              ) : null}
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

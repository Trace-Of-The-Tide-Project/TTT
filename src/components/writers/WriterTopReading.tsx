"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion, type Variants } from "motion/react";
import { Link } from "@/i18n/navigation";
import { reveal, staggerParent } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Skeleton } from "@/components/ui/Skeleton";
import { useWriterTopWorks } from "@/hooks/queries/writers";
import { resolveArticleMediaSrc } from "@/lib/content/article-media-url";

const SERIF = "var(--font-plex-serif), 'IBM Plex Serif', Georgia, serif";
const SANS = "var(--font-plex-sans), 'IBM Plex Sans', system-ui, sans-serif";

const ARROW_BUTTON_CLASS =
  "grid h-10 w-10 shrink-0 place-items-center border border-[color-mix(in_srgb,var(--tott-salt)_35%,transparent)] text-[var(--tott-gold-primary)] transition-colors hover:border-[var(--tott-gold-muted)] hover:text-[var(--tott-gold-bright)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tott-gold-bright)] disabled:cursor-default disabled:opacity-35";

function ArrowIcon({ className }: { className?: string }) {
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

export function WriterTopReading({ writerId }: { writerId: string | null }) {
  const t = useTranslations("Writers.topReading");
  const reduced = useReducedMotion();
  const { data: works, isPending } = useWriterTopWorks(writerId, 6);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef<{ startX: number; startScroll: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const [dragging, setDragging] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

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
  }, [updateEdges, works]);

  const scrollByDir = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const step = Math.max(el.clientWidth * 0.8, 260);
    el.scrollBy({ left: dir * step, behavior: reduced ? "auto" : "smooth" });
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const el = scrollerRef.current;
    if (!el) return;
    dragState.current = { startX: e.clientX, startScroll: el.scrollLeft, moved: false };
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
    hidden: { opacity: 0, x: 32 },
    visible: { opacity: 1, x: 0, transition: reveal },
  };

  if (!writerId) return null;
  if (!isPending && (works?.length ?? 0) === 0) return null;

  return (
    <section className="mx-auto mt-20 max-w-6xl">
      <div className="flex items-center justify-between gap-4 px-6 sm:px-10">
        <div>
          <h2
            className="text-2xl font-medium sm:text-3xl"
            style={{ color: "var(--tott-home-text-strong)", fontFamily: SERIF }}
          >
            {t("eyebrow")}
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--tott-home-text-muted)", fontFamily: SANS }}>
            {t("subtitle")}
          </p>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            aria-label={t("prev")}
            disabled={atStart}
            onClick={() => scrollByDir(-1)}
            className={ARROW_BUTTON_CLASS}
          >
            <ArrowIcon className="rtl:-scale-x-100" />
          </button>
          <button
            type="button"
            aria-label={t("next")}
            disabled={atEnd}
            onClick={() => scrollByDir(1)}
            className={ARROW_BUTTON_CLASS}
          >
            <ArrowIcon className="scale-x-[-1] rtl:scale-x-100" />
          </button>
        </div>
      </div>

      {isPending ? (
        <div className="mt-6 flex gap-5 overflow-hidden px-6 sm:px-10">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-64 shrink-0 rounded-lg" />
          ))}
        </div>
      ) : (
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
          className="mt-6 flex gap-5 overflow-x-auto px-6 pb-2 sm:px-10"
          style={{ cursor: dragging ? "grabbing" : "grab" }}
        >
          {(works ?? []).map((work) => (
            <motion.div key={work.id} variants={cardVariants} className="w-56 shrink-0 sm:w-64">
              <Link
                href={`/content/article?id=${encodeURIComponent(work.id)}`}
                className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--tott-gold-bright)]"
              >
                <span
                  className="relative block aspect-square w-full overflow-hidden bg-[var(--tott-elevated)] transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
                  style={{
                    clipPath:
                      "polygon(25% 0, 75% 0, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0 75%, 0 25%)",
                  }}
                >
                  {work.cover_url ? (
                    <Image
                      src={resolveArticleMediaSrc(work.cover_url)}
                      alt=""
                      fill
                      unoptimized
                      draggable={false}
                      sizes="256px"
                      className="object-cover"
                    />
                  ) : (
                    <span
                      aria-hidden
                      className="grid h-full w-full place-items-center font-display text-3xl text-[var(--tott-gold-bright)]"
                    >
                      {work.title.charAt(0)}
                    </span>
                  )}
                </span>
                <span
                  className="mt-4 line-clamp-2 block font-display text-base"
                  style={{
                    color: "var(--tott-home-text-warm)",
                    lineHeight: "var(--tott-display-leading)",
                    letterSpacing: "var(--tott-display-tracking)",
                  }}
                >
                  {work.title}
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}

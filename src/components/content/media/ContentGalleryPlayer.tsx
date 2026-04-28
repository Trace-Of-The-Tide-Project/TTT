"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { ContentVideoPlayer } from "./ContentVideoPlayer";
import { ContentAudioPlayer } from "./ContentAudioPlayer";
import { ContentImageDisplay } from "./ContentImageDisplay";

export type GalleryItem = {
  type: "image" | "video" | "audio";
  src: string;
  thumbnail?: string;
  title?: string;
  duration?: string;
};

type ContentGalleryPlayerProps = {
  items: GalleryItem[];
};

const SLIDE_RATIO = 0.78;
const GAP_RATIO = 0.02;

function SlideContent({ item }: { item: GalleryItem }) {
  switch (item.type) {
    case "video":
      return <ContentVideoPlayer src={item.src} thumbnail={item.thumbnail} />;
    case "audio":
      return (
        <ContentAudioPlayer
          src={item.src}
          thumbnail={item.thumbnail}
          title={item.title}
          duration={item.duration}
        />
      );
    case "image":
    default:
      return <ContentImageDisplay src={item.src} />;
  }
}

function Slide({ item, active, width }: { item: GalleryItem; active: boolean; width: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (active || !ref.current) return;
    ref.current.querySelectorAll<HTMLVideoElement | HTMLAudioElement>("video, audio").forEach((el) => {
      if (!el.paused) el.pause();
    });
  }, [active]);

  return (
    <div
      ref={ref}
      className="shrink-0 overflow-hidden rounded-xl transition-opacity duration-500"
      style={{ width: `${width}px`, opacity: active ? 1 : 0.35 }}
    >
      <div className="relative aspect-21/9 overflow-hidden">
        <SlideContent item={item} />
      </div>
    </div>
  );
}

export function ContentGalleryPlayer({ items }: ContentGalleryPlayerProps) {
  const total = items.length;
  const loopable = total > 1;

  const extended = useMemo(
    () => (loopable ? [items[total - 1], ...items, items[0]] : items),
    [items, total, loopable]
  );

  const [idx, setIdx] = useState(loopable ? 1 : 0);
  const [vpWidth, setVpWidth] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [noTransition, setNoTransition] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{ x: number; time: number } | null>(null);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setVpWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const prev = useCallback(() => {
    setIdx((i) => i - 1);
    setDragOffset(0);
  }, []);

  const next = useCallback(() => {
    setIdx((i) => i + 1);
    setDragOffset(0);
  }, []);

  const handleTransitionEnd = useCallback(
    (e: React.TransitionEvent) => {
      if (e.propertyName !== "transform") return;
      if (idx === 0) {
        setNoTransition(true);
        setIdx(total);
      } else if (idx === total + 1) {
        setNoTransition(true);
        setIdx(1);
      }
    },
    [idx, total]
  );

  useEffect(() => {
    if (noTransition) {
      const id = requestAnimationFrame(() => setNoTransition(false));
      return () => cancelAnimationFrame(id);
    }
  }, [noTransition]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [prev, next]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button, input, [role=slider], video, audio")) return;
    dragStart.current = { x: e.clientX, time: Date.now() };
    setIsDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragStart.current || !isDragging) return;
      setDragOffset(e.clientX - dragStart.current.x);
    },
    [isDragging]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!dragStart.current) return;
      const dx = e.clientX - dragStart.current.x;
      const dt = Date.now() - dragStart.current.time;
      const velocity = Math.abs(dx) / Math.max(dt, 1);
      const threshold = velocity > 0.4 ? 20 : 60;

      if (dx < -threshold) next();
      else if (dx > threshold) prev();
      else setDragOffset(0);

      dragStart.current = null;
      setIsDragging(false);
    },
    [next, prev]
  );

  if (total === 0) return null;

  const slideW = vpWidth * SLIDE_RATIO;
  const gapW = vpWidth * GAP_RATIO;
  const peekW = (vpWidth - slideW) / 2;
  const step = slideW + gapW;
  const offsetX = peekW - idx * step + dragOffset;
  const skipAnim = isDragging || noTransition;

  return (
    <div className="flex select-none items-center gap-2 sm:gap-3">
      {/* Left arrow */}
      {loopable && (
        <button
          type="button"
          onClick={prev}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--tott-card-border)] bg-[var(--tott-well-bg)] text-foreground transition-colors hover:border-[var(--tott-dash-control-hover)] hover:bg-[var(--tott-dash-control-bg)] sm:h-12 sm:w-12"
          aria-label="Previous"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}

      {/* Carousel viewport */}
      <div
        ref={viewportRef}
        className="relative min-w-0 flex-1 overflow-hidden"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ touchAction: "pan-y" }}
      >
        <div
          className="flex"
          onTransitionEnd={handleTransitionEnd}
          style={{
            gap: `${gapW}px`,
            transform: `translateX(${offsetX}px)`,
            transition: skipAnim ? "none" : "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)",
          }}
        >
          {extended.map((item, j) => (
            <Slide key={j} item={item} active={j === idx} width={slideW} />
          ))}
        </div>
      </div>

      {/* Right arrow */}
      {loopable && (
        <button
          type="button"
          onClick={next}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--tott-card-border)] bg-[var(--tott-well-bg)] text-foreground transition-colors hover:border-[var(--tott-dash-control-hover)] hover:bg-[var(--tott-dash-control-bg)] sm:h-12 sm:w-12"
          aria-label="Next"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState, type FocusEvent, type ReactNode } from "react";
import { motion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { fadeIn, revealMask, reveal } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * One writer pull-quote at a time, cycling every 8s with a crossfade +
 * slight y-drift. All quotes render stacked in one grid cell so the band's
 * height is the tallest quote — cycling never shifts layout (zero CLS).
 * The timer pauses on the pause toggle AND while focus is inside the
 * cycler (the attribution link must not vanish under keyboard focus).
 *
 * Reduced motion: fully static — no timer, no pause button, entrance
 * swaps revealMask → fadeIn (clip-path is NOT gated by MotionConfig);
 * the dots stay rendered and swap quotes instantly, so no functionality
 * is lost while nothing moves by itself.
 */

export type Testimony = {
  id: string;
  quote: string;
  name: string;
  headline: string | null;
  /** ISO code of the quote's language — content dir, not UI dir. */
  language: string;
  dir: "rtl" | "ltr";
  /**
   * Attribution link target. Defaults to the writer route (`/writers/{id}`).
   * Pass `null` to render the name as plain text (quotes with no writer page).
   */
  href?: string | null;
};

type Props = {
  testimonies: Testimony[];
  pauseLabel: string;
  playLabel: string;
  dotLabels: string[];
  /** Overrides the quote <p> type scale. Defaults to the Editions scale. */
  quoteClassName?: string;
};

const CYCLE_MS = 8000;

const DEFAULT_QUOTE_CLASS =
  "max-w-3xl font-display text-2xl text-[var(--tott-home-text-warm)] sm:text-3xl lg:text-4xl";

function Quote({ q, quoteClassName }: { q: Testimony; quoteClassName?: string }) {
  // href undefined → default to the writer route; href null → plain text.
  const href = q.href === undefined ? `/writers/${encodeURIComponent(q.id)}` : q.href;
  return (
    <>
      <p
        className={quoteClassName ?? DEFAULT_QUOTE_CLASS}
        style={{
          lineHeight: "var(--tott-display-leading)",
          letterSpacing: "var(--tott-display-tracking)",
        }}
      >
        {q.quote}
      </p>
      <footer className="mt-5 text-sm text-[var(--tott-salt)]">
        <span aria-hidden>— </span>
        {href ? (
          <Link
            href={href}
            className="font-medium text-[var(--tott-gold-primary)] transition-colors hover:text-[var(--tott-gold-bright)] focus-visible:text-[var(--tott-gold-bright)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--tott-gold-bright)]"
          >
            {q.name}
          </Link>
        ) : (
          <span className="font-medium text-[var(--tott-gold-primary)]">{q.name}</span>
        )}
        {q.headline ? <span> · {q.headline}</span> : null}
      </footer>
    </>
  );
}

function ControlIcon({ paused }: { paused: boolean }): ReactNode {
  // Media play/pause glyphs are conventionally NOT mirrored in RTL.
  return paused ? (
    <svg aria-hidden width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
      <path d="M3.5 2 10 6 3.5 10Z" />
    </svg>
  ) : (
    <svg aria-hidden width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
      <path d="M3 2h2.2v8H3zM6.8 2H9v8H6.8z" />
    </svg>
  );
}

export function TestimonyCycler({
  testimonies,
  pauseLabel,
  playLabel,
  dotLabels,
  quoteClassName,
}: Props) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [focused, setFocused] = useState(false);
  const multiple = testimonies.length > 1;

  useEffect(() => {
    if (reduced || paused || focused || !multiple) return;
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % testimonies.length),
      CYCLE_MS,
    );
    return () => window.clearInterval(id);
  }, [reduced, paused, focused, multiple, testimonies.length]);

  const handleFocus = () => setFocused(true);
  const handleBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setFocused(false);
    }
  };

  const current = testimonies[index];

  return (
    <div onFocus={handleFocus} onBlur={handleBlur}>
      <motion.div
        variants={reduced ? fadeIn : revealMask}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        transition={reveal}
        className="relative mt-6"
      >
        {/* Oversized quote motif — custom SVG, not a font glyph. Logical
            start offset places it; the [dir="rtl"] flip lives in CSS. */}
        <svg
          aria-hidden
          viewBox="0 0 96 72"
          fill="currentColor"
          className="tott-editions-quotemark pointer-events-none absolute -top-2 -start-1 h-14 w-[4.7rem] text-[var(--tott-gold-muted)] opacity-30 sm:h-20 sm:w-[6.7rem]"
        >
          <path d="M40.6 3.2C22.7 9.8 11 24.2 8.3 43.1c-1.6 11.3 4.4 21.6 15.5 23.6 10.7 1.9 20.3-5.5 21.6-16.2 1.2-10-5.2-18.6-15-20.4 2.6-9.3 9-16.6 18.6-21.4L40.6 3.2Z" />
          <path d="M88.6 3.2C70.7 9.8 59 24.2 56.3 43.1c-1.6 11.3 4.4 21.6 15.5 23.6 10.7 1.9 20.3-5.5 21.6-16.2 1.2-10-5.2-18.6-15-20.4 2.6-9.3 9-16.6 18.6-21.4L88.6 3.2Z" />
        </svg>

        <div className="relative pt-10 sm:pt-14">
          {reduced ? (
            <blockquote dir={current.dir} lang={current.language}>
              <Quote q={current} quoteClassName={quoteClassName} />
            </blockquote>
          ) : (
            <div className="grid">
              {testimonies.map((q, i) => {
                const active = i === index;
                return (
                  <motion.blockquote
                    key={q.id}
                    className="[grid-area:1/1]"
                    dir={q.dir}
                    lang={q.language}
                    initial={false}
                    animate={{ opacity: active ? 1 : 0, y: active ? 0 : 10 }}
                    transition={reveal}
                    aria-hidden={!active}
                    inert={!active}
                    style={{ pointerEvents: active ? undefined : "none" }}
                  >
                    <Quote q={q} quoteClassName={quoteClassName} />
                  </motion.blockquote>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>

      {/* Announce quote changes only while the rotation is user-held —
          silent during auto-play (an 8s polite firehose helps nobody). */}
      {multiple && (paused || focused) ? (
        <span aria-live="polite" className="sr-only">
          {current.name}: {current.quote}
        </span>
      ) : null}

      {multiple ? (
        <div className="mt-8 flex items-center gap-1">
          {testimonies.map((q, i) => (
            <button
              key={q.id}
              type="button"
              aria-label={dotLabels[i] ?? String(i + 1)}
              aria-current={i === index ? "true" : undefined}
              onClick={() => setIndex(i)}
              className="group/dot p-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tott-gold-bright)]"
            >
              <span
                className={`block h-2 w-2 rounded-full transition-colors ${
                  i === index
                    ? "bg-[var(--tott-gold-primary)]"
                    : "bg-[color-mix(in_srgb,var(--tott-salt)_40%,transparent)] group-hover/dot:bg-[var(--tott-salt)]"
                }`}
              />
            </button>
          ))}
          {!reduced ? (
            <button
              type="button"
              aria-pressed={paused}
              aria-label={paused ? playLabel : pauseLabel}
              onClick={() => setPaused((p) => !p)}
              className="ms-2 grid h-8 w-8 place-items-center rounded-full border border-[color-mix(in_srgb,var(--tott-salt)_40%,transparent)] text-[var(--tott-salt)] transition-colors hover:border-[var(--tott-gold-primary)] hover:text-[var(--tott-gold-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tott-gold-bright)]"
            >
              <ControlIcon paused={paused} />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

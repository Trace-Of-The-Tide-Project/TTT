"use client";

import { motion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { fadeIn, fadeUp, revealMask, easeOut } from "@/lib/motion";
import type { ImageFraming } from "@/lib/image-framing";
import { MagImage } from "@/components/home/magazine-next/MagImage";
import { V3BoardCoverflow } from "./V3BoardCoverflow";

export type HeroSlide = {
  id: string;
  name: string;
  avatar: string | null;
  href: string;
  lang: string | null;
};

const at = (delay: number, duration = 0.7) => ({ duration, ease: easeOut, delay });

/**
 * Full-bleed cinematic hero — same pattern as the live `/magazine` hero
 * (MagHeroClient): fixed cover with a slow Ken Burns drift, bottom-anchored
 * oversized title with a per-line clip-path mask reveal (degrading to a
 * plain fade under reduced motion), scrim stack for legibility at any
 * viewport, dual CTA, and a looping gold eyebrow marquee along the top.
 * Kept visually identical to the live hero on purpose so `/magazine-v3`
 * reads as the same publication, not a different brand.
 */
export function V3Hero({
  eyebrow,
  title,
  standfirst,
  readCtaLabel,
  readCtaHref,
  subscribeCtaLabel,
  subscribeCtaHref,
  backgroundImage,
  backgroundFraming,
  issueLabel,
}: {
  eyebrow?: string;
  title: string;
  standfirst: string;
  readCtaLabel: string;
  readCtaHref: string;
  subscribeCtaLabel: string;
  subscribeCtaHref: string;
  backgroundImage: string | null;
  /** Admin-set framing for `backgroundImage` — describes THAT photo, so the
   * Ken Burns drift origin is pinned to its focal point instead of dead
   * center. Same contract as MagHeroClient's `coverFraming`. */
  backgroundFraming?: ImageFraming;
  issueLabel: string | null;
}) {
  const reduced = useReducedMotion();
  const textVariant = reduced ? fadeIn : fadeUp;
  const titleVariant = reduced ? fadeIn : revealMask;

  return (
    <>
      <section
        id="magazine-v3-hero"
        aria-labelledby="magazine-v3-hero-heading"
        className="relative min-h-[100svh] w-full overflow-hidden bg-[var(--tott-well-bg)]"
      >
        <motion.div
          aria-hidden
          className="absolute inset-0"
          initial={reduced ? false : { scale: 1.12 }}
          animate={{ scale: 1 }}
          transition={{ duration: 18, ease: easeOut }}
          style={
            backgroundFraming
              ? { transformOrigin: `${backgroundFraming.x}% ${backgroundFraming.y}%` }
              : undefined
          }
        >
          {backgroundImage ? (
            <MagImage
              src={backgroundImage}
              alt={issueLabel ?? ""}
              framing={backgroundFraming}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : null}
        </motion.div>

        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, color-mix(in srgb, var(--tott-well-bg) 92%, transparent) 0%, color-mix(in srgb, var(--tott-well-bg) 55%, transparent) 38%, color-mix(in srgb, var(--tott-well-bg) 15%, transparent) 68%, transparent 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, color-mix(in srgb, var(--tott-panel-bg) 55%, transparent) 0%, transparent 26%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 mix-blend-color"
          style={{
            background:
              "linear-gradient(160deg, color-mix(in srgb, var(--tott-gold-primary) 18%, transparent) 0%, transparent 55%)",
          }}
        />

        <div className="relative flex min-h-[100svh] flex-col justify-end px-6 pb-20 pt-32 sm:px-10 sm:pb-24 lg:px-16">
          <div className="max-w-4xl">
            {eyebrow ? (
              <motion.p
                variants={textVariant}
                initial="hidden"
                animate="visible"
                transition={at(0.1)}
                className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.28em] text-[var(--tott-gold-bright)]"
              >
                <span aria-hidden className="h-px w-10 bg-[var(--tott-gold-primary)]" />
                {eyebrow}
              </motion.p>
            ) : null}

            <div className="mt-5 overflow-hidden">
              <motion.h1
                id="magazine-v3-hero-heading"
                variants={titleVariant}
                initial="hidden"
                animate="visible"
                transition={at(0.15, 0.9)}
                className="font-display text-balance text-5xl font-semibold text-[var(--tott-home-text-warm)] sm:text-7xl lg:text-8xl"
                style={{
                  lineHeight: "var(--tott-display-leading)",
                  letterSpacing: "var(--tott-display-tracking)",
                  textShadow: "0 4px 32px color-mix(in srgb, var(--tott-well-bg) 70%, transparent)",
                }}
              >
                {title}
              </motion.h1>
            </div>

            <motion.p
              variants={textVariant}
              initial="hidden"
              animate="visible"
              transition={at(0.5)}
              className="mt-6 max-w-lg text-lg leading-relaxed text-[var(--tott-salt)]"
            >
              {standfirst}
            </motion.p>

            <motion.div
              variants={textVariant}
              initial="hidden"
              animate="visible"
              transition={at(0.7)}
              className="mt-9 flex flex-wrap items-center gap-4"
            >
              <Link
                href={readCtaHref}
                className="inline-flex items-center bg-[var(--tott-gold-primary)] px-7 py-3.5 text-sm font-semibold text-[var(--tott-panel-bg)] transition-colors hover:bg-[var(--tott-gold-bright)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tott-gold-bright)]"
              >
                {readCtaLabel}
              </Link>
              <Link
                href={subscribeCtaHref}
                className="inline-flex items-center border border-[color-mix(in_srgb,var(--tott-salt)_40%,transparent)] px-7 py-3.5 text-sm font-semibold text-[var(--tott-home-text-warm)] transition-colors hover:border-[var(--tott-salt)] hover:text-[var(--tott-gold-bright)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tott-gold-bright)]"
              >
                {subscribeCtaLabel}
              </Link>
            </motion.div>
          </div>

          <motion.div
            aria-hidden
            className="absolute bottom-6 start-1/2 flex -translate-x-1/2 flex-col items-center gap-2 rtl:translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={at(1.1, 0.6)}
          >
            <motion.span
              className="h-9 w-px bg-gradient-to-b from-[var(--tott-gold-primary)] to-transparent"
              animate={reduced ? undefined : { scaleY: [1, 0.5, 1] }}
              transition={reduced ? undefined : { duration: 1.8, ease: easeOut, repeat: Infinity }}
              style={{ transformOrigin: "top" }}
            />
          </motion.div>
        </div>
      </section>
    </>
  );
}

/**
 * The Board writers strip, as its own section below the hero — 3D
 * coverflow (active card centered, others rotated/receded) instead of a
 * drag/scroll row, still hex-clipped per the TTT signature. Also reused by
 * V3Philosophy to close out the philosophy/identity section.
 */
export function V3HeroSlider({
  heading,
  slides,
  prevLabel,
  nextLabel,
  isRtl,
}: {
  heading?: string;
  slides: HeroSlide[];
  prevLabel: string;
  nextLabel: string;
  isRtl: boolean;
}) {
  if (slides.length === 0) return null;
  return (
    <section className="bg-[var(--tott-home-surface)] py-10">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        {heading ? (
          <h2 className="mb-6 font-display text-2xl text-[var(--tott-home-text-warm)]">
            {heading}
          </h2>
        ) : null}
        <V3BoardCoverflow
          slides={slides}
          prevLabel={prevLabel}
          nextLabel={nextLabel}
          isRtl={isRtl}
        />
      </div>
    </section>
  );
}

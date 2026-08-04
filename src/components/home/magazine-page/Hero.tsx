"use client";

import { motion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { fadeIn, fadeUp, revealMask, easeOut } from "@/lib/motion";
import type { ImageFraming } from "@/lib/image-framing";
import { MagImage } from "@/components/home/magazine-next/MagImage";
import { BoardCoverflow } from "./BoardCoverflow";

export type HeroSlide = {
  id: string;
  name: string;
  avatar: string | null;
  href: string;
  lang: string | null;
};

const at = (delay: number, duration = 0.7) => ({ duration, ease: easeOut, delay });

/**
 * Full-bleed cinematic hero (Figma: fixed 825px, text top-third, single
 * CTA) with a slow Ken Burns drift, scrim stack for legibility, and the
 * Board writers slider overlapping the hero's bottom edge — same
 * composition as the Figma frame's "Slider Card" row bleeding across the
 * hero/content seam. `slidesSlot` renders `BoardCoverflow`, passed in by
 * the page rather than imported here so this file stays focused on the
 * hero shell.
 */
export function Hero({
  eyebrow,
  title,
  standfirst,
  readCtaLabel,
  readCtaHref,
  noIssueLabel,
  backgroundImage,
  backgroundFraming,
  issueLabel,
  slides,
  carouselPrevLabel,
  carouselNextLabel,
  isRtl,
  titleFontSize,
}: {
  eyebrow?: string;
  title: string;
  standfirst: string;
  readCtaLabel: string;
  /** Null when no issue is published yet — CTA swaps for `noIssueLabel` text. */
  readCtaHref: string | null;
  noIssueLabel: string;
  backgroundImage: string | null;
  /** Admin-set framing for `backgroundImage` — describes THAT photo, so the
   * Ken Burns drift origin is pinned to its focal point instead of dead
   * center. Same contract as MagHeroClient's `coverFraming`. */
  backgroundFraming?: ImageFraming;
  issueLabel: string | null;
  slides: HeroSlide[];
  carouselPrevLabel: string;
  carouselNextLabel: string;
  isRtl: boolean;
  /** Admin-set title font size (px). Undefined = default 40px from the class. */
  titleFontSize?: number;
}) {
  const reduced = useReducedMotion();
  const textVariant = reduced ? fadeIn : fadeUp;
  const titleVariant = reduced ? fadeIn : revealMask;

  return (
    <>
      <section
        id="magazine-hero"
        aria-labelledby="magazine-hero-heading"
        className="relative h-[825px] w-full overflow-hidden bg-[var(--tott-well-bg)]"
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

        {/* Soften the photo behind the welcome-mat overlap so the writer
            cards (rendered below, outside this section) read crisp against
            a quieter backdrop instead of competing with photo detail. */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[220px] backdrop-blur-md"
          style={{
            maskImage: "linear-gradient(to top, black 0%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 100%)",
          }}
        />

        {/* Fade the photo into the page surface color at the hero's bottom
            edge — without this the 825px clip is a hard cutoff against the
            slider section below, since that section has no background. */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[140px]"
          style={{
            background: "linear-gradient(to bottom, transparent 0%, var(--tott-home-surface) 100%)",
          }}
        />

        {/* Text block — Figma: x=156 y=200, 456px column, top-third. */}
        <div className="relative px-6 pb-0 pt-[200px] sm:px-10 lg:px-[156px]">
          <div className="max-w-[456px]">
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
                id="magazine-hero-heading"
                variants={titleVariant}
                initial="hidden"
                animate="visible"
                transition={at(0.15, 0.9)}
                className="font-['IBM_Plex_Sans'] text-[40px] font-medium leading-[48px] text-[var(--tott-home-text-warm)]"
                style={{
                  textShadow: "0 4px 32px color-mix(in srgb, var(--tott-well-bg) 70%, transparent)",
                  fontSize: titleFontSize ? `${titleFontSize}px` : undefined,
                  lineHeight: titleFontSize ? 1.2 : undefined,
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
              className="mt-3 text-base leading-relaxed text-[var(--tott-salt)]"
            >
              {standfirst}
            </motion.p>

            <motion.div
              variants={textVariant}
              initial="hidden"
              animate="visible"
              transition={at(0.7)}
              className="mt-6"
            >
              {readCtaHref ? (
                <Link
                  href={readCtaHref}
                  className="inline-flex items-center bg-[var(--tott-gold-primary)] px-7 py-3.5 text-sm font-semibold text-[var(--tott-panel-bg)] transition-colors hover:bg-[var(--tott-gold-bright)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tott-gold-bright)]"
                >
                  {readCtaLabel}
                </Link>
              ) : (
                <p className="text-sm italic text-[var(--tott-salt)]">{noIssueLabel}</p>
              )}
            </motion.div>
          </div>
        </div>

      </section>

      {/* Board slider row — mostly below the hero, dipping ~50px into its
          bottom edge as a "welcome mat" reveal rather than sitting fully on
          top of the photo. Sits outside the hero's overflow-hidden section
          so it isn't clipped. */}
      <div className="relative z-10 -mt-[50px]">
        <BoardCoverflow
          slides={slides}
          prevLabel={carouselPrevLabel}
          nextLabel={carouselNextLabel}
          isRtl={isRtl}
        />
      </div>
    </>
  );
}

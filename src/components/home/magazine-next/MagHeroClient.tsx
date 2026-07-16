"use client";

import { motion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { fadeIn, fadeUp, revealMask, easeOut } from "@/lib/motion";
import { MagImage } from "./MagImage";

type Cta = { label: string; href: string };

type MagHeroClientProps = {
  eyebrow: string | null;
  title: string;
  subtitle: string | null;
  coverImage: string;
  coverAlt: string;
  /** Omitted when there is no issue to link to — the CTA row then drops. */
  primary?: Cta;
  secondary?: Cta;
};

const at = (delay: number, duration = 0.7) => ({ duration, ease: easeOut, delay });

/**
 * Full-bleed cinematic hero. Cover is a fixed background layer (LCP image,
 * `priority`, slow Ken Burns drift); copy sits bottom-start over a scrim so
 * it reads at any viewport. Title uses a per-line clip-path mask reveal
 * (never split mid-word — see revealMask docs). A looping gold marquee
 * repeats the eyebrow as an ambient brand signature along the top edge.
 */
export function MagHeroClient({
  eyebrow,
  title,
  subtitle,
  coverImage,
  coverAlt,
  primary,
  secondary,
}: MagHeroClientProps) {
  const reduced = useReducedMotion();
  const textVariant = reduced ? fadeIn : fadeUp;
  const titleVariant = reduced ? fadeIn : revealMask;

  return (
    <>
    <section
      id="magazine-hero"
      aria-labelledby="magazine-hero-heading"
      className="relative min-h-[100svh] w-full overflow-hidden bg-[var(--tott-well-bg)]"
    >
      {/* Background cover — full bleed, slow drift. */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        initial={reduced ? false : { scale: 1.12 }}
        animate={{ scale: 1 }}
        transition={{ duration: 18, ease: easeOut }}
      >
        <MagImage
          src={coverImage}
          alt={coverAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>

      {/* Scrim: darkens for legibility, heaviest at the bottom text zone. */}
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
      {/* Gold duotone wash for brand cohesion. */}
      <div
        aria-hidden
        className="absolute inset-0 mix-blend-color"
        style={{
          background:
            "linear-gradient(160deg, color-mix(in srgb, var(--tott-gold-primary) 18%, transparent) 0%, transparent 55%)",
        }}
      />

      {/* Copy — bottom-anchored, full width, oversized type. */}
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
              id="magazine-hero-heading"
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

          {subtitle ? (
            <motion.p
              variants={textVariant}
              initial="hidden"
              animate="visible"
              transition={at(0.5)}
              className="mt-6 max-w-lg text-lg leading-relaxed text-[var(--tott-salt)]"
            >
              {subtitle}
            </motion.p>
          ) : null}

          {primary || secondary ? (
            <motion.div
              variants={textVariant}
              initial="hidden"
              animate="visible"
              transition={at(0.7)}
              className="mt-9 flex flex-wrap items-center gap-4"
            >
              {primary ? (
                <Link
                  href={primary.href}
                  className="inline-flex items-center bg-[var(--tott-gold-primary)] px-7 py-3.5 text-sm font-semibold text-[var(--tott-panel-bg)] transition-colors hover:bg-[var(--tott-gold-bright)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tott-gold-bright)]"
                >
                  {primary.label}
                </Link>
              ) : null}
              {secondary ? (
                <Link
                  href={secondary.href}
                  className="inline-flex items-center border border-[color-mix(in_srgb,var(--tott-salt)_40%,transparent)] px-7 py-3.5 text-sm font-semibold text-[var(--tott-home-text-warm)] transition-colors hover:border-[var(--tott-salt)] hover:text-[var(--tott-gold-bright)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tott-gold-bright)]"
                >
                  {secondary.label}
                </Link>
              ) : null}
            </motion.div>
          ) : null}
        </div>

        {/* Scroll cue. */}
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

      {eyebrow ? (
        <div
          aria-hidden
          className="overflow-hidden border-y border-[color-mix(in_srgb,var(--tott-gold-primary)_25%,transparent)] bg-[var(--tott-well-bg)] py-4"
        >
          <div
            className="tott-tide-drift flex w-max shrink-0 items-center gap-10 whitespace-nowrap"
            style={{ animationDuration: "34s" }}
          >
            {Array.from({ length: 20 }).map((_, i) => (
              <span
                key={i}
                className="text-xs font-semibold uppercase tracking-[0.4em] text-[var(--tott-gold-bright)]"
              >
                {eyebrow} <span className="opacity-50">·</span>
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}

"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { fadeIn, fadeUp, revealMask, easeOut } from "@/lib/motion";
import { TideBackground } from "./TideBackground";

type Cta = { label: string; href: string };

type HeroClientProps = {
  eyebrow: string;
  title: string;
  subheadline: string;
  primary: Cta;
  secondary: Cta;
  scrollCue: string;
  /** Admin-uploaded background image (system settings), null when unset. */
  image: string | null;
};

/* Faint film grain — inline SVG turbulence data URI, ~0.3KB, no image request. */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E\")";

/* Entrance choreography: waves 0 → eyebrow 0.3 → sub 0.9 → CTAs 1.1 → cue 1.6.
 * The h1 does NOT animate in (`initial={false}`): it is the LCP element, and
 * any hidden initial state holds its first paint hostage to full hydration
 * (measured +7s LCP on throttled mobile). It must stay visible in SSR HTML. */
const at = (delay: number, duration = 0.6) => ({ duration, ease: easeOut, delay });

export function HeroClient({
  eyebrow,
  title,
  subheadline,
  primary,
  secondary,
  scrollCue,
  image,
}: HeroClientProps) {
  const reduced = useReducedMotion();
  // clip-path is NOT covered by MotionConfig reducedMotion="user" — swap manually.
  const headlineVariant = reduced ? fadeIn : revealMask;

  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden"
    >
      {image ? (
        <div aria-hidden className="absolute inset-0">
          <Image
            src={image}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
            unoptimized
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.4) 45%, rgba(0,0,0,0.15) 100%)",
            }}
          />
        </div>
      ) : null}

      <motion.div variants={fadeIn} initial="hidden" animate="visible" transition={at(0, 0.8)}>
        <TideBackground />
      </motion.div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{ backgroundImage: GRAIN }}
      />

      <div className="relative mx-auto w-full max-w-6xl px-6 sm:px-10">
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={at(0.3)}
          className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--tott-gold-muted)]"
        >
          {eyebrow}
        </motion.p>

        <motion.h1
          id="hero-heading"
          variants={headlineVariant}
          initial={false}
          animate="visible"
          className="font-display mt-5 max-w-4xl text-balance text-5xl text-[var(--tott-home-text-warm)] sm:text-7xl lg:text-8xl"
          style={{
            lineHeight: "var(--tott-display-leading)",
            letterSpacing: "var(--tott-display-tracking)",
          }}
        >
          {title}
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={at(0.9)}
          className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--tott-salt)]"
        >
          {subheadline}
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={at(1.1)}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <Link
            href={primary.href}
            className="inline-flex items-center bg-[var(--tott-gold-primary)] px-7 py-3.5 text-sm font-semibold text-[var(--tott-panel-bg)] transition-colors hover:bg-[var(--tott-gold-bright)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tott-gold-bright)]"
          >
            {primary.label}
          </Link>
          <Link
            href={secondary.href}
            className="inline-flex items-center border border-[color-mix(in_srgb,var(--tott-salt)_40%,transparent)] px-7 py-3.5 text-sm font-semibold text-[var(--tott-home-text-warm)] transition-colors hover:border-[var(--tott-salt)] hover:text-[var(--tott-gold-bright)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tott-gold-bright)]"
          >
            {secondary.label}
          </Link>
        </motion.div>
      </div>

      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        transition={at(1.6, 0.5)}
        className="absolute inset-x-0 bottom-8 flex justify-center"
      >
        {/* .tott-scroll-cue: existing 2.2s translateY loop, killed under reduced motion. */}
        <div className="tott-scroll-cue flex flex-col items-center gap-2" aria-hidden>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[var(--tott-salt)]">
            {scrollCue}
          </span>
          <span className="h-10 w-px bg-gradient-to-b from-[var(--tott-salt)] to-transparent" />
          <svg width="12" height="7" viewBox="0 0 12 7" fill="none" className="text-[var(--tott-gold-muted)]">
            <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </motion.div>
    </section>
  );
}

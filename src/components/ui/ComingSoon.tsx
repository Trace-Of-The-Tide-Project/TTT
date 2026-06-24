"use client";

import { useLocale } from "next-intl";
import { motion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { BrandLogo } from "@/components/brand/BrandLogo";
import HexBackground from "@/components/ui/HexBackground";
import { springs } from "@/lib/motion";

/**
 * Shared "coming soon" page — one consistent Trace of the Tide composition used
 * by every placeholder route (home, fields, contribute, be-a-neighbor,
 * gift-a-trace): the brand mark, a gold eyebrow with rule lines, an editorial
 * headline, and the signature animated tide line. Every colour is a theme
 * token, so it reads on dark / light / tide. Per-page wording comes from props.
 */
interface ComingSoonProps {
  /** Shared "Coming soon" eyebrow label. */
  badge: string;
  /** Per-feature headline. */
  title: string;
  /** Per-feature supporting copy. */
  description: string;
  /** Primary CTA label (e.g. "Explore the magazine meanwhile"). */
  ctaLabel: string;
  /** Primary CTA destination (locale auto-prepended). */
  ctaHref?: string;
  /** Optional secondary "Back to home" link label — omit on the home page. */
  homeLabel?: string;
}

// One orchestrated page-load reveal — staggered, matching the site's motion vocabulary.
const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

// The signature tide line, reused from the homepage hero so every page reads as the same site.
function TideLine() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-40 overflow-hidden"
    >
      <div
        className="absolute bottom-0 left-0 h-24 w-[200%]"
        style={{ animation: "tott-wave 20s linear infinite" }}
      >
        {[0, 1].map((k) => (
          <svg
            key={k}
            viewBox="0 0 1440 80"
            preserveAspectRatio="none"
            className="inline-block h-full w-1/2 align-top"
          >
            <path
              d="M0,40 C180,10 360,70 540,40 C720,10 900,70 1080,40 C1260,10 1440,50 1440,40 L1440,80 L0,80 Z"
              fill="var(--tott-accent-tide-subtle)"
            />
          </svg>
        ))}
      </div>
      <div
        className="absolute bottom-0 left-0 h-16 w-[200%]"
        style={{ animation: "tott-wave 26s linear infinite reverse" }}
      >
        {[0, 1].map((k) => (
          <svg
            key={k}
            viewBox="0 0 1440 60"
            preserveAspectRatio="none"
            className="inline-block h-full w-1/2 align-top"
          >
            <path
              d="M0,30 C200,55 400,5 600,30 C800,55 1000,5 1200,30 C1320,45 1400,25 1440,30 L1440,60 L0,60 Z"
              fill="color-mix(in srgb, var(--tott-accent-gold) 26%, transparent)"
            />
          </svg>
        ))}
      </div>
    </div>
  );
}

export default function ComingSoon({
  badge,
  title,
  description,
  ctaLabel,
  ctaHref = "/magazine",
  homeLabel,
}: ComingSoonProps) {
  const locale = useLocale();
  const isAr = locale === "ar";

  const rule = (toLeft: boolean) => ({
    height: 1,
    width: 56,
    background: `linear-gradient(to ${toLeft ? "left" : "right"}, transparent, var(--tott-accent-gold))`,
  });

  return (
    <main
      dir={isAr ? "rtl" : "ltr"}
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-6 py-24"
      style={{
        backgroundColor: "var(--tott-home-surface)",
        color: "var(--tott-home-text-strong)",
      }}
    >
      {/* Faint hex motif drifting in from the top — brand texture, not a flat fill */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-72 overflow-hidden"
        style={{
          opacity: "var(--tott-dash-hex-opacity, 1)",
          maskImage: "linear-gradient(to bottom, black, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, black, transparent)",
        }}
      >
        <HexBackground />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex w-full max-w-2xl flex-col items-center text-center"
      >
        {/* Brand mark, gently breathing */}
        <motion.div variants={item} transition={springs.gentle}>
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <BrandLogo width={84} alt="Trace of the Tide" priority />
          </motion.div>
        </motion.div>

        {/* Eyebrow with rule lines — mirrors the homepage hero */}
        <motion.div
          variants={item}
          transition={springs.gentle}
          className="mt-10 flex items-center gap-4"
        >
          <span aria-hidden style={rule(false)} />
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.22em]"
            style={{ color: "var(--tott-accent-gold)" }}
          >
            {badge}
          </span>
          <span aria-hidden style={rule(true)} />
        </motion.div>

        {/* Editorial headline */}
        <motion.h1
          variants={item}
          transition={springs.gentle}
          className="mt-6 text-balance text-4xl font-light leading-[1.1] tracking-tight sm:text-5xl"
        >
          {title}
        </motion.h1>

        <motion.p
          variants={item}
          transition={springs.gentle}
          className="mt-5 max-w-md text-pretty text-base leading-relaxed"
          style={{ color: "var(--tott-home-text-muted)" }}
        >
          {description}
        </motion.p>

        {/* Primary CTA — accent fill with on-accent ink (legible on every theme) */}
        <motion.div
          variants={item}
          transition={springs.gentle}
          className="mt-9"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold shadow-sm transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--tott-accent-gold)] focus:ring-offset-2"
            style={{
              backgroundColor: "var(--tott-accent-gold)",
              color: "var(--tott-on-accent)",
            }}
          >
            {ctaLabel}
            <span aria-hidden>{isAr ? "←" : "→"}</span>
          </Link>
        </motion.div>

        {homeLabel ? (
          <motion.div variants={item} transition={springs.gentle} className="mt-4">
            <Link
              href="/"
              className="text-sm font-medium hover:underline"
              style={{ color: "var(--tott-muted)" }}
            >
              {homeLabel}
            </Link>
          </motion.div>
        ) : null}
      </motion.div>

      <TideLine />

      <style>{`
        @keyframes tott-wave {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </main>
  );
}

"use client";

import type { ComponentType } from "react";
import { motion } from "motion/react";
import { Link } from "@/i18n/navigation";
import HexBackground from "@/components/ui/HexBackground";
import {
  GridIcon,
  PersonPlusIcon,
  GiftIcon,
  PenLineIcon,
  StarIcon,
} from "@/components/ui/icons";
import { springs } from "@/lib/motion";

// Icon keys cross the server→client boundary as plain strings; the page
// components stay Server Components and never pass a function reference.
export type ComingSoonIconKey = "grid" | "person" | "gift" | "pen";

const ICONS: Record<ComingSoonIconKey, ComponentType> = {
  grid: GridIcon,
  person: PersonPlusIcon,
  gift: GiftIcon,
  pen: PenLineIcon,
};

interface ComingSoonProps {
  /** Shared "Coming soon" pill label. */
  badge: string;
  /** Per-feature headline. */
  title: string;
  /** Per-feature supporting copy. */
  description: string;
  /** Primary CTA label (e.g. "Explore the magazine meanwhile"). */
  ctaLabel: string;
  /** Secondary "Back to home" link label. */
  homeLabel: string;
  /** Primary CTA destination (locale auto-prepended). */
  ctaHref?: string;
  /** Feature icon shown in the floating tile. */
  iconKey?: ComingSoonIconKey;
}

// Staggered reveal — mirrors the proven 404 content animation, reused
// here so the page reads as composed and intentional rather than broken.
const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

export default function ComingSoon({
  badge,
  title,
  description,
  ctaLabel,
  homeLabel,
  ctaHref = "/magazine",
  iconKey,
}: ComingSoonProps) {
  const Icon = iconKey ? ICONS[iconKey] : null;

  return (
    <main
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{ backgroundColor: "var(--tott-home-surface)" }}
    >
      {/* Subtle theme-aware hex motif strip — calmer than the animated
          404 background so the page feels celebratory, not erroneous. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-56 overflow-hidden"
        style={{ opacity: "var(--tott-dash-hex-opacity, 1)" }}
      >
        <HexBackground />
      </div>

      <motion.div
        className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 pb-16 pt-24 sm:px-6"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        <div className="flex w-full max-w-xl flex-col items-center text-center">
          {/* Gold "Coming soon" pill */}
          <motion.span
            variants={item}
            transition={springs.gentle}
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--tott-accent-gold) 14%, transparent)",
              color: "var(--tott-dash-gold-label)",
            }}
          >
            <span aria-hidden className="inline-flex [&>svg]:h-3.5 [&>svg]:w-3.5">
              <StarIcon />
            </span>
            {badge}
          </motion.span>

          {/* Floating feature icon tile (replaces the giant 404 number) */}
          {Icon ? (
            <motion.div
              variants={item}
              transition={springs.gentle}
              className="mt-7"
            >
              <motion.span
                aria-hidden
                className="inline-flex items-center justify-center rounded-2xl p-5 [&>svg]:h-10 [&>svg]:w-10"
                style={{
                  color: "var(--tott-accent-gold)",
                  border: "1px solid var(--tott-card-border)",
                  backgroundColor: "var(--tott-elevated)",
                }}
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Icon />
              </motion.span>
            </motion.div>
          ) : null}

          <motion.h1
            variants={item}
            transition={springs.gentle}
            className="mt-7 text-2xl font-bold sm:text-3xl"
            style={{ color: "var(--tott-home-text-strong)" }}
          >
            {title}
          </motion.h1>

          <motion.p
            variants={item}
            transition={springs.gentle}
            className="mt-3 max-w-md text-sm leading-relaxed sm:text-base"
            style={{ color: "var(--tott-home-text-muted)" }}
          >
            {description}
          </motion.p>

          <motion.div
            variants={item}
            transition={springs.gentle}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            <Link
              href={ctaHref}
              className="mt-7 inline-block rounded-xl px-8 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--tott-accent-gold)] focus:ring-offset-2"
              style={{
                backgroundColor: "var(--tott-accent-gold)",
                color: "#1a1a1a",
              }}
            >
              {ctaLabel}
            </Link>
          </motion.div>

          <motion.div
            variants={item}
            transition={springs.gentle}
            className="mt-4"
          >
            <Link
              href="/"
              className="text-sm font-medium hover:underline"
              style={{ color: "var(--tott-muted)" }}
            >
              {homeLabel}
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </main>
  );
}

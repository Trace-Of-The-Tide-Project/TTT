"use client";

import { motion } from "motion/react";
import { fadeUp, reveal } from "@/lib/motion";

/**
 * Full-width editorial pull-quote. Large centered display type, decorative
 * quotation marks (aria-hidden — the real text carries the meaning), a
 * softly drifting gold glyph behind the copy (`.tott-tide-drift`, already
 * killed under prefers-reduced-motion in globals.css). Semantically a
 * <figure><blockquote> so screen readers get a real quotation, not a
 * generic heading.
 */
export function V3QuoteBreak({ quote, attribution }: { quote: string; attribution?: string }) {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div
        aria-hidden
        className="tott-tide-drift pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, var(--tott-accent-gold) 0%, transparent 60%)",
        }}
      />
      <motion.figure
        className="relative mx-auto max-w-3xl px-6 text-center sm:px-10"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        transition={reveal}
      >
        <span
          aria-hidden
          className="font-display block text-6xl leading-none text-[var(--tott-gold-muted)] sm:text-7xl"
        >
          &ldquo;
        </span>
        <blockquote className="mt-2">
          <p
            className="font-display text-2xl text-[var(--tott-home-text-warm)] sm:text-4xl"
            style={{
              lineHeight: "var(--tott-display-leading)",
              letterSpacing: "var(--tott-display-tracking)",
            }}
          >
            {quote}
          </p>
        </blockquote>
        {attribution ? (
          <figcaption className="mt-6 text-sm font-medium uppercase tracking-[0.18em] text-[var(--tott-gold-muted)]">
            {attribution}
          </figcaption>
        ) : null}
      </motion.figure>
    </section>
  );
}

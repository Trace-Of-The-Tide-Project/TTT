"use client";

import { motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { theme } from "@/lib/theme";
import { fadeUp, springs, staggerParent } from "@/lib/motion";

/**
 * The tide mark — the editorial line between hero and archive index, scaled
 * up to display size with a word-by-word reveal on scroll. motion.span is
 * used directly (StaggerItem renders a div, invalid inside <p>). Splitting
 * on whitespace is RTL-safe: Arabic shaping is intra-word.
 */
export function AtriumManifesto() {
  const t = useTranslations("Content");
  const words = t("hub.manifesto").split(/\s+/);
  // CSS gradients use physical directions and don't auto-mirror, so flip them
  // for RTL: each rule should fade toward the text from its own page edge.
  const isRtl = useLocale() === "ar";
  const fade = `color-mix(in srgb, ${theme.accentGold} 55%, transparent)`;
  const leadingRule = `linear-gradient(${isRtl ? "to left" : "to right"}, transparent, ${fade})`;
  const trailingRule = `linear-gradient(${isRtl ? "to right" : "to left"}, transparent, ${fade})`;

  return (
    <section className="relative w-full px-4 py-24 sm:px-6 sm:py-32 md:px-8">
      <div className="mx-auto w-full max-w-[1100px] text-center">
        <motion.p
          variants={staggerParent}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="text-balance font-serif font-medium"
          style={{
            fontSize: "clamp(1.75rem, 4vw, 3rem)",
            lineHeight: 1.25,
            color: "var(--tott-home-text-strong)",
          }}
        >
          {words.map((word, i) => (
            <motion.span
              key={`${word}-${i}`}
              variants={fadeUp}
              transition={springs.gentle}
              className="inline-block"
            >
              {/* NBSP joiner — a plain trailing space inside inline-block is trimmed. */}
              {i < words.length - 1 ? word + "\u00A0" : word}
            </motion.span>
          ))}
        </motion.p>

        <div className="mt-10 flex items-center gap-4 sm:gap-6">
          <span aria-hidden className="h-px flex-1" style={{ background: leadingRule }} />
          <span
            aria-hidden
            className="h-1.5 w-1.5 rotate-45"
            style={{ backgroundColor: theme.accentGold }}
          />
          <span aria-hidden className="h-px flex-1" style={{ background: trailingRule }} />
        </div>
      </div>
    </section>
  );
}

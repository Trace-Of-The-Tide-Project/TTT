"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { fadeIn, revealMask, reveal } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { RichContent } from "@/components/ui/rich-text/RichContent";
import type { ManifestoLocaleFields } from "@/services/magazine-page.service";

/**
 * One editorial line under the hero — the mission, set as tone before the
 * first content grid. CMS override wins; otherwise the i18n mission body.
 * The line reveals with a clip-path wipe (per line, not per word — Arabic
 * shaping); reduced motion swaps to a plain fade, since revealMask (clip-path)
 * is not gated by MotionConfig.
 */
export function MagOpeningLine({ copy }: { copy: ManifestoLocaleFields }) {
  const reduced = useReducedMotion();
  const t = useTranslations("Home.magazine.manifesto");
  const tnext = useTranslations("MagazineNext.openingLine");

  const body = copy.missionBody?.trim() || t("missionBody");
  if (!body) return null;

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-6 sm:px-10">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--tott-gold-muted)]">
          {tnext("eyebrow")}
        </span>
        <motion.div
          variants={reduced ? fadeIn : revealMask}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          transition={reveal}
          className="mt-4 font-display text-2xl text-[var(--tott-home-text-warm)] sm:text-3xl"
          style={{
            lineHeight: "var(--tott-display-leading)",
            letterSpacing: "var(--tott-display-tracking)",
          }}
        >
          <RichContent html={body} variant="inline" />
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { staggerParent, staggerChild, springs } from "@/lib/motion";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { theme } from "@/lib/theme";

export function CommunityGuidelines({ guidelines }: { guidelines: string[] }) {
  const t = useTranslations("Community");

  return (
    <RevealOnScroll>
    <section className="mt-16">
      <h2
        className="font-serif text-3xl font-medium"
        style={{ color: "var(--tott-home-text-strong)" }}
      >
        {t("guidelinesHeading")}
      </h2>
      <p className="mt-1 text-sm" style={{ color: "var(--tott-home-text-muted)" }}>
        {t("guidelinesSubtitle")}
      </p>

      <motion.ol
        className="mt-6 grid gap-4 sm:grid-cols-2"
        variants={staggerParent}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        {guidelines.map((rule, i) => (
          <motion.li
            key={i}
            className="flex items-start gap-4 rounded-2xl border p-5 transition-colors hover:border-[color:var(--tott-accent-gold)]"
            style={{
              borderColor: theme.cardBorder,
              backgroundColor: "var(--tott-well-bg)",
            }}
            variants={staggerChild}
            transition={springs.gentle}
            whileHover={{ y: -3 }}
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-serif text-base font-semibold"
              style={{
                backgroundColor: "color-mix(in srgb, var(--tott-accent-gold) 18%, transparent)",
                color: "var(--tott-accent-gold)",
              }}
            >
              {i + 1}
            </span>
            <span
              className="pt-1.5 text-sm leading-relaxed"
              style={{ color: "var(--tott-home-text-strong)" }}
            >
              {rule}
            </span>
          </motion.li>
        ))}
      </motion.ol>
    </section>
    </RevealOnScroll>
  );
}

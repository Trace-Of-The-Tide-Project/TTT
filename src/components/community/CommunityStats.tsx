"use client";

import { useTranslations } from "next-intl";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { theme } from "@/lib/theme";

function StatItem({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-start gap-1">
      <span
        className="font-serif text-4xl font-medium leading-none sm:text-5xl"
        style={{ color: "var(--tott-accent-gold)" }}
      >
        {value}
      </span>
      <span
        className="text-xs font-medium uppercase tracking-[0.15em]"
        style={{ color: "var(--tott-home-text-muted)" }}
      >
        {label}
      </span>
    </div>
  );
}

export function CommunityStats({
  writers,
  openCalls,
  guidelines,
}: {
  writers: number;
  openCalls: number;
  guidelines: number;
}) {
  const t = useTranslations("Community");

  return (
    <RevealOnScroll>
    <section
      className="flex flex-wrap items-start gap-x-16 gap-y-6 border-b py-10"
      style={{ borderColor: theme.cardBorder }}
    >
      <StatItem value={writers} label={t("statsWriters", { count: writers })} />
      <StatItem value={openCalls} label={t("statsOpenCalls", { count: openCalls })} />
      <StatItem value={guidelines} label={t("statsGuidelines", { count: guidelines })} />
    </section>
    </RevealOnScroll>
  );
}

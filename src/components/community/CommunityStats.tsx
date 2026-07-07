"use client";

import { useTranslations } from "next-intl";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { theme } from "@/lib/theme";

const HEX_CLIP =
  "polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0% 50%)";

function StatChip({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex h-14 w-14 shrink-0 items-center justify-center text-lg font-semibold"
        style={{
          clipPath: HEX_CLIP,
          WebkitClipPath: HEX_CLIP,
          backgroundColor: "color-mix(in srgb, var(--tott-accent-gold) 18%, transparent)",
          color: "var(--tott-accent-gold)",
        }}
      >
        {value}
      </div>
      <span
        className="text-sm font-medium"
        style={{ color: "var(--tott-home-text-heading)" }}
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
      className="mt-10 flex flex-wrap gap-x-10 gap-y-5 rounded-2xl border px-6 py-6"
      style={{
        borderColor: theme.cardBorder,
        backgroundColor: "var(--tott-well-bg)",
      }}
    >
      <StatChip value={writers} label={t("statsWriters", { count: writers })} />
      <StatChip value={openCalls} label={t("statsOpenCalls", { count: openCalls })} />
      <StatChip value={guidelines} label={t("statsGuidelines", { count: guidelines })} />
    </section>
    </RevealOnScroll>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { theme } from "@/lib/theme";

export function CommunityGuidelines({ guidelines }: { guidelines: string[] }) {
  const t = useTranslations("Community");

  return (
    <section className="mt-16">
      <h2
        className="text-2xl font-medium"
        style={{ color: "var(--tott-home-text-heading)" }}
      >
        {t("guidelinesHeading")}
      </h2>
      <p className="mt-1 text-sm" style={{ color: "var(--tott-home-text-muted)" }}>
        {t("guidelinesSubtitle")}
      </p>

      <ol
        className="mt-6 grid gap-3 rounded-2xl border p-6 sm:grid-cols-2"
        style={{
          borderColor: theme.cardBorder,
          backgroundColor: "var(--tott-well-bg)",
        }}
      >
        {guidelines.map((rule, i) => (
          <li key={i} className="flex items-start gap-3">
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
              style={{
                backgroundColor: "color-mix(in srgb, var(--tott-accent-gold) 18%, transparent)",
                color: "var(--tott-accent-gold)",
              }}
            >
              {i + 1}
            </span>
            <span
              className="pt-0.5 text-sm"
              style={{ color: "var(--tott-home-text-strong)" }}
            >
              {rule}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

"use client";

import { useTranslations } from "next-intl";

export function CommunityHero() {
  const t = useTranslations("Community");

  return (
    <header className="max-w-3xl">
      <span
        className="inline-block text-xs font-semibold uppercase tracking-[0.2em]"
        style={{ color: "var(--tott-accent-gold)" }}
      >
        {t("heroEyebrow")}
      </span>
      <h1
        className="mt-3 text-4xl font-medium leading-tight sm:text-5xl"
        style={{ color: "var(--tott-home-text-strong)" }}
      >
        {t("heroTitle")}
      </h1>
      <p
        className="mt-4 text-base sm:text-lg"
        style={{ color: "var(--tott-home-text-muted)" }}
      >
        {t("heroSubtitle")}
      </p>
    </header>
  );
}

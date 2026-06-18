"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { theme } from "@/lib/theme";

export function CommunityCta() {
  const t = useTranslations("Community");

  return (
    <section
      className="mt-16 flex flex-col items-start gap-4 rounded-2xl border p-8 sm:flex-row sm:items-center sm:justify-between"
      style={{
        borderColor: theme.cardBorder,
        backgroundColor: "color-mix(in srgb, var(--tott-accent-gold) 8%, var(--tott-well-bg))",
      }}
    >
      <div>
        <h2
          className="text-xl font-medium"
          style={{ color: "var(--tott-home-text-strong)" }}
        >
          {t("ctaHeading")}
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--tott-home-text-muted)" }}>
          {t("ctaSubtitle")}
        </p>
      </div>
      <Link
        href="/contribute"
        className="inline-flex shrink-0 items-center justify-center transition-opacity hover:opacity-90"
        style={{
          padding: "10px 24px",
          borderRadius: 8,
          fontWeight: 500,
          fontSize: 14,
          backgroundColor: "var(--tott-magazine-btn-bg)",
          color: "var(--tott-auth-btn-text)",
        }}
      >
        {t("ctaButton")}
      </Link>
    </section>
  );
}

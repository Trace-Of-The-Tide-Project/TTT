"use client";

import { useTranslations } from "next-intl";
import HexBackground from "@/components/ui/HexBackground";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { SpringLink } from "@/components/motion/SpringLink";
import { theme } from "@/lib/theme";

export function CommunityCta() {
  const t = useTranslations("Community");

  return (
    <RevealOnScroll>
    <section
      className="relative -mx-6 mt-24 flex flex-col items-center gap-6 overflow-hidden px-6 py-20 text-center sm:-mx-10 sm:px-10 sm:py-28"
      style={{
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--tott-accent-gold) 16%, var(--tott-well-bg)) 0%, var(--tott-well-bg) 100%)",
        borderTop: `1px solid ${theme.cardBorder}`,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
      >
        <HexBackground />
      </div>

      <div className="relative flex max-w-2xl flex-col items-center">
        <h2
          className="font-serif text-3xl font-medium sm:text-5xl"
          style={{ color: "var(--tott-home-text-strong)" }}
        >
          {t("ctaHeading")}
        </h2>
        <p
          className="mt-4 text-base sm:text-lg"
          style={{ color: "var(--tott-home-text-muted)" }}
        >
          {t("ctaSubtitle")}
        </p>
        <SpringLink
          href="/contribute"
          className="relative mt-8 inline-flex shrink-0 items-center justify-center"
          style={{
            padding: "16px 40px",
            borderRadius: 12,
            fontWeight: 600,
            fontSize: 16,
            backgroundColor: "var(--tott-magazine-btn-bg)",
            color: "var(--tott-auth-btn-text)",
          }}
        >
          {t("ctaButton")}
        </SpringLink>
      </div>
    </section>
    </RevealOnScroll>
  );
}

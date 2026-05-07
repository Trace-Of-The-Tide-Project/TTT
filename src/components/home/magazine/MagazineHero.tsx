"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type MagazineHeroProps = {
  /** Path to the hero artwork — defaults to the design SVG bundled in /public. */
  artwork?: string;
  /** Where the primary CTA links. */
  primaryHref?: string;
  /** Where the secondary CTA links. */
  secondaryHref?: string;
};

/**
 * Top-of-page hero for the Magazine landing. The chamfered shape, silk
 * background and white hairline border are baked into `magazine-hero.svg`
 * (the original Figma export, used as-is) — we render that file directly
 * and layer the headline, subtitle and CTAs absolutely on top.
 */
export function MagazineHero({
  artwork = "/images/home/magazine-thumbnail.svg",
  primaryHref = "/fields",
  secondaryHref = "/fields",
}: MagazineHeroProps) {
  const t = useTranslations("Home.magazine.hero");

  return (
    <section className="relative w-full px-4 pb-10 pt-14 sm:px-6 sm:pb-14 sm:pt-20 md:px-8 md:pb-20 md:pt-24">
      <div className="relative mx-auto w-full max-w-[1392px]">
        {/* The SVG defines its own aspect (1392×483 ≈ 2.88:1). On phones we
            switch to a taller min-height so the headline/CTAs stay readable
            without overlapping the bottom edge. */}
        <div className="relative w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={artwork}
            alt={t("imageAlt")}
            className="block h-auto w-full select-none"
            draggable={false}
          />

          {/* Content layer — left-aligned, anchored to the lower-left
              quadrant of the artwork (matches the Figma comp). The text
              uses textShadow for legibility against the silk; no dark
              overlay needed, so the SVG's corners read the same on all
              four sides. */}
          <div className="absolute inset-0 z-10 flex flex-col items-start justify-end px-6 pb-10 text-start sm:px-10 sm:pb-12 md:px-16 md:pb-16 lg:pb-20">
            <h1
              className="whitespace-nowrap text-[clamp(1.5rem,4vw,3.25rem)] font-medium leading-[1.08] tracking-tight text-white"
              style={{ textShadow: "0 1px 2px rgba(0,0,0,0.35)" }}
            >
              {t("title")}
            </h1>
            <p
              className="mt-4 max-w-[48ch] text-[clamp(0.95rem,1.45vw,1.125rem)] leading-relaxed text-white/85"
              style={{ textShadow: "0 1px 2px rgba(0,0,0,0.32)" }}
            >
              {t("subtitle")}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-7 sm:gap-3.5">
              <Link
                href={primaryHref}
                className="inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-medium transition-colors sm:px-6 sm:text-[0.95rem]"
                style={{
                  backgroundColor: "var(--tott-accent-gold)",
                  color: "var(--tott-auth-btn-text)",
                }}
              >
                {t("ctaPrimary")}
              </Link>
              <Link
                href={secondaryHref}
                className="inline-flex items-center justify-center rounded-md border px-5 py-2.5 text-sm font-medium text-white/95 transition-colors hover:bg-white/10 sm:px-6 sm:text-[0.95rem]"
                style={{
                  backgroundColor: "rgba(20,20,20,0.65)",
                  borderColor: "rgba(255,255,255,0.14)",
                }}
              >
                {t("ctaSecondary")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export function ShareYourStory() {
  const t = useTranslations("Home");

  return (
    <section
      className="relative overflow-hidden px-4 pb-20 pt-12 text-center sm:px-6 sm:pb-24 sm:pt-16 md:pb-28 md:pt-20"
      style={{ backgroundColor: "var(--tott-home-surface)" }}
    >
      {/* Hex pattern as a CSS mask so its color tracks --tott-home-hex-stroke (theme-aware). */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          aria-hidden
          className="w-[min(140%,1232px)] max-w-none sm:w-[min(120%,1232px)] md:w-[min(100%,1232px)]"
          style={{
            aspectRatio: "1232 / 294",
            backgroundColor: "var(--tott-home-hex-stroke)",
            WebkitMaskImage: "url(/images/home/homepage-share-hex-pattern.svg)",
            maskImage: "url(/images/home/homepage-share-hex-pattern.svg)",
            WebkitMaskSize: "100% 100%",
            maskSize: "100% 100%",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex max-w-lg flex-col items-center">
        <div className="relative mb-5 flex h-12 w-12 items-center justify-center sm:mb-6 sm:h-14 sm:w-14">
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            fill="none"
            stroke="var(--tott-home-hex-stroke)"
            strokeWidth="1.5"
            aria-hidden
          >
            <polygon points="50,5 87.14,25.67 87.14,74.33 50,95 12.86,74.33 12.86,25.67" />
          </svg>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--tott-accent-gold-focus)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="relative"
            aria-hidden
          >
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        </div>

        <h2
          className="mb-3 text-xl font-semibold leading-snug tracking-tight sm:mb-4 sm:text-2xl"
          style={{ color: "var(--tott-home-text-strong)" }}
        >
          {t("shareTitle")}
        </h2>

        <p
          className="mb-6 text-sm leading-relaxed sm:mb-8 md:text-base"
          style={{ color: "var(--tott-home-text-muted)" }}
        >
          {t("shareBody")}
        </p>

        <Link
          href="/contribute"
          className="inline-flex h-10 w-[149px] items-center justify-center rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
          style={{
            backgroundColor: "var(--tott-accent-gold-focus)",
            color: "var(--tott-hero-cta-ink)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4)",
          }}
        >
          {t("shareCta")}
        </Link>
      </div>
    </section>
  );
}

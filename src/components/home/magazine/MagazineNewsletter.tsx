"use client";

import { useTranslations } from "next-intl";
import { PenLineIcon } from "@/components/ui/icons";

const HEX_CLIP =
  "polygon(50% 5%, 90% 27%, 90% 73%, 50% 95%, 10% 73%, 10% 27%)";

/**
 * Newsletter band — sits between the magazine content and the global
 * footer. Pen-icon hexagon, label, headline, body copy, then an inline
 * email field + gold Subscribe button. Same faint hex-pattern backdrop the
 * support pane uses, for visual continuity.
 */
export function MagazineNewsletter() {
  const t = useTranslations("Home.magazine.newsletter");

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="relative w-full overflow-hidden px-4 py-16 sm:px-6 sm:py-20 md:px-8 md:py-24"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "url('/images/home/homepage-share-hex-outline.svg')",
          backgroundRepeat: "repeat",
          backgroundSize: "180px",
        }}
      />

      <div className="relative mx-auto flex w-full max-w-xl flex-col items-center text-center">
        {/* Hex with pen icon */}
        <div
          className="flex h-16 w-16 items-center justify-center"
          style={{
            clipPath: HEX_CLIP,
            WebkitClipPath: HEX_CLIP,
            backgroundColor: "var(--tott-panel-bg)",
            color: "var(--tott-accent-gold)",
          }}
          aria-hidden
        >
          <PenLineIcon />
        </div>

        <p
          className="mt-4 text-sm"
          style={{ color: "var(--tott-home-text-muted)" }}
        >
          {t("label")}
        </p>
        <h2
          id="newsletter-heading"
          className="mt-1 text-2xl font-medium tracking-tight sm:text-3xl"
          style={{ color: "var(--tott-home-text-strong)" }}
        >
          {t("title")}
        </h2>
        <p
          className="mt-3 max-w-md text-sm leading-relaxed sm:text-base"
          style={{ color: "var(--tott-home-text-muted)" }}
        >
          {t("body")}
        </p>

        <form
          className="mt-6 flex w-full max-w-md flex-col items-stretch gap-3 sm:flex-row"
          onSubmit={(e) => e.preventDefault()}
        >
          <label className="sr-only" htmlFor="magazine-newsletter-email">
            {t("emailPlaceholder")}
          </label>
          <input
            id="magazine-newsletter-email"
            type="email"
            placeholder={t("emailPlaceholder")}
            className="w-full rounded-lg px-4 py-2.5 text-sm outline-none placeholder:opacity-70"
            style={{
              backgroundColor: "var(--tott-panel-bg)",
              border: "1px solid var(--tott-card-border)",
              color: "var(--tott-home-text-strong)",
            }}
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium transition-colors hover:opacity-90"
            style={{
              backgroundColor: "var(--tott-accent-gold)",
              color: "var(--tott-auth-btn-text)",
            }}
          >
            {t("submit")}
          </button>
        </form>
      </div>
    </section>
  );
}

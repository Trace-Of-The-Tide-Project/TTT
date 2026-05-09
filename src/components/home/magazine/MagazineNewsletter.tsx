"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { FirstWordGold } from "./FirstWordGold";
import { HexPatternBackdrop } from "./HexPatternBackdrop";

/**
 * Newsletter band — sits between the magazine content and the global
 * footer. Big pen-icon hex (Icon-5.svg), label, headline, body copy,
 * then an inline email field + gold Subscribe button. Hex-pattern
 * backdrop uses the same mask technique as the founder quote section
 * so the cells render at full size.
 */
export function MagazineNewsletter() {
  const t = useTranslations("Home.magazine.newsletter");

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="relative w-full overflow-hidden px-4 py-16 sm:px-12 sm:py-28 md:py-32"
      style={{ minHeight: "420px" }}
    >
      <HexPatternBackdrop />

      <div className="relative mx-auto flex w-full max-w-xl flex-col items-center text-center">
        {/* Hex with pen icon — pre-rendered Icon-5.svg (80×88). */}
        <div
          aria-hidden
          className="relative"
          style={{ width: "80px", height: "88px" }}
        >
          <Image
            src="/images/home/Icon-5.svg"
            alt=""
            fill
            sizes="80px"
            className="select-none"
            draggable={false}
          />
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
          <FirstWordGold raw={t("title")} />
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
              backgroundColor: "var(--tott-magazine-btn-bg)",
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

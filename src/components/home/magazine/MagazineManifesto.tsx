"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PenLineIcon, BookIcon } from "@/components/ui/icons";
import { RichContent } from "@/components/ui/rich-text/RichContent";
import { MagazineSection } from "./MagazineSection";
import { FirstWordGold } from "./FirstWordGold";

const HEX_CLIP = "polygon(50% 5%, 90% 27%, 90% 73%, 50% 95%, 10% 73%, 10% 27%)";

const DEFAULT_BANNER = "/images/home/hero-silk.png";

/** Reject non-URL strings so Next/Image doesn't throw `Failed to
 * construct URL` when admins type partial input. */
function safeBanner(src: string | undefined): {
  src: string;
  unoptimized: boolean;
} {
  const value = src?.trim();
  if (!value) return { src: DEFAULT_BANNER, unoptimized: false };
  const ok = value.startsWith("/") || value.startsWith("http://") || value.startsWith("https://");
  if (!ok) return { src: DEFAULT_BANNER, unoptimized: false };
  return { src: value, unoptimized: !value.startsWith("/") };
}

/**
 * Manifesto pane — the magazine's "about" content, calmed down.
 *
 * Same CMS-driven content as before (every block is admin-editable per
 * locale, so nothing is removed), but re-laid-out for breathing room:
 *
 *   silk banner
 *   ── eyebrow + philosophy heading + lead quote ──
 *   Vision   |   Mission        (two calm columns)
 *   Editorial Values            (light hex chips, not a bullet list)
 *   closing pull-quote
 *   Explore Our Spaces          (two cards)
 *
 * This trades the old long single-column wall (heading, quote, divider,
 * Vision, divider, Mission, divider, 5-bullet list, quote, cards) for a
 * shorter, scannable rhythm while keeping every editable field.
 */
export type MagazineManifestoProps = {
  /** Per-locale copy overrides. Empty/whitespace falls back to i18n. */
  philosophyHeadingOverride?: string;
  philosophyQuoteOverride?: string;
  visionHeadingOverride?: string;
  visionBodyOverride?: string;
  missionHeadingOverride?: string;
  missionBodyOverride?: string;
  valuesHeadingOverride?: string;
  closingQuoteOverride?: string;
  /** Silk banner image at the top. Empty falls back to the bundled default. */
  bannerOverride?: string;
  /** Hide the banner image entirely (admin toggle). */
  bannerHidden?: boolean;
};

export function MagazineManifesto({
  philosophyHeadingOverride,
  philosophyQuoteOverride,
  visionHeadingOverride,
  visionBodyOverride,
  missionHeadingOverride,
  missionBodyOverride,
  valuesHeadingOverride,
  closingQuoteOverride,
  bannerOverride,
  bannerHidden,
}: MagazineManifestoProps = {}) {
  const t = useTranslations("Home.magazine.manifesto");
  const tTabs = useTranslations("Home.magazine.tabs");
  const tr = (key: string, override?: string) => (override?.trim() ? override : t(key));

  const values = ["value1", "value2", "value3", "value4", "value5"] as const;

  const strong = { color: "var(--tott-home-text-strong)" } as const;
  const subHeadingClass = "text-lg font-medium tracking-tight sm:text-xl";
  const bodyStyle = {
    fontSize: "clamp(0.875rem, 0.5vw + 0.75rem, 1rem)",
    lineHeight: 1.65,
    letterSpacing: "-0.005em",
    color: "var(--tott-home-text-muted)",
  } as const;

  return (
    <div className="grid gap-10 sm:gap-12">
      {/* Silk banner — wide, no overlay text. Hidden when the admin
          disables it. */}
      {bannerHidden ? null : (
        <div
          className="relative w-full overflow-hidden rounded-[28px]"
          style={{
            aspectRatio: "1300 / 220",
            backgroundColor: "var(--tott-panel-bg)",
          }}
          aria-hidden
        >
          <Image
            src={safeBanner(bannerOverride).src}
            alt=""
            fill
            className="object-cover"
            sizes="(min-width: 1280px) 1300px, 100vw"
            priority={false}
            unoptimized={safeBanner(bannerOverride).unoptimized}
          />
        </div>
      )}

      <MagazineSection
        eyebrow={tTabs("manifesto")}
        heading={tr("philosophyHeading", philosophyHeadingOverride)}
        backdrop={false}
      >
        {/* Lead pull-quote — the philosophy statement, calm and large. */}
        <p
          className="max-w-[68ch] leading-snug"
          style={{ ...strong, fontSize: "clamp(1.25rem, 1.5vw + 0.75rem, 1.875rem)" }}
        >
          <RichContent html={tr("philosophyQuote", philosophyQuoteOverride)} variant="inline" />
        </p>

        {/* Vision + Mission — two calm columns instead of stacked blocks
            separated by dividers. */}
        <div className="grid gap-8 md:grid-cols-2 md:gap-12">
          <section>
            <h3 className={subHeadingClass} style={strong}>
              {tr("visionHeading", visionHeadingOverride)}
            </h3>
            <p className="mt-3" style={bodyStyle}>
              <RichContent html={tr("visionBody", visionBodyOverride)} variant="inline" />
            </p>
          </section>
          <section>
            <h3 className={subHeadingClass} style={strong}>
              {tr("missionHeading", missionHeadingOverride)}
            </h3>
            <p className="mt-3" style={bodyStyle}>
              <RichContent html={tr("missionBody", missionBodyOverride)} variant="inline" />
            </p>
          </section>
        </div>

        {/* Editorial Values — light hex chips. */}
        <section>
          <h3 className={subHeadingClass} style={strong}>
            {tr("valuesHeading", valuesHeadingOverride)}
          </h3>
          <ul className="mt-4 flex flex-wrap gap-2.5">
            {values.map((key) => (
              <li
                key={key}
                className="inline-flex items-center gap-2 rounded-full py-1.5 pe-4 ps-2.5 text-sm"
                style={{
                  backgroundColor: "var(--tott-panel-bg)",
                  border: "1px solid var(--tott-card-border)",
                  color: "var(--tott-home-text-strong)",
                }}
              >
                <span
                  aria-hidden
                  className="h-3 w-3 shrink-0"
                  style={{
                    clipPath: HEX_CLIP,
                    WebkitClipPath: HEX_CLIP,
                    backgroundColor: "var(--tott-accent-gold)",
                  }}
                />
                {t(key)}
              </li>
            ))}
          </ul>
        </section>

        {/* Closing pull-quote — gold rule + italic body. */}
        <div className="flex w-full items-stretch gap-3">
          <span
            aria-hidden
            className="block w-px shrink-0"
            style={{ backgroundColor: "var(--tott-magazine-btn-bg)" }}
          />
          <p
            className="max-w-[68ch] italic"
            style={{
              fontSize: "clamp(0.9375rem, 0.5vw + 0.8rem, 1.125rem)",
              lineHeight: 1.6,
              letterSpacing: "-0.005em",
              color: "var(--tott-home-text-heading)",
              margin: 0,
            }}
          >
            <RichContent html={tr("closingQuote", closingQuoteOverride)} variant="inline" />
          </p>
        </div>

        <ExploreSpaces />
      </MagazineSection>
    </div>
  );
}

/** Section that follows the closing quote — heading + two info cards. */
function ExploreSpaces() {
  const t = useTranslations("Home.magazine.spaces");

  return (
    <section className="mt-2">
      <header>
        <h3
          className="text-lg font-medium tracking-tight sm:text-xl"
          style={{ color: "var(--tott-home-text-strong)" }}
        >
          <FirstWordGold raw={t("heading")} />
        </h3>
        <p className="mt-1 text-sm sm:text-base" style={{ color: "var(--tott-home-text-muted)" }}>
          {t("subtitle")}
        </p>
      </header>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
        <SpaceCard
          icon={<PenLineIcon />}
          title={t("writingRoomTitle")}
          body={t("writingRoomBody")}
          ctaLabel={t("writingRoomCta")}
          href="/writing-room"
        />
        <SpaceCard
          icon={<BookIcon />}
          title={t("readingSalonTitle")}
          body={t("readingSalonBody")}
          ctaLabel={t("readingSalonCta")}
          href="/books"
        />
      </div>
    </section>
  );
}

/** Single info card: hex icon, title, body, gold CTA with arrow. */
function SpaceCard({
  icon,
  title,
  body,
  ctaLabel,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  ctaLabel: string;
  href: string;
}) {
  return (
    <div
      className="flex flex-col items-center rounded-[20px] px-6 py-10 text-center sm:px-10"
      style={{
        backgroundColor: "var(--tott-panel-bg)",
        border: "1px solid var(--tott-card-border)",
      }}
    >
      {/* Hex icon */}
      <div
        className="flex h-12 w-12 items-center justify-center"
        style={{
          clipPath: HEX_CLIP,
          WebkitClipPath: HEX_CLIP,
          backgroundColor: "var(--tott-panel-bg)",
          color: "var(--tott-home-text-strong)",
        }}
        aria-hidden
      >
        {icon}
      </div>

      <h4
        className="mt-4 text-base font-medium sm:text-lg"
        style={{ color: "var(--tott-home-text-strong)" }}
      >
        {title}
      </h4>
      <p
        className="mt-2 max-w-[42ch] text-sm leading-relaxed"
        style={{ color: "var(--tott-home-text-muted)" }}
      >
        {body}
      </p>

      <Link
        href={href}
        className="mt-6 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors hover:opacity-90"
        style={{
          backgroundColor: "var(--tott-magazine-btn-bg)",
          color: "var(--tott-auth-btn-text)",
        }}
      >
        {ctaLabel}
        {/* Forward arrow — mirrored under RTL so it points left (the reading
            direction) instead of right. */}
        <span aria-hidden className="inline-block rtl:-scale-x-100">
          →
        </span>
      </Link>
    </div>
  );
}

"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PenLineIcon, BookIcon } from "@/components/ui/icons";
import { RichContent } from "@/components/ui/rich-text/RichContent";
import { FirstWordGold } from "./FirstWordGold";

const HEX_CLIP =
  "polygon(50% 5%, 90% 27%, 90% 73%, 50% 95%, 10% 73%, 10% 27%)";

const DEFAULT_BANNER = "/images/home/hero-silk.png";

/** Reject non-URL strings so Next/Image doesn't throw `Failed to
 * construct URL` when admins type partial input. */
function safeBanner(src: string | undefined): {
  src: string;
  unoptimized: boolean;
} {
  const value = src?.trim();
  if (!value) return { src: DEFAULT_BANNER, unoptimized: false };
  const ok =
    value.startsWith("/") ||
    value.startsWith("http://") ||
    value.startsWith("https://");
  if (!ok) return { src: DEFAULT_BANNER, unoptimized: false };
  return { src: value, unoptimized: !value.startsWith("/") };
}

/**
 * Manifesto pane content. The Figma comp has:
 *
 *   ┌─────── silk banner (rounded, no text) ───────┐
 *   Our Philosophy
 *   "…philosophy quote…"
 *   ─────────────────────────────────────────────────
 *   Vision
 *   …
 *   ─────────────────────────────────────────────────
 *   Mission
 *   …
 *   ─────────────────────────────────────────────────
 *   Editorial Values
 *   • value 1 …
 *
 *   (closing pull-quote in chamfered well at the bottom)
 *
 * All headings render at the same scale (matches the comp). Section
 * dividers use the existing `--tott-card-border` token so they read
 * correctly in both light and dark themes.
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
  /** Per-section text scale (1 = current sizes). */
  fontScale?: number;
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
  fontScale = 1,
}: MagazineManifestoProps = {}) {
  const t = useTranslations("Home.magazine.manifesto");
  const tr = (key: string, override?: string) =>
    override?.trim() ? override : t(key);

  const values = ["value1", "value2", "value3", "value4", "value5"] as const;

  // "Our Philosophy" heading — large display heading.
  const headingClass =
    "text-3xl font-medium tracking-tight sm:text-4xl md:text-[calc(2.5rem*var(--mag-fs,1))] lg:text-5xl";
  const headingStyle = { color: "var(--tott-home-text-strong)" } as const;

  // Sub-section headings — Vision / Mission / Editorial Values fixed at
  // 20px (text-xl) per the design.
  const subHeadingClass = "text-xl font-medium tracking-tight";

  // Body for Vision / Mission / Editorial Values — Figma spec:
  //   font-weight: 400, font-size: 14px, line-height: 20px,
  //   letter-spacing: -0.005em. Color is now theme-aware so the text
  //   stays legible on both the dark and light page surfaces.
  const bodyClass = "w-full";
  const bodyTypoStyle = {
    fontWeight: 400,
    fontSize: `calc((clamp(0.875rem, 0.5vw + 0.75rem, 1rem)) * var(--mag-fs, 1))`,
    lineHeight: 1.6,
    letterSpacing: "-0.005em",
    color: "var(--tott-home-text-strong)",
  } as const;

  // Symmetric horizontal padding — small on mobile, scales up on
  // larger screens. Capped earlier so xl screens don't squeeze the text
  // into a narrow column. Same scale as ExploreSpaces below.
  const textIndent = "px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32";
  const bodyStrongStyle = { color: "var(--tott-home-text-strong)" } as const;

  return (
    <div
      className="grid gap-10 sm:gap-12"
      style={{ ["--mag-fs"]: fontScale } as React.CSSProperties}
    >
      {/* Silk banner — wide, no overlay text, matches the rounded-corner
          card from the comp. Hidden when the admin disables it. */}
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

      {/* Our Philosophy — heading + pull quote. White text, slightly
          larger than the rest of the body copy so it carries weight
          without dominating like the original "way too big" version. */}
      <section className={textIndent}>
        <h2 className={headingClass} style={headingStyle}>
          {tr("philosophyHeading", philosophyHeadingOverride)}
        </h2>
        <p
          className="mt-5 w-full leading-snug"
          style={{
            ...bodyStrongStyle,
            fontSize: `calc((clamp(1.25rem, 1.5vw + 0.75rem, 2rem)) * var(--mag-fs, 1))`,
          }}
        >
          <RichContent
            html={tr("philosophyQuote", philosophyQuoteOverride)}
            variant="inline"
          />
        </p>
      </section>

      <SectionDivider />

      {/* Vision */}
      <section className={textIndent}>
        <h3 className={subHeadingClass} style={headingStyle}>
          {tr("visionHeading", visionHeadingOverride)}
        </h3>
        <p className={`mt-4 ${bodyClass}`} style={bodyTypoStyle}>
          <RichContent
            html={tr("visionBody", visionBodyOverride)}
            variant="inline"
          />
        </p>
      </section>

      <SectionDivider />

      {/* Mission */}
      <section className={textIndent}>
        <h3 className={subHeadingClass} style={headingStyle}>
          {tr("missionHeading", missionHeadingOverride)}
        </h3>
        <p className={`mt-4 ${bodyClass}`} style={bodyTypoStyle}>
          <RichContent
            html={tr("missionBody", missionBodyOverride)}
            variant="inline"
          />
        </p>
      </section>

      <SectionDivider />

      {/* Editorial Values — each <li> follows the Figma "Paragraph / X
          Small" token (Inter 400 12/16, white, max-width 930px). */}
      <section className={textIndent}>
        <h3 className={subHeadingClass} style={headingStyle}>
          {tr("valuesHeading", valuesHeadingOverride)}
        </h3>
        <ul className="mt-5 grid gap-3">
          {values.map((key) => (
            <li key={key} className="flex items-start gap-3">
              <span
                aria-hidden
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: "var(--tott-home-text-strong)" }}
              />
              <span
                className="block w-full"
                style={{
                  fontFamily: "'Inter', var(--font-sans, sans-serif)",
                  fontWeight: 400,
                  fontSize: `calc((clamp(0.8125rem, 0.4vw + 0.7rem, 0.9375rem)) * var(--mag-fs, 1))`,
                  lineHeight: 1.55,
                  color: "var(--tott-home-text-strong)",
                  maxWidth: "930px",
                }}
              >
                {t(key)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Closing pull-quote — Figma "Description" container:
          flex column, items-start, padding 0, gap 4px, max-width 930px,
          stretches to fill. Gold rule on the left, italic body text. */}
      <section className={textIndent}>
        <div
          className="flex w-full items-start gap-3"
          style={{ alignSelf: "stretch" }}
        >
          <span
            aria-hidden
            className="mt-1 block w-px shrink-0 self-stretch"
            style={{ backgroundColor: "var(--tott-magazine-btn-bg)" }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              padding: 0,
              gap: "4px",
              width: "100%",
              maxWidth: "930px",
              alignSelf: "stretch",
            }}
          >
            <p
              className="italic"
              style={{
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 400,
                fontSize: `calc((clamp(0.9375rem, 0.5vw + 0.8rem, 1.125rem)) * var(--mag-fs, 1))`,
                lineHeight: 1.55,
                letterSpacing: "-0.005em",
                color: "var(--tott-home-text-heading)",
                margin: 0,
              }}
            >
              <RichContent
                html={tr("closingQuote", closingQuoteOverride)}
                variant="inline"
              />
            </p>
          </div>
        </div>
      </section>

      {/* Explore Our Spaces — two cards (Writing Room / Reading Salon)
          centered under a small gold heading. */}
      <ExploreSpaces />
    </div>
  );
}

/** Section that follows the closing quote — heading + two info cards. */
function ExploreSpaces() {
  const t = useTranslations("Home.magazine.spaces");

  return (
    <section className="mt-6 px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32">
      <header className="text-center">
        <h3
          className="text-xl font-medium tracking-tight"
          style={{ color: "var(--tott-home-text-strong)" }}
        >
          <FirstWordGold raw={t("heading")} />
        </h3>
        <p
          className="mt-1 text-sm sm:text-base"
          style={{ color: "var(--tott-home-text-strong)" }}
        >
          {t("subtitle")}
        </p>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
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
        <span aria-hidden className="inline-block rtl:-scale-x-100">→</span>
      </Link>
    </div>
  );
}

/** Hairline divider matching the dim 1px line between sections in Figma. */
function SectionDivider() {
  return (
    <div
      aria-hidden
      className="h-px w-full"
      style={{ backgroundColor: "var(--tott-card-border)" }}
    />
  );
}

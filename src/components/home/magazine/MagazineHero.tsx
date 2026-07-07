"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { RichContent } from "@/components/ui/rich-text/RichContent";
import { Parallax } from "@/components/motion/Parallax";
import { ScrollFadeOut } from "@/components/motion/ScrollFadeOut";

type MagazineHeroProps = {
  /** Path to the hero artwork — defaults to the design SVG bundled in /public. */
  artwork?: string;
  /** Headline override. Empty/whitespace falls back to i18n. */
  title?: string;
  /** Subhead override. Empty/whitespace falls back to i18n. */
  subtitle?: string;
  /** Primary CTA label override. Empty/whitespace falls back to i18n. */
  primaryCtaLabel?: string;
  /** Secondary CTA label override. Empty/whitespace falls back to i18n. */
  secondaryCtaLabel?: string;
  /** Where the primary CTA links. */
  primaryHref?: string;
  /** Where the secondary CTA links. */
  secondaryHref?: string;
  /** Per-section text scale (1 = current sizes). */
  fontScale?: number;
};

/**
 * Top-of-page hero for the Magazine landing.
 *
 * Layout strategy:
 *  - <lg: stack the silk artwork on top, content card below. The artwork
 *    sits at its natural aspect (1392×483 ≈ 2.88:1) and the content gets
 *    its own dark card so the headline / CTAs read on the page surface
 *    rather than fighting a 100–250px tall image strip.
 *  - lg+: overlay the content on top of the artwork (Figma comp), which
 *    by then is ~360px+ tall and has room for the headline + CTAs.
 *
 * This eliminates the "content overflows a tiny image" problem that
 * happens whenever you try to absolute-position 3 stacked elements
 * onto a 111px-tall banner.
 */
const DEFAULT_ARTWORK = "/images/home/magazine-thumbnail.svg";

/** Treat any value that isn't a local path or http(s) URL as invalid,
 * since Next/Image will throw `Failed to construct URL`. Falls back to
 * the bundled default. */
function safeArtwork(src: string | undefined): {
  src: string;
  unoptimized: boolean;
} {
  const value = src?.trim();
  if (!value) return { src: DEFAULT_ARTWORK, unoptimized: false };
  const ok =
    value.startsWith("/") ||
    value.startsWith("http://") ||
    value.startsWith("https://");
  if (!ok) return { src: DEFAULT_ARTWORK, unoptimized: false };
  // External URLs use unoptimized so the Next loader doesn't gate the
  // hostname; local paths can be optimized normally.
  return { src: value, unoptimized: !value.startsWith("/") };
}

export function MagazineHero({
  artwork,
  title,
  subtitle,
  primaryCtaLabel,
  secondaryCtaLabel,
  primaryHref = "/magazine#magazine-content",
  secondaryHref = "/magazine#newsletter-heading",
  fontScale = 1,
}: MagazineHeroProps) {
  const t = useTranslations("Home.magazine.hero");
  const { src: artworkSrc, unoptimized: artworkUnoptimized } =
    safeArtwork(artwork);

  return (
    <section
      className="relative w-full px-4 pb-10 pt-24 sm:px-6 sm:pb-14 sm:pt-28 md:px-8 md:pb-20 md:pt-32"
      style={{ ["--mag-fs"]: fontScale } as React.CSSProperties}
    >
      <div className="relative mx-auto w-full max-w-[1392px]">
        {/* Artwork — natural aspect (1392×483 ≈ 2.88:1). */}
        <div
          className="relative w-full overflow-hidden rounded-[20px]"
          style={{ aspectRatio: "1392 / 483" }}
        >
          {/* Scroll-linked parallax: the silk artwork drifts vertically as
              the hero passes through the viewport, giving the banner depth.
              The overlay copy below is a sibling and stays static. */}
          <Parallax className="absolute inset-0" distance={28}>
            <Image
              src={artworkSrc}
              alt={t("imageAlt")}
              fill
              priority
              sizes="(min-width: 1392px) 1392px, 100vw"
              className="select-none object-cover"
              draggable={false}
              unoptimized={artworkUnoptimized}
            />
          </Parallax>

          {/* Content overlay — only enabled at lg+ where the artwork is
              tall enough (≥350px) to comfortably hold the headline and
              CTAs without crowding. */}
          <div className="pointer-events-none absolute inset-0 z-10 hidden flex-col items-start justify-end px-10 pb-12 text-start lg:flex lg:px-16 lg:pb-20">
            <ScrollFadeOut className="w-full">
              <HeroCopy
                t={t}
                title={title}
                subtitle={subtitle}
                primaryCtaLabel={primaryCtaLabel}
                secondaryCtaLabel={secondaryCtaLabel}
                primaryHref={primaryHref}
                secondaryHref={secondaryHref}
                tone="overlay"
                className="pointer-events-auto"
              />
            </ScrollFadeOut>
          </div>
        </div>

        {/* Content card — shown below the artwork on <lg viewports. */}
        <ScrollFadeOut className="mt-6 lg:hidden" lift={40}>
          <HeroCopy
            t={t}
            title={title}
            subtitle={subtitle}
            primaryCtaLabel={primaryCtaLabel}
            secondaryCtaLabel={secondaryCtaLabel}
            primaryHref={primaryHref}
            secondaryHref={secondaryHref}
            tone="stacked"
          />
        </ScrollFadeOut>
      </div>
    </section>
  );
}

type HeroCopyProps = {
  t: ReturnType<typeof useTranslations>;
  title?: string;
  subtitle?: string;
  primaryCtaLabel?: string;
  secondaryCtaLabel?: string;
  primaryHref: string;
  secondaryHref: string;
  /** "overlay" = white text + textShadow for placement over silk image.
   *  "stacked" = themed text colors for placement on the page surface. */
  tone: "overlay" | "stacked";
  className?: string;
};

function HeroCopy({
  t,
  title,
  subtitle,
  primaryCtaLabel,
  secondaryCtaLabel,
  primaryHref,
  secondaryHref,
  tone,
  className,
}: HeroCopyProps) {
  const isOverlay = tone === "overlay";
  const titleStyle = isOverlay
    ? {
        color: "#ffffff",
        textShadow: "0 1px 2px rgba(0,0,0,0.35)",
      }
    : { color: "var(--tott-home-text-strong)" };
  const subtitleStyle = isOverlay
    ? {
        color: "rgba(255,255,255,0.85)",
        textShadow: "0 1px 2px rgba(0,0,0,0.32)",
      }
    : { color: "var(--tott-home-text-muted)" };
  const secondaryStyle = isOverlay
    ? {
        backgroundColor: "rgba(20,20,20,0.65)",
        borderColor: "rgba(255,255,255,0.14)",
        color: "rgba(255,255,255,0.95)",
      }
    : {
        backgroundColor: "var(--tott-panel-bg)",
        borderColor: "var(--tott-card-border)",
        color: "var(--tott-home-text-strong)",
      };

  return (
    <div className={`flex w-full flex-col items-start ${className ?? ""}`}>
      <h1
        className="text-[calc(clamp(1.5rem,4.5vw,3.25rem)*var(--mag-fs,1))] font-medium leading-[1.1] tracking-tight"
        style={titleStyle}
      >
        {title?.trim() || t("title")}
      </h1>
      <p
        className="mt-3 max-w-[60ch] text-[calc(clamp(0.95rem,1.4vw,1.125rem)*var(--mag-fs,1))] leading-relaxed sm:mt-4"
        style={subtitleStyle}
      >
        <RichContent html={subtitle?.trim() || t("subtitle")} variant="inline" />
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-3 sm:mt-6 sm:gap-3.5">
        <Link
          href={primaryHref}
          className="inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90 sm:px-6 sm:text-[calc(0.95rem*var(--mag-fs,1))]"
          style={{
            backgroundColor: "var(--tott-magazine-btn-bg)",
            color: "var(--tott-auth-btn-text)",
          }}
        >
          {primaryCtaLabel?.trim() || t("ctaPrimary")}
        </Link>
        <Link
          href={secondaryHref}
          className="inline-flex items-center justify-center rounded-md border px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90 sm:px-6 sm:text-[calc(0.95rem*var(--mag-fs,1))]"
          style={secondaryStyle}
        >
          {secondaryCtaLabel?.trim() || t("ctaSecondary")}
        </Link>
      </div>
    </div>
  );
}

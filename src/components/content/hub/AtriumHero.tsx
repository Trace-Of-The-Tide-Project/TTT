"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { theme } from "@/lib/theme";
import HexBackground from "@/components/ui/HexBackground";
import { ChevronDownIcon, CompassIcon } from "@/components/ui/icons";
import { SpringLink } from "@/components/motion/SpringLink";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { GatewayIcon } from "./atrium-icons";
import { safeImage } from "./atrium-image";
import type { HeroData } from "./atrium-types";

type AtriumHeroProps = {
  item: HeroData;
};

/**
 * "The Shore" — full-viewport cinematic hero opening the Tideline descent.
 * With a featured item: full-bleed cover with a slow Ken Burns drift, scrims
 * for navbar/copy legibility, oversized serif headline, and an animated
 * tideline wave cutting the image into the page surface. With no item (or
 * the API down) it renders the same-scale intro variant — never a void.
 */
export function AtriumHero({ item }: AtriumHeroProps) {
  const t = useTranslations("Content");

  return item ? <FeaturedHero item={item} t={t} /> : <IntroHero t={t} />;
}

function FeaturedHero({
  item,
  t,
}: {
  item: NonNullable<HeroData>;
  t: ReturnType<typeof useTranslations>;
}) {
  const cover = safeImage(item.coverImage);

  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden">
      {/* Cover layer — Ken Burns animates this wrapper, never the fill image,
          so next/image layout math stays untouched. */}
      <div aria-hidden={!cover} className="tott-kenburns absolute inset-0">
        {cover ? (
          <Image
            src={cover.src}
            alt={item.title}
            fill
            priority
            sizes="100vw"
            className="select-none object-cover"
            draggable={false}
            unoptimized={cover.unoptimized}
          />
        ) : (
          // No cover — a deep-sea gradient plate (theme-independent so the
          // white overlay copy stays legible) with the room's glyph.
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "linear-gradient(180deg, #0d2437 0%, #050f18 100%)" }}
          >
            <GatewayIcon
              type={item.type}
              className="opacity-20 [&>svg]:h-32 [&>svg]:w-32 text-white"
            />
          </div>
        )}
      </div>

      {/* Scrims: bottom-up for the copy, top strip for the overlaid navbar. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.42) 34%, rgba(0,0,0,0) 62%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-48"
        style={{
          background: "linear-gradient(to bottom, rgba(0,0,0,0.55), transparent)",
        }}
      />

      <div className="relative mx-auto flex min-h-[100svh] w-full max-w-[1392px] flex-col justify-end px-6 pb-36 pt-28 sm:px-10 sm:pb-40">
        <RevealOnScroll className="flex flex-col items-start text-start">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="font-mono text-xs uppercase tracking-[0.22em]"
              style={{ color: theme.accentGold }}
            >
              {t("hub.heroEyebrow")}
            </span>
            <HeroEyebrow type={item.type} t={t} />
          </div>
          <h1
            className="mt-5 max-w-4xl font-serif font-medium text-white"
            style={{ fontSize: "clamp(2.75rem, 7vw, 6rem)", lineHeight: 1.05 }}
          >
            {item.title}
          </h1>
          {item.excerpt ? (
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg line-clamp-3">
              {item.excerpt}
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <SpringLink
              href={item.href}
              className="inline-flex h-11 items-center rounded-md px-6 text-sm font-semibold"
              style={{
                backgroundColor: theme.accentGold,
                color: "var(--tott-on-accent)",
              }}
            >
              {t("hub.heroCta")}
            </SpringLink>
            {item.authorName ? (
              <span className="text-sm text-white/70">
                {t("hub.byline", { name: item.authorName })}
              </span>
            ) : null}
          </div>
        </RevealOnScroll>
      </div>

      <ScrollCue label={t("hub.scrollCue")} color="rgba(255,255,255,0.75)" />
      <TidelineDivider />
    </section>
  );
}

function IntroHero({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <section
      className="relative min-h-[100svh] w-full overflow-hidden"
      style={{ backgroundColor: "var(--tott-home-surface)" }}
    >
      {/* Hex micro-motif band echoing the page chrome. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-40 overflow-hidden opacity-60"
      >
        <HexBackground />
      </div>

      <div className="relative mx-auto flex min-h-[100svh] w-full max-w-[1392px] flex-col items-center justify-center px-6 pb-36 pt-28 text-center sm:px-10">
        <RevealOnScroll className="flex flex-col items-center">
          <span
            aria-hidden
            className="inline-flex [&>svg]:h-14 [&>svg]:w-14"
            style={{ color: theme.accentGold }}
          >
            <CompassIcon />
          </span>
          <h1
            className="mt-6 font-serif font-medium"
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              lineHeight: 1.08,
              color: "var(--tott-home-text-strong)",
            }}
          >
            {t("hub.heroTitle")}
          </h1>
          <p
            className="mt-5 max-w-xl text-base leading-relaxed sm:text-lg"
            style={{ color: "var(--tott-home-text-muted)" }}
          >
            {t("hub.heroIntro")}
          </p>
          <SpringLink
            href="/content/article"
            className="mt-8 inline-flex h-11 items-center rounded-md px-6 text-sm font-semibold"
            style={{
              backgroundColor: theme.accentGold,
              color: "var(--tott-on-accent)",
            }}
          >
            {t("hub.heroIntroCta")}
          </SpringLink>
        </RevealOnScroll>
      </div>

      <ScrollCue label={t("hub.scrollCue")} color="var(--tott-home-text-muted)" />
      <TidelineDivider />
    </section>
  );
}

function HeroEyebrow({
  type,
  t,
}: {
  type: NonNullable<HeroData>["type"];
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide"
      style={{
        backgroundColor: "color-mix(in srgb, var(--tott-accent-gold) 22%, transparent)",
        color: "#fff",
      }}
    >
      <GatewayIcon type={type} className="[&>svg]:h-4 [&>svg]:w-4" />
      {t(`hub.featured.${type}`)}
    </span>
  );
}

function ScrollCue({ label, color }: { label: string; color: string }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-28 flex flex-col items-center gap-1 sm:bottom-32"
      style={{ color }}
    >
      <span className="font-mono text-[11px] uppercase tracking-[0.2em]">{label}</span>
      <span className="tott-scroll-cue inline-flex [&>svg]:h-4 [&>svg]:w-4">
        <ChevronDownIcon />
      </span>
    </div>
  );
}

/**
 * Animated tideline cutting the hero into the page surface. The inner strip
 * is 200% wide with a two-period wave, so the -50% translateX loop is
 * seamless (C1-continuous at the seam: matching end/start tangents).
 * Physical `left-0` on purpose — the drift is decorative and direction-free.
 */
function TidelineDivider() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 h-20 overflow-hidden sm:h-28"
    >
      <div className="tott-tide-drift absolute inset-y-0 left-0 w-[200%]">
        <svg
          className="h-full w-full"
          viewBox="0 0 2880 120"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M0,64 C240,96 480,32 720,64 C960,96 1200,32 1440,64 C1680,96 1920,32 2160,64 C2400,96 2640,32 2880,64 L2880,120 L0,120 Z"
            fill="var(--tott-home-surface)"
          />
          <path
            d="M0,64 C240,96 480,32 720,64 C960,96 1200,32 1440,64 C1680,96 1920,32 2160,64 C2400,96 2640,32 2880,64"
            stroke="color-mix(in srgb, var(--tott-accent-tide) 70%, transparent)"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </div>
  );
}

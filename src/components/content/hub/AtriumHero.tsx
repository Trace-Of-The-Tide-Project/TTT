"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { theme } from "@/lib/theme";
import { ChamferedSurface } from "@/components/ui/ChamferedSurface";
import HexBackground from "@/components/ui/HexBackground";
import { CompassIcon } from "@/components/ui/icons";
import { SpringLink } from "@/components/motion/SpringLink";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { GatewayIcon } from "./atrium-icons";
import { safeImage } from "./atrium-image";
import type { HeroData } from "./atrium-types";

type AtriumHeroProps = {
  item: HeroData;
};

/**
 * Cinematic hero. With a featured item it renders an oversized chamfered
 * cover (gold hairline tracing the cut edge) with the copy overlaid bottom-
 * start on lg+, stacked below on small screens. With no item it degrades to
 * a non-image intro variant — never a broken <img>, never an empty box.
 */
export function AtriumHero({ item }: AtriumHeroProps) {
  const t = useTranslations("Content");

  return (
    <section className="relative w-full px-4 pb-10 pt-24 sm:px-6 sm:pb-14 sm:pt-28 md:px-8 md:pb-16 md:pt-32">
      <div className="relative mx-auto w-full max-w-[1392px]">
        {item ? (
          <FeaturedHero item={item} t={t} />
        ) : (
          <IntroHero t={t} />
        )}
      </div>
    </section>
  );
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
    <ChamferedSurface
      chamfer={36}
      borderColor={theme.accentGold}
      className="relative w-full"
      style={{ aspectRatio: "1392 / 580" }}
    >
      {cover ? (
        <Image
          src={cover.src}
          alt={item.title}
          fill
          priority
          sizes="(min-width: 1392px) 1392px, 100vw"
          className="select-none object-cover"
          draggable={false}
          unoptimized={cover.unoptimized}
        />
      ) : (
        // No cover image — fill with the page surface + the room's glyph so
        // the hero still reads as a designed plate rather than a void.
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ backgroundColor: "var(--tott-home-surface)" }}
        >
          <GatewayIcon
            type={item.type}
            className="opacity-20 [&>svg]:h-28 [&>svg]:w-28"
          />
        </div>
      )}

      {/* Bottom-anchored scrim so the overlaid copy stays legible. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.32) 38%, rgba(0,0,0,0) 68%)",
        }}
      />

      {/* Horizontal padding ≥ the 36px chamfer so copy never clips into the
          cut corners on small screens. */}
      <RevealOnScroll className="absolute inset-x-0 bottom-0 flex flex-col items-start px-10 pb-10 text-start sm:px-12 sm:pb-12 lg:px-16 lg:pb-16">
        <HeroEyebrow type={item.type} t={t} />
        <h1
          className="mt-4 max-w-3xl font-semibold leading-tight tracking-tight text-white"
          style={{ fontSize: "clamp(1.75rem, 5vw, 3.5rem)" }}
        >
          {item.title}
        </h1>
        {item.excerpt ? (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
            {item.excerpt}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap items-center gap-4">
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
    </ChamferedSurface>
  );
}

function IntroHero({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <ChamferedSurface
      chamfer={36}
      borderColor={theme.accentGold}
      className="relative w-full overflow-hidden"
      style={{ aspectRatio: "1392 / 580", backgroundColor: "var(--tott-home-surface)" }}
    >
      {/* Inset hex micro-motif at the top, echoing the page chrome. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-32 overflow-hidden opacity-60"
      >
        <HexBackground />
      </div>

      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center sm:px-12">
        <span
          aria-hidden
          className="inline-flex [&>svg]:h-14 [&>svg]:w-14"
          style={{ color: theme.accentGold }}
        >
          <CompassIcon />
        </span>
        <h1
          className="mt-6 font-semibold leading-tight tracking-tight"
          style={{
            fontSize: "clamp(1.75rem, 5vw, 3.25rem)",
            color: "var(--tott-home-text-strong)",
          }}
        >
          {t("hub.heroTitle")}
        </h1>
        <p
          className="mt-4 max-w-xl text-sm leading-relaxed sm:text-base"
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
      </div>
    </ChamferedSurface>
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

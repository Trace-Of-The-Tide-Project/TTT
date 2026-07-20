"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { theme } from "@/lib/theme";
import { Link } from "@/i18n/navigation";
import { ChamferedSurface } from "@/components/ui/ChamferedSurface";
import { ChevronRightIcon } from "@/components/ui/icons";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { StaggerContainer } from "@/components/motion/StaggerContainer";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { GatewayIcon } from "./atrium-icons";
import { safeImage } from "./atrium-image";
import { formatDuration, type AtriumItem, type GatewayData, type GatewayType } from "./atrium-types";
import { framingStyle } from "@/lib/image-framing";

/** gold = written/editorial spine; tide = media/ambient rooms. */
const ACCENT_BY_TYPE: Record<GatewayType, string> = {
  article: theme.accentGold,
  threads: theme.accentGold,
  audio: theme.accentTide,
  gallery: theme.accentTide,
  video: theme.accentTide,
};

type AtriumGatewaysProps = {
  gateways: GatewayData[];
};

/**
 * THE SIGNATURE — the five rooms as a vertical archive index: full-width
 * strata bands, each with an oversized index numeral, the room name in
 * display serif, and an accent hairline in the room's color. Hover/focus
 * expands the band (pure CSS grid-rows trick, no JS) to reveal a peek of the
 * room's newest items. Whole band is clickable via a stretched link; on
 * mobile the peek is hidden and the band is one big tap target.
 */
export function AtriumGateways({ gateways }: AtriumGatewaysProps) {
  const t = useTranslations("Content");
  // Gradient hairlines use physical directions — flip for RTL so each one
  // fades away from the text edge (same trick as AtriumManifesto).
  const isRtl = useLocale() === "ar";

  return (
    <section className="relative w-full px-4 py-16 sm:px-6 md:px-8">
      <div className="mx-auto w-full max-w-[1392px]">
        <RevealOnScroll>
          <p
            className="font-mono text-xs uppercase tracking-[0.22em]"
            style={{ color: theme.accentGold }}
          >
            {t("hub.gatewaysEyebrow")}
          </p>
          <h2
            className="mt-3 font-serif font-medium tracking-tight"
            style={{
              fontSize: "clamp(1.875rem, 3.5vw, 2.75rem)",
              color: "var(--tott-home-text-strong)",
            }}
          >
            {t("hub.gatewaysHeading")}
          </h2>
        </RevealOnScroll>

        <StaggerContainer
          className="mt-10 flex flex-col border-b"
          style={{ borderColor: theme.cardBorder }}
        >
          {gateways.map((gateway, i) => (
            <StrataBand key={gateway.type} gateway={gateway} index={i} isRtl={isRtl} t={t} />
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

function StrataBand({
  gateway,
  index,
  isRtl,
  t,
}: {
  gateway: GatewayData;
  index: number;
  isRtl: boolean;
  t: ReturnType<typeof useTranslations>;
}) {
  const accent = ACCENT_BY_TYPE[gateway.type];
  const hairline = `linear-gradient(${isRtl ? "to left" : "to right"}, ${accent}, transparent 70%)`;

  return (
    <StaggerItem>
      <div
        className="group relative border-t py-6 sm:py-8"
        style={{ borderColor: theme.cardBorder }}
      >
        {/* Accent hairline riding the band's top edge; brightens on hover/focus. */}
        <span
          aria-hidden
          className="absolute -top-px start-0 h-px w-full opacity-40 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
          style={{ background: hairline }}
        />

        <div className="grid grid-cols-[auto_1fr] items-baseline gap-x-5 sm:gap-x-10">
          {/* Oversized index numeral — Latin digits deliberately (archive
              plate aesthetic, consistent across locales). */}
          <span
            aria-hidden
            className="select-none font-mono leading-none"
            style={{
              fontSize: "clamp(2.5rem, 7vw, 5.5rem)",
              color: accent,
              opacity: 0.18,
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>

          <div className="min-w-0">
            <div className="flex items-baseline justify-between gap-4">
              {/* Stretched link — covers the whole band (after:inset-0 resolves
                  against the band's `relative`). Peek links sit above at z-10. */}
              <Link
                href={gateway.href}
                className="font-serif font-medium tracking-tight outline-none transition-colors after:absolute after:inset-0 after:content-[''] focus-visible:underline"
                style={{
                  fontSize: "clamp(1.5rem, 3.5vw, 2.75rem)",
                  color: "var(--tott-home-text-strong)",
                }}
              >
                {t(`hub.types.${gateway.type}`)}
              </Link>
              <span
                className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold sm:inline-flex"
                style={{ color: accent }}
              >
                {t("hub.enter")}
                <span className="inline-flex [&>svg]:h-4 [&>svg]:w-4 rtl:-scale-x-100">
                  <ChevronRightIcon />
                </span>
              </span>
            </div>

            <p className="mt-1 text-sm" style={{ color: "var(--tott-home-text-muted)" }}>
              {gateway.count != null
                ? t(`hub.count.${gateway.type}`, { count: gateway.count })
                : t(`hub.typeDesc.${gateway.type}`)}
            </p>

            {/* Peek — desktop only, pure-CSS expand via the grid-rows 0fr→1fr
                trick. Keyboard reveal via group-focus-within. */}
            <div className="hidden grid-rows-[0fr] transition-[grid-template-rows] duration-300 group-hover:grid-rows-[1fr] group-focus-within:grid-rows-[1fr] motion-reduce:transition-none lg:grid">
              <div className="min-h-0 overflow-hidden">
                <div className="flex gap-8 pt-6">
                  {gateway.items.slice(0, 2).map((item) => (
                    <PeekItem key={item.id} item={item} accent={accent} />
                  ))}
                  {gateway.items.length === 0 ? (
                    <p className="pb-1 text-sm" style={{ color: "var(--tott-home-text-muted)" }}>
                      {t("hub.gatewayEmpty")}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StaggerItem>
  );
}

function PeekItem({ item, accent }: { item: AtriumItem; accent: string }) {
  const cover = safeImage(item.coverImage);
  const duration = formatDuration(item.mediaDuration);

  return (
    <Link
      href={item.href}
      className="relative z-10 flex max-w-sm items-center gap-4 outline-none focus-visible:underline"
    >
      <ChamferedSurface chamfer={10} borderColor={theme.cardBorder} className="w-36 shrink-0">
        <div className="relative w-full" style={{ aspectRatio: "16 / 10" }}>
          {cover ? (
            <Image
              src={cover.src}
              alt=""
              fill
              sizes="144px"
              className="object-cover"
              style={framingStyle(item.coverFraming)}
              unoptimized={cover.unoptimized}
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ backgroundColor: "var(--tott-panel-bg)" }}
            >
              <GatewayIcon type={item.type} className="opacity-30 [&>svg]:h-6 [&>svg]:w-6" />
            </div>
          )}
        </div>
      </ChamferedSurface>
      <span className="flex min-w-0 flex-col">
        <span
          className="line-clamp-2 text-sm font-medium leading-snug"
          style={{ color: "var(--tott-home-text-strong)" }}
        >
          {item.title}
        </span>
        <span className="mt-1 text-xs" style={{ color: "var(--tott-home-text-muted)" }}>
          {duration ?? item.meta ?? null}
        </span>
        <span aria-hidden className="mt-2 h-px w-8" style={{ backgroundColor: accent }} />
      </span>
    </Link>
  );
}

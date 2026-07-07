"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { theme } from "@/lib/theme";
import { Link } from "@/i18n/navigation";
import { ChamferedSurface } from "@/components/ui/ChamferedSurface";
import { ChevronRightIcon, WaveIcon } from "@/components/ui/icons";
import { SpringCard } from "@/components/motion/SpringCard";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { StaggerContainer } from "@/components/motion/StaggerContainer";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { GatewayIcon } from "./atrium-icons";
import { safeImage } from "./atrium-image";
import { formatDuration, type AtriumItem } from "./atrium-types";

type AtriumCuratedStripProps = {
  items: AtriumItem[];
};

/**
 * "Brought in by the tide" — a bento mosaic mixing all formats. The newest
 * item anchors the grid at 2×2 with its copy overlaid on the cover; the rest
 * fill 1×1 cells alongside a quote tile and the see-everything end cap.
 * Pure CSS grid (grid-flow-dense), zero carousel JS. Null when empty.
 */
export function AtriumCuratedStrip({ items }: AtriumCuratedStripProps) {
  const t = useTranslations("Content");
  if (items.length === 0) return null;

  const [lead, ...rest] = items;

  return (
    <section className="relative w-full px-4 py-16 sm:px-6 md:px-8">
      <div className="mx-auto w-full max-w-[1392px]">
        <RevealOnScroll>
          <p
            className="font-mono text-xs uppercase tracking-[0.22em]"
            style={{ color: theme.accentTide }}
          >
            {t("hub.curatedEyebrow")}
          </p>
          <h2
            className="mt-3 font-serif font-medium tracking-tight"
            style={{
              fontSize: "clamp(1.875rem, 3.5vw, 2.75rem)",
              color: "var(--tott-home-text-strong)",
            }}
          >
            {t("hub.curatedHeading")}
          </h2>
          <p
            className="mt-2 max-w-xl text-sm sm:text-base"
            style={{ color: "var(--tott-home-text-muted)" }}
          >
            {t("hub.curatedSub")}
          </p>
        </RevealOnScroll>

        <StaggerContainer className="mt-10 grid grid-flow-dense grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StaggerItem className="sm:col-span-2 sm:row-span-2">
            <LeadCard item={lead} />
          </StaggerItem>

          {rest.map((item) => (
            <StaggerItem key={item.id} className="min-h-0">
              <CuratedCard item={item} />
            </StaggerItem>
          ))}

          <StaggerItem>
            <QuoteTile text={t("hub.mosaicQuote")} />
          </StaggerItem>

          <StaggerItem>
            <EndCap label={t("hub.curatedEndCap")} />
          </StaggerItem>
        </StaggerContainer>
      </div>
    </section>
  );
}

/** 2×2 anchor — cover-filled plate with the copy overlaid bottom-start. */
function LeadCard({ item }: { item: AtriumItem }) {
  const cover = safeImage(item.coverImage);
  const duration = formatDuration(item.mediaDuration);

  return (
    <Link href={item.href} className="block h-full">
      <SpringCard interactive className="h-full">
        <ChamferedSurface chamfer={20} borderColor={theme.cardBorder} className="h-full">
          <div className="relative h-full min-h-[320px] overflow-hidden sm:min-h-[460px]">
            {cover ? (
              <Image
                src={cover.src}
                alt={item.title}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
                unoptimized={cover.unoptimized}
              />
            ) : (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ backgroundColor: "var(--tott-panel-bg)" }}
              >
                <GatewayIcon type={item.type} className="opacity-30 [&>svg]:h-16 [&>svg]:w-16" />
              </div>
            )}
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0) 70%)",
              }}
            />
            <FormatChip item={item} duration={duration} />
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-start p-6 text-start sm:p-8">
              <h3
                className="max-w-xl font-serif font-medium leading-tight text-white"
                style={{ fontSize: "clamp(1.375rem, 2.5vw, 2rem)" }}
              >
                {item.title}
              </h3>
              {item.excerpt ? (
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/80 line-clamp-3">
                  {item.excerpt}
                </p>
              ) : null}
              {item.meta ? <p className="mt-3 text-xs text-white/60">{item.meta}</p> : null}
            </div>
          </div>
        </ChamferedSurface>
      </SpringCard>
    </Link>
  );
}

function CuratedCard({ item }: { item: AtriumItem }) {
  const cover = safeImage(item.coverImage);
  const duration = formatDuration(item.mediaDuration);

  return (
    <Link href={item.href} className="block h-full">
      <SpringCard interactive className="h-full">
        <ChamferedSurface chamfer={16} borderColor={theme.cardBorder} className="h-full">
          <div className="flex h-full flex-col">
            <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16 / 10" }}>
              {cover ? (
                <Image
                  src={cover.src}
                  alt={item.title}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                  unoptimized={cover.unoptimized}
                />
              ) : (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ backgroundColor: "var(--tott-panel-bg)" }}
                >
                  <GatewayIcon type={item.type} className="opacity-30 [&>svg]:h-10 [&>svg]:w-10" />
                </div>
              )}
              <FormatChip item={item} duration={duration} />
            </div>

            <div className="flex flex-1 flex-col p-4">
              <h3
                className="line-clamp-2 text-sm font-semibold leading-snug"
                style={{ color: "var(--tott-home-text-strong)" }}
              >
                {item.title}
              </h3>
              {item.meta ? (
                <p
                  className="mt-2 line-clamp-1 text-xs"
                  style={{ color: "var(--tott-home-text-muted)" }}
                >
                  {item.meta}
                </p>
              ) : null}
            </div>
          </div>
        </ChamferedSurface>
      </SpringCard>
    </Link>
  );
}

/** Format chip — inset end/top so the chamfered corner doesn't clip it. */
function FormatChip({ item, duration }: { item: AtriumItem; duration: string | null }) {
  return (
    <span
      className="absolute end-3 top-3 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium"
      style={{ backgroundColor: "rgba(0,0,0,0.55)", color: "#fff" }}
    >
      <GatewayIcon type={item.type} className="[&>svg]:h-3.5 [&>svg]:w-3.5" />
      {duration ?? null}
    </span>
  );
}

/** Editorial breath inside the mosaic — the sea-line in tide wash. */
function QuoteTile({ text }: { text: string }) {
  return (
    <ChamferedSurface chamfer={16} borderColor={theme.accentTideMuted} className="h-full">
      <div
        className="flex h-full min-h-[220px] flex-col items-center justify-center gap-4 p-6 text-center"
        style={{
          backgroundColor: "color-mix(in srgb, var(--tott-accent-tide) 10%, var(--tott-home-surface))",
        }}
      >
        <span
          aria-hidden
          className="inline-flex [&>svg]:h-6 [&>svg]:w-6"
          style={{ color: theme.accentTide }}
        >
          <WaveIcon />
        </span>
        <p
          className="text-balance font-serif italic leading-relaxed"
          style={{ fontSize: "1.0625rem", color: "var(--tott-home-text-strong)" }}
        >
          {text}
        </p>
      </div>
    </ChamferedSurface>
  );
}

function EndCap({ label }: { label: string }) {
  return (
    <Link href="/content/article" className="block h-full">
      <SpringCard interactive className="h-full">
        <ChamferedSurface chamfer={16} borderColor={theme.accentTide} className="h-full">
          <div
            className="flex h-full min-h-[220px] flex-col items-center justify-center gap-3 p-6 text-center"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--tott-accent-tide) 12%, var(--tott-home-surface))",
            }}
          >
            <span className="text-sm font-semibold" style={{ color: theme.accentTide }}>
              {label}
            </span>
            <span
              className="inline-flex [&>svg]:h-5 [&>svg]:w-5 rtl:-scale-x-100"
              style={{ color: theme.accentTide }}
            >
              <ChevronRightIcon />
            </span>
          </div>
        </ChamferedSurface>
      </SpringCard>
    </Link>
  );
}

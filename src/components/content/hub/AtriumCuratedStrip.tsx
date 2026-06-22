"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { theme } from "@/lib/theme";
import { Link } from "@/i18n/navigation";
import { ChamferedSurface } from "@/components/ui/ChamferedSurface";
import { ChevronRightIcon } from "@/components/ui/icons";
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
 * One horizontal scroll-snap lane of recent items mixing all formats, each
 * badged by content type. Returns null when empty so the page stays coherent.
 */
export function AtriumCuratedStrip({ items }: AtriumCuratedStripProps) {
  const t = useTranslations("Content");
  if (items.length === 0) return null;

  return (
    <section className="relative w-full px-4 py-12 sm:px-6 md:px-8">
      <div className="mx-auto w-full max-w-[1392px]">
        <RevealOnScroll>
          <h2
            className="text-2xl font-semibold tracking-tight sm:text-3xl"
            style={{ color: "var(--tott-home-text-strong)" }}
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

        <StaggerContainer className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:thin]">
          {items.map((item) => (
            <StaggerItem
              key={item.id}
              className="w-[260px] shrink-0 snap-start sm:w-[300px]"
            >
              <CuratedCard item={item} />
            </StaggerItem>
          ))}

          {/* Tide-colored end-cap closing the rail. */}
          <StaggerItem className="w-[200px] shrink-0 snap-start">
            <EndCap label={t("hub.curatedEndCap")} />
          </StaggerItem>
        </StaggerContainer>
      </div>
    </section>
  );
}

function CuratedCard({ item }: { item: AtriumItem }) {
  const cover = safeImage(item.coverImage);
  const duration = formatDuration(item.mediaDuration);

  return (
    <Link href={item.href} className="block">
      <SpringCard interactive>
        <ChamferedSurface
          chamfer={16}
          borderColor={theme.cardBorder}
          className="h-full"
        >
          <div className="flex h-full flex-col">
            <div
              className="relative w-full overflow-hidden"
              style={{ aspectRatio: "16 / 10" }}
            >
              {cover ? (
                <Image
                  src={cover.src}
                  alt={item.title}
                  fill
                  sizes="300px"
                  className="object-cover"
                  unoptimized={cover.unoptimized}
                />
              ) : (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ backgroundColor: "var(--tott-panel-bg)" }}
                >
                  <GatewayIcon
                    type={item.type}
                    className="opacity-30 [&>svg]:h-10 [&>svg]:w-10"
                  />
                </div>
              )}
              {/* Format chip — tide for media, gold for written. Inset end-3/
                  top-3 so the chamfered corner doesn't clip it. */}
              <span
                className="absolute end-3 top-3 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium"
                style={{
                  backgroundColor: "rgba(0,0,0,0.55)",
                  color: "#fff",
                }}
              >
                <GatewayIcon type={item.type} className="[&>svg]:h-3.5 [&>svg]:w-3.5" />
                {duration ?? null}
              </span>
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

function EndCap({ label }: { label: string }) {
  return (
    <Link href="/content/article" className="block h-full">
      <SpringCard interactive className="h-full">
        <ChamferedSurface
          chamfer={16}
          borderColor={theme.accentTide}
          className="h-full"
        >
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

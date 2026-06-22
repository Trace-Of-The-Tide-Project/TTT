"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { theme } from "@/lib/theme";
import { Link } from "@/i18n/navigation";
import { ChamferedSurface } from "@/components/ui/ChamferedSurface";
import { ChevronRightIcon } from "@/components/ui/icons";
import { SpringLink } from "@/components/motion/SpringLink";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { StaggerContainer } from "@/components/motion/StaggerContainer";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { springs } from "@/lib/motion";
import { GatewayIcon } from "./atrium-icons";
import { formatDuration, type GatewayData, type GatewayType } from "./atrium-types";

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
 * THE SIGNATURE — an accordion of chamfered octagons. Each of the five
 * content rooms is a tall tile that springs wider on hover/focus while its
 * neighbors recede, revealing a 2-up peek of that room's newest items. The
 * active tile's gold/tide hairline brightens; a sliding marker (layoutId)
 * tracks it and auto-mirrors in RTL. Tiles always render + link even when a
 * room is empty. Reduced motion collapses the morph to opacity/border only.
 */
export function AtriumGateways({ gateways }: AtriumGatewaysProps) {
  const t = useTranslations("Content");
  const [active, setActive] = useState<number | null>(null);
  const reduce = useReducedMotion();

  return (
    <section className="relative w-full px-4 py-12 sm:px-6 md:px-8">
      <div className="mx-auto w-full max-w-[1392px]">
        <RevealOnScroll>
          <h2
            className="text-2xl font-semibold tracking-tight sm:text-3xl"
            style={{ color: "var(--tott-home-text-strong)" }}
          >
            {t("hub.gatewaysHeading")}
          </h2>
        </RevealOnScroll>

        <StaggerContainer
          className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-stretch"
          onMouseLeave={() => setActive(null)}
        >
          {gateways.map((gateway, i) => (
            <GatewayTile
              key={gateway.type}
              gateway={gateway}
              active={active === i}
              dimmed={active !== null && active !== i}
              reduce={!!reduce}
              onActivate={() => setActive(i)}
              onDeactivate={() => setActive((cur) => (cur === i ? null : cur))}
              t={t}
            />
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

function GatewayTile({
  gateway,
  active,
  dimmed,
  reduce,
  onActivate,
  onDeactivate,
  t,
}: {
  gateway: GatewayData;
  active: boolean;
  dimmed: boolean;
  reduce: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const accent = ACCENT_BY_TYPE[gateway.type];
  const hasItems = gateway.items.length > 0;

  // Reduced motion: change only opacity, never width/scale.
  const flex = reduce ? 1 : active ? 2.4 : dimmed ? 0.85 : 1;
  const scale = reduce || !dimmed ? 1 : 0.97;
  const opacity = dimmed ? 0.78 : 1;

  return (
    <StaggerItem className="lg:min-w-0 lg:flex-1">
      <motion.div
        className="relative h-full"
        animate={{ flex, scale, opacity }}
        transition={springs.morph}
        onMouseEnter={onActivate}
        onFocus={onActivate}
        onBlur={onDeactivate}
        // Focus-within drives the same reveal for keyboard users.
        tabIndex={-1}
      >
        <ChamferedSurface
          chamfer={20}
          borderColor={active ? accent : theme.cardBorder}
          className="h-full"
        >
          <div
            className="relative flex h-full min-h-[200px] flex-col p-6 lg:min-h-[320px]"
            style={{ backgroundColor: "var(--tott-home-surface)" }}
          >
            {/* Accent marker — stays mounted on every tile (so motion always
                has an element to animate; no unmount pop) and grows in from
                the leading edge on the active one. Inset start-6/top-3 so the
                bar clears the chamfered corner. */}
            <motion.span
              aria-hidden
              className="absolute start-6 top-3 h-1"
              style={{ backgroundColor: accent }}
              initial={false}
              animate={{ width: active ? 48 : 0, opacity: active ? 1 : 0 }}
              transition={springs.morph}
            />

            <Link
              href={gateway.href}
              className="flex items-center gap-4 outline-none"
            >
              <span
                className="inline-flex [&>svg]:h-10 [&>svg]:w-10"
                style={{ color: accent }}
              >
                <GatewayIcon type={gateway.type} />
              </span>
              <span className="flex flex-col">
                <span
                  className="text-lg font-semibold tracking-tight"
                  style={{ color: "var(--tott-home-text-strong)" }}
                >
                  {t(`hub.types.${gateway.type}`)}
                </span>
                <span
                  className="text-xs"
                  style={{ color: "var(--tott-home-text-muted)" }}
                >
                  {gateway.count != null
                    ? t(`hub.count.${gateway.type}`, { count: gateway.count })
                    : t(`hub.typeDesc.${gateway.type}`)}
                </span>
              </span>
            </Link>

            {/* Reveal layer — shown when active (or always, on the stacked
                narrow layout where there is room). */}
            {active && hasItems ? (
              <GatewayPeek gateway={gateway} accent={accent} />
            ) : null}

            {/* Empty room → designed copy, never a blank tile. */}
            {active && !hasItems ? (
              <p
                className="mt-6 text-sm"
                style={{ color: "var(--tott-home-text-muted)" }}
              >
                {t("hub.gatewayEmpty")}
              </p>
            ) : null}

            <div className="mt-auto pt-6">
              <SpringLink
                href={gateway.href}
                className="inline-flex items-center gap-1.5 text-sm font-semibold"
                style={{ color: accent }}
              >
                {t("hub.enter")}
                <span className="inline-flex [&>svg]:h-4 [&>svg]:w-4 rtl:-scale-x-100">
                  <ChevronRightIcon />
                </span>
              </SpringLink>
            </div>
          </div>
        </ChamferedSurface>
      </motion.div>
    </StaggerItem>
  );
}

/** Type-aware 2-up peek so the five rooms feel genuinely different. */
function GatewayPeek({
  gateway,
  accent,
}: {
  gateway: GatewayData;
  accent: string;
}) {
  return (
    <StaggerContainer className="mt-6 flex flex-col gap-3">
      {gateway.items.slice(0, 2).map((item) => {
        const duration = formatDuration(item.mediaDuration);
        return (
          <StaggerItem key={item.id}>
            <Link
              href={item.href}
              className="group block border-s-2 ps-3"
              style={{ borderColor: `color-mix(in srgb, ${accent} 60%, transparent)` }}
            >
              <span
                className="line-clamp-2 text-sm font-medium leading-snug"
                style={{ color: "var(--tott-home-text-strong)" }}
              >
                {item.title}
              </span>
              <span
                className="mt-1 flex items-center gap-2 text-xs"
                style={{ color: "var(--tott-home-text-muted)" }}
              >
                {/* Audio/video carry a runtime; written rooms carry meta. */}
                {duration ? <span>{duration}</span> : item.meta ? <span>{item.meta}</span> : null}
              </span>
            </Link>
          </StaggerItem>
        );
      })}
    </StaggerContainer>
  );
}

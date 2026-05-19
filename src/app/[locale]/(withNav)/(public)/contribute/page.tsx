"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import HexBackground from "@/components/ui/HexBackground";
import { ContributionForm } from "@/components/contribute/ContributionForm";
import { PenLineIcon } from "@/components/ui/icons";
import {
  contributionTypeSlug,
  isKnownContributionTypeSlug,
} from "@/lib/contributions/contribution-type-i18n";
import {
  CONTRIBUTION_TYPE_ORDER,
  getContributionTypeIcon,
} from "@/lib/contributions/contribution-type-icons";
import { getCardIconPath } from "@/lib/contributions/contribution-card-icon-paths";
import type { ContributionType } from "@/services/contributions.service";
import { useContributionTypes } from "@/hooks/queries/contributions";

// Theme tokens — every color routes through globals.css so the
// contribute page (Leave a Trace hero + honeycomb of contribution
// types) swaps cleanly between dark and light themes.
const ACCENT = "var(--tott-accent-gold)";
const CARD_BG = "var(--tott-elevated)";
const CARD_BORDER = "var(--tott-card-border)";
const LABEL_COLOR = "var(--tott-home-text-strong)";
const HELPER_COLOR = "var(--tott-home-text-muted)";

// Figma honeycomb layout — 9 cards staggered in a 3-2-3-1 pattern.
// Each entry is (col, row) in the 3-column / 4-row grid; the middle
// rows (1 and 3) are offset by half a column and contain 2 / 1 cards
// respectively. Card 174×185, horizontal gap 16px, vertical step
// 156px (~84% of card height so cards overlap and read as a
// honeycomb cluster).
const CARD_W = 174;
const CARD_H = 185;
const CARD_GAP_X = 16;
const ROW_STEP = 156;

const HONEYCOMB_POSITIONS: { left: number; top: number }[] = [
  // Row 0 — 3 cards
  { left: 0, top: 0 },
  { left: CARD_W + CARD_GAP_X, top: 0 },
  { left: 2 * (CARD_W + CARD_GAP_X), top: 0 },
  // Row 1 — 2 cards, offset half a column
  { left: (CARD_W + CARD_GAP_X) / 2, top: ROW_STEP },
  { left: (CARD_W + CARD_GAP_X) / 2 + (CARD_W + CARD_GAP_X), top: ROW_STEP },
  // Row 2 — 3 cards
  { left: 0, top: 2 * ROW_STEP },
  { left: CARD_W + CARD_GAP_X, top: 2 * ROW_STEP },
  { left: 2 * (CARD_W + CARD_GAP_X), top: 2 * ROW_STEP },
  // Row 3 — 1 card, last column
  {
    left: (CARD_W + CARD_GAP_X) / 2 + (CARD_W + CARD_GAP_X),
    top: 3 * ROW_STEP,
  },
];

const GRID_W = 2 * (CARD_W + CARD_GAP_X) + CARD_W; // 554
const GRID_H = 3 * ROW_STEP + CARD_H; // 654

export default function ContributePage() {
  const t = useTranslations("Contribute");
  const tPage = useTranslations("Contribute.page");
  const typesQuery = useContributionTypes();
  const types: ContributionType[] = typesQuery.data ?? [];
  const isLoadingTypes = typesQuery.isPending;
  const typesError = typesQuery.error
    ? typesQuery.error instanceof Error
      ? typesQuery.error.message
      : tPage("typesLoadError")
    : null;
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);

  useEffect(() => {
    if (!types.length) return;
    setSelectedTypeId((prev) => {
      if (prev) return prev;
      return (
        types.find((ty) => ty.name === "Personal Story")?.id ??
        types[0]?.id ??
        null
      );
    });
  }, [types]);

  const orderedTypes = useMemo(() => {
    if (!types.length) return [];
    const index = new Map<string, number>();
    CONTRIBUTION_TYPE_ORDER.forEach((n, i) => index.set(n, i));
    return [...types].sort((a, b) => {
      const ai =
        index.get(a.name as (typeof CONTRIBUTION_TYPE_ORDER)[number]) ?? 999;
      const bi =
        index.get(b.name as (typeof CONTRIBUTION_TYPE_ORDER)[number]) ?? 999;
      if (ai !== bi) return ai - bi;
      return a.name.localeCompare(b.name);
    });
  }, [types]);

  const typeLabel = (apiName: string) => {
    const slug = contributionTypeSlug(apiName);
    if (!isKnownContributionTypeSlug(slug)) return apiName;
    return (t as (key: string) => string)(`types.${slug}`);
  };

  return (
    <main
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{ backgroundColor: "var(--tott-home-surface)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-40 overflow-hidden"
        style={{ opacity: "var(--tott-dash-hex-opacity, 1)" }}
      >
        <HexBackground />
      </div>

      <div
        className="relative mx-auto w-full px-4 pb-20 pt-24 sm:px-6 sm:pt-28 md:px-8 md:pt-32"
        style={{ maxWidth: "min(92vw, 1280px)" }}
      >
        {/* Header — centered 543px max, writing icon + title + subtitle */}
        <header
          className="mx-auto flex flex-col items-center text-center"
          style={{
            width: "100%",
            maxWidth: "543px",
            gap: "24px",
          }}
        >
          <span
            aria-hidden
            className="inline-flex items-center justify-center"
            style={{
              width: "40px",
              height: "40px",
              color: HELPER_COLOR,
            }}
          >
            <span className="[&>svg]:h-10 [&>svg]:w-10">
              <PenLineIcon />
            </span>
          </span>
          <div
            className="flex w-full flex-col items-center"
            style={{ gap: "8px" }}
          >
            <h1
              style={{
                fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
                fontWeight: 500,
                fontSize: "20px",
                lineHeight: "28px",
                color: LABEL_COLOR,
                margin: 0,
              }}
            >
              {tPage("heroTitle")}
            </h1>
            <p
              style={{
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 400,
                fontSize: "14px",
                lineHeight: "20px",
                letterSpacing: "-0.005em",
                color: HELPER_COLOR,
                margin: 0,
              }}
            >
              {tPage("heroSubtitle")}
            </p>
          </div>
        </header>

        {/* Form column — 554px centered, 24px gap between sections */}
        <div
          className="mx-auto flex w-full flex-col items-center"
          style={{
            maxWidth: "554px",
            gap: "24px",
            marginTop: "40px",
          }}
        >
          {typesError ? (
            <div
              className="w-full rounded-lg border px-4 py-3 text-sm"
              style={{
                // Tint the error banner from the negative token so it
                // adapts to theme without hardcoding red literals.
                borderColor:
                  "color-mix(in srgb, var(--tott-dash-negative) 35%, transparent)",
                backgroundColor:
                  "color-mix(in srgb, var(--tott-dash-negative) 8%, transparent)",
                color: "var(--tott-dash-negative)",
              }}
            >
              {typesError}
            </div>
          ) : null}

          {/* Select cards — staggered honeycomb on lg+, simple
              wrap below. The honeycomb container is sized to the
              exact Figma 554×654 and uses absolute positioning so
              cards land at the precise left/top values. */}
          <div
            className="relative hidden lg:block"
            style={{ width: `${GRID_W}px`, height: `${GRID_H}px` }}
          >
            {(isLoadingTypes ? [] : orderedTypes)
              .slice(0, HONEYCOMB_POSITIONS.length)
              .map((ty, i) => {
                const pos = HONEYCOMB_POSITIONS[i];
                return (
                  <div
                    key={ty.id}
                    className="absolute"
                    style={{
                      left: `${pos.left}px`,
                      top: `${pos.top}px`,
                      width: `${CARD_W}px`,
                      height: `${CARD_H}px`,
                    }}
                  >
                    <SelectCard
                      typeName={ty.name}
                      label={typeLabel(ty.name)}
                      selected={selectedTypeId === ty.id}
                      onClick={() => setSelectedTypeId(ty.id)}
                    />
                  </div>
                );
              })}
          </div>

          {/* Mobile / tablet — 2-col wrap so cards stay legible */}
          <div
            className="grid w-full grid-cols-2 lg:hidden"
            style={{ gap: "16px" }}
          >
            {(isLoadingTypes ? [] : orderedTypes).map((ty) => (
              <SelectCard
                key={ty.id}
                typeName={ty.name}
                label={typeLabel(ty.name)}
                selected={selectedTypeId === ty.id}
                onClick={() => setSelectedTypeId(ty.id)}
              />
            ))}
          </div>

          <ContributionForm selectedTypeId={selectedTypeId} />
        </div>
      </div>
    </main>
  );
}

// Figma hex shape — true hexagon with softly-rounded corners,
// rendered in a 174×185 viewBox so it shares its coordinate space
// with the brand-exported "Select Card N.svg" icon paths (their
// glyphs sit around x=78-96, y=69-87). The stroke color/width swap
// with the selected state instead of using a separate "selected"
// SVG so localization, icon, and label all stay dynamic.
const HEX_PATH =
  "M80.2441 3.82812C84.5112 1.76158 89.4888 1.76158 93.7559 3.82812L164.756 38.2139C170.103 40.8037 173.5 46.2225 173.5 52.1641V132.836C173.5 138.777 170.103 144.196 164.756 146.786L93.7559 181.172C89.4888 183.238 84.5112 183.238 80.2441 181.172L9.24414 146.786C3.89673 144.196 0.5 138.777 0.5 132.836V52.1641C0.5 46.2225 3.89673 40.8037 9.24414 38.2139L80.2441 3.82812Z";

function SelectCard({
  typeName,
  label,
  selected,
  onClick,
}: {
  typeName: string;
  label: string;
  selected?: boolean;
  onClick?: () => void;
}) {
  const iconPath = getCardIconPath(typeName);
  const FallbackIcon = iconPath ? null : getContributionTypeIcon(typeName);
  const iconColor = selected ? ACCENT : HELPER_COLOR;
  const labelColor = selected ? ACCENT : LABEL_COLOR;
  const hexStroke = selected ? ACCENT : CARD_BORDER;
  const hexStrokeWidth = selected ? 2 : 1;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className="group relative flex h-full w-full cursor-pointer items-center justify-center transition-colors focus:outline-none"
      style={{
        background: "transparent",
        border: "none",
        padding: 0,
        aspectRatio: "174 / 185",
      }}
    >
      {/* Hex silhouette + icon — when a brand icon path exists we
          render it as a sibling path inside the same SVG so it lands
          at the exact y=70-87 strip the Figma uses. Cards without a
          dedicated brand icon (Biography, Artwork) fall back to the
          existing React icon component, absolutely positioned at
          the same vertical anchor (~y=78 → 42% of card height). */}
      <svg
        aria-hidden
        viewBox="0 0 174 185"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full select-none"
      >
        <path
          d={HEX_PATH}
          fill={CARD_BG}
          stroke={hexStroke}
          strokeWidth={hexStrokeWidth}
        />
        {iconPath ? (
          <path
            d={iconPath.d}
            fill="none"
            stroke={iconColor}
            strokeWidth={iconPath.strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
      </svg>

      {FallbackIcon ? (
        <span
          aria-hidden
          className="pointer-events-none absolute left-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 items-center justify-center [&>svg]:h-6 [&>svg]:w-6"
          style={{
            top: `${(78 / 185) * 100}%`,
            width: "24px",
            height: "24px",
            color: iconColor,
          }}
        >
          <FallbackIcon />
        </span>
      ) : null}

      {/* Label — y=108 in the 185-tall hex maps to ~58.4% from top. */}
      <span
        className="pointer-events-none absolute left-0 right-0 z-10 px-3 text-center"
        style={{
          top: `${(108 / 185) * 100}%`,
          fontFamily: "'Inter', var(--font-sans, sans-serif)",
          fontWeight: 500,
          fontSize: "14px",
          lineHeight: "20px",
          letterSpacing: "-0.005em",
          color: labelColor,
        }}
      >
        {label}
      </span>
    </button>
  );
}

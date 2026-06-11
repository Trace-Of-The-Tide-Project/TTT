"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/components/providers/AuthProvider";
import { hasBrowserAuthSession } from "@/lib/auth/browser-session";
import type { HexCard } from "@/app/[locale]/(withNav)/(public)/home/page";

/** Figma `Homepage.svg` artboard width — used only for fade-height ratio scaling. */
const FIGMA_HOMEPAGE_WIDTH = 1440;

/* ─────────────────────────────── geometry ───────────────────────────────
   BG.svg + Image.svg (sharp pointy-top hex frames).
*/
const HEX_W = 360;
const HEX_H = 435;
const HEX_TOP_Y = 87.8; // y-coord of top-left/right corner in 360×435 frame
const HEX_TOP_PCT = (HEX_TOP_Y / HEX_H) * 100; // 20.18%
const ROW_RATIO = 1 - HEX_TOP_PCT / 100; // 0.7982 — pointy-top vertical step

// SVG path data — lifted directly from the user's asset files
const BG_PATH = "M180.5 0.555649L360.5 87.8065V348.305L180.5 435.556L0.5 348.305V87.8065L180.5 0.555649Z";
// Image.svg inner hex (328×396, but expressed in 360×435 coords below for
// uniform scaling — we offset by (16, 19.5) so it sits centred inside BG)
const IMAGE_PATH_LOCAL = "M164 -1.76941L328 77.4623V317.999L164 397.231L0 317.999V77.4623L164 -1.76941Z";
// Header.svg union shape (688×399) — rounded rectangle with two hexagonal
// tabs on top and two on the bottom that interlock with the hex grid.
const HEADER_PATH = "M157.04 3.3626C161.437 1.23833 166.563 1.23832 170.96 3.3626L324.702 77.6382C326.873 78.6868 329.252 79.2314 331.662 79.2314H356.338C358.748 79.2314 361.127 78.6868 363.298 77.6382L517.04 3.3626C521.437 1.23833 526.563 1.23832 530.96 3.3626L678.96 74.8642C684.488 77.5346 688 83.1321 688 89.2709V309.729C688 315.868 684.488 321.465 678.96 324.136L530.96 395.637C526.563 397.762 521.437 397.762 517.04 395.637L363.298 321.362C361.127 320.313 358.748 319.769 356.338 319.769H331.662C329.252 319.769 326.873 320.313 324.702 321.362L170.96 395.637C166.563 397.762 161.437 397.762 157.04 395.637L9.03981 324.136C3.51228 321.465 0 315.868 0 309.729V89.2709C0 83.1321 3.51229 77.5346 9.03981 74.8641L157.04 3.3626Z";

// CSS clip-path for the outer (sharp) hex — derived from BG.svg coords.
const SHARP_HEX_CLIP =
  `polygon(50% 0%, 100% ${HEX_TOP_PCT}%, 100% ${100 - HEX_TOP_PCT}%, 50% 100%, 0% ${100 - HEX_TOP_PCT}%, 0% ${HEX_TOP_PCT}%)`;

// Image.svg inner hex sits inside the 361×437 BG frame at offset (16.5, 20.5).

/* ─────────────────────────────── data ─────────────────────────────── */
function isValidImageUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}


/* ─────────────────────────────── grid layout ───────────────────────────────
   Matches Homepage.svg: 6 visible content rows + 1 top-peek row.
   Pointy-top hex tessellation:
     - "flush" rows (1, 3, 5): 5 hexes, centers at x = 0, w, 2w, 3w, 4w
     - "offset" rows (0, 2, 4): 4 hexes, centers at x = 0.5w, 1.5w, 2.5w, 3.5w
   With viewport width = 4w (i.e. hex width = vw / 4), the leftmost flush hex
   peeks off the left edge and the rightmost peeks off the right — matching
   Homepage.svg exactly. */
const ROWS = 6;

type Cell = {
  row: number;
  col: number;
  isOffset: boolean;
  isTopPeek?: boolean;
  isHeroSlot?: boolean; // covered by the hero rectangle
};

function buildGrid(narrow: boolean): Cell[] {
  const flushCols = narrow ? 3 : 5;
  const offsetCols = narrow ? 2 : 4;
  const cells: Cell[] = [];

  // Top peek row — partial hexes bleeding in from above.
  // Same column pattern as a flush row so the points line up with row 1.
  for (let col = 0; col < flushCols; col++) {
    cells.push({ row: -1, col, isOffset: false, isTopPeek: true });
  }

  for (let row = 0; row < ROWS; row++) {
    const isOffset = row % 2 === 0;
    const cellsInRow = isOffset ? offsetCols : flushCols;
    for (let col = 0; col < cellsInRow; col++) {
      // Row 0 (offset): the hero's two top hex tabs occupy cols 0 and 1
      // on desktop. On narrow (2 offset cols) the hero — scaled to mobile —
      // covers BOTH cols, so skip the whole row to avoid a hex peeking from
      // under it.
      if (narrow && row === 0) continue;
      if (!narrow && row === 0 && (col === 0 || col === 1)) continue;
      cells.push({ row, col, isOffset });
    }
  }
  return cells;
}

function calcHexSize(viewportWidth: number): number {
  // Hex math is calibrated to vw / N on desktop (5 columns with edges peeking).
  // Under 480px we switch to a 3-flush / 2-offset grid (hex = vw/2) to keep
  // the natural edge-peek without right-side overflow.
  if (viewportWidth < 480) return Math.round(viewportWidth / 2);
  if (viewportWidth < 768) return Math.round(viewportWidth / 2.5);
  if (viewportWidth < 1100) return Math.round(viewportWidth / 3);
  return Math.round(viewportWidth / 4);
}

/* ─────────────────────────────── tokens (Figma) ─────────────────────────────── */
const GOLD      = "#C9A96E";
const GOLD_DARK = "#BD9352";
const GOLD_TEXT = "#332217";

/** Home page surface tokens — values live in globals.css (`--tott-home-*`) and switch with theme. */
const TK = {
  hexFill:    "var(--tott-home-surface)",
  hexStroke:  "var(--tott-home-hex-stroke)",
  peekInner:  "var(--tott-home-hex-peek)",
  sheenColor: "var(--tott-home-hex-sheen)",
  badgeBg:    "var(--tott-home-badge-bg)",
  textStrong: "var(--tott-home-text-strong)",
  textShadow: "var(--tott-home-text-shadow)",
  heroGradTop: "var(--tott-home-hero-grad-top)",
  heroGradMid: "var(--tott-home-hero-grad-mid)",
} as const;

/** Inner hex image bounds — `IMAGE_PATH_LOCAL` ymin … ymax after `translate(16.5 20.5)`. */
const INNER_HEX_SCRIM_RECT = {
  x: 16.5,
  y: 20.5 - 1.76941,
  w: 328,
  h: 397.231 + 1.76941,
} as const;

type Props = { cards: HexCard[] };

export function HomeHexGrid({ cards }: Props) {
  const t = useTranslations("Home");
  const { status } = useAuth();
  const heroGradId = useId().replace(/:/g, "");

  /** Layout width + hex size (for title scale + grid offset). */
  const [layout, setLayout] = useState<{ hex: number; vw: number }>({
    hex: 360,
    vw: 1440,
  });

  useEffect(() => {
    const update = () =>
      setLayout({ hex: calcHexSize(window.innerWidth), vw: window.innerWidth });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const hexSize = layout.hex;
  const vw = layout.vw;
  const narrow = vw < 480;
  const grid = useMemo(() => buildGrid(narrow), [narrow]);

  const sessionPresent = hasBrowserAuthSession(status);
  const gridCards = cards;
  const heroHref = sessionPresent ? "/fields" : "/auth/login";
  const hexHeight = Math.round(hexSize * (HEX_H / HEX_W));
  const colWidth = hexSize; // pointy-top: column step = full hex width
  const rowHeight = Math.round(hexHeight * ROW_RATIO);
  const gridHeight = (ROWS - 1) * rowHeight + hexHeight;

  // Card typography scales with hex size, anchored to Figma's 20px / 12px
  // values at hexSize=360.
  const sz = hexSize / 360;
  const titleSize = Math.max(11, Math.round(20 * sz));
  const titleLine = Math.max(15, Math.round(28 * sz));
  const badgeSize = Math.max(9, Math.round(12 * sz));
  const badgeLine = Math.max(12, Math.round(16 * sz));

  // Hero (Figma: 688×399 at left:11 top:162 in the source frame, where
  // row 0's top vertex is at y=144). Translated to our grid coords (row 0
  // top vertex at y=0): heroTop = 162 − 144 = 18. This makes the hero's
  // top tabs apex (y=3 in the SVG) sit at y≈21, just below row 0's top.
  const heroWidth = Math.round(688 * sz);
  const heroHeight = Math.round(399 * sz);
  const heroLeft = Math.max(8, Math.round(11 * sz));

  /** Nudge the hex lattice + hero down together (Figma tuning). */
  const gridDropPx = Math.round(96 * sz);
  const heroTop = Math.round(18 * sz) + gridDropPx;

  // Slightly smaller headline on narrow widths so "Trace …" stays one line with nowrap.
  const heroTitleScale = vw < 520 ? 0.68 : vw < 640 ? 0.76 : vw < 820 ? 0.85 : vw < 1024 ? 0.92 : 1;
  const heroTitleSize = Math.max(16, Math.round(48 * sz * heroTitleScale));
  const heroTitleLine = Math.round(56 * sz * heroTitleScale);
  const heroBodySize = Math.round(18 * sz);
  const heroBodyLine = Math.round(24 * sz);

  let cardIdx = 0;
  const positionedCells = grid.map((cell) => {
    const card = cell.isTopPeek || gridCards.length === 0 ? null : gridCards[cardIdx++ % gridCards.length];
    // Pixel position of the hex's bounding-box top-left corner.
    const center_x = cell.isOffset
      ? cell.col * colWidth + colWidth / 2
      : cell.col * colWidth;
    const left = center_x - hexSize / 2;
    const top = cell.row * rowHeight + gridDropPx;
    return { ...cell, card, top, left };
  });

  /** Top fade (formerly Slider Content.svg): #171717 → transparent over the lattice. */
  const topFadeH = Math.min(
    240,
    Math.round((Math.min(vw, FIGMA_HOMEPAGE_WIDTH) / FIGMA_HOMEPAGE_WIDTH) * 240),
  );
  /** Bottom lattice fade — solid footer color below, washes out ~half+ of bottom row into #171717 section. */
  const bottomFadeH = Math.min(
    380,
    Math.max(
      200,
      Math.round(hexHeight * 0.58 + rowHeight * 0.48),
    ),
  );

  return (
    <div className="relative w-full overflow-hidden" style={{ backgroundColor: TK.hexFill }}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[5]"
        style={{
          height: topFadeH,
          background: `linear-gradient(180deg, var(--tott-home-surface) 0%, rgba(var(--tott-home-surface-rgb), 0) 100%)`,
        }}
      />
      <div
        className="relative w-full overflow-hidden"
        style={{ height: gridHeight + gridDropPx }}
      >
      {positionedCells.map((c, i) => (
        <CellView
          key={i}
          cellId={String(i)}
          isTopPeek={!!c.isTopPeek}
          card={c.card}
          width={hexSize}
          height={hexHeight}
          top={c.top}
          left={c.left}
          titleSize={titleSize}
          titleLine={titleLine}
          badgeSize={badgeSize}
          badgeLine={badgeLine}
        />
      ))}

      {(() => {
        // Rectangle 4.svg curve — used both as the visible fill AND as the mask
        // so the backdrop blur tapers in with the gradient (no hard top edge).
        // The rgba colors reference --tott-home-surface-rgb so they swap with theme.
        const c = "var(--tott-home-surface-rgb)";
        const fadeStops =
          `transparent 0%, rgba(${c},0.02) 5%, rgba(${c},0.05) 10%, rgba(${c},0.1) 16%, rgba(${c},0.18) 22%, rgba(${c},0.28) 30%, rgba(${c},0.4) 38%, rgba(${c},0.52) 46%, rgba(${c},0.64) 54%, rgba(${c},0.75) 62%, rgba(${c},0.84) 70%, rgba(${c},0.92) 80%, var(--tott-home-surface) 100%`;
        const maskStops =
          "transparent 0%, rgba(0,0,0,0.08) 12%, rgba(0,0,0,0.25) 28%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.85) 75%, #000 100%";
        return (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[5]"
            style={{
              height: bottomFadeH,
              background: `linear-gradient(to bottom, ${fadeStops})`,
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
              maskImage: `linear-gradient(to bottom, ${maskStops})`,
              WebkitMaskImage: `linear-gradient(to bottom, ${maskStops})`,
            }}
          />
        );
      })()}

      {/* Hero — Header.svg union shape (rounded rectangle with two hex tabs
          top + bottom) so it interlocks with the hex grid. The shape is
          rendered as inline SVG and the title/body/button sit as an HTML
          overlay positioned in its central body area. */}
      <div
        className="absolute box-border"
        style={{
          left: heroLeft,
          top: heroTop,
          width: heroWidth,
          height: heroHeight,
          zIndex: 20,
          maxWidth: `calc(100% - ${heroLeft * 2}px)`,
        }}
      >
        <svg
          className="absolute left-0 top-0 h-full w-full"
          viewBox="0 0 688 399"
          preserveAspectRatio="xMidYMid meet"
          fill="none"
        >
          <defs>
            <linearGradient
              id={heroGradId}
              x1="344"
              y1="0"
              x2="344"
              y2="399"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor={TK.heroGradTop} />
              <stop offset="0.5" stopColor={TK.heroGradMid} />
              <stop offset="1" stopColor={TK.heroGradMid} stopOpacity="0.5" />
            </linearGradient>
          </defs>
          <path d={HEADER_PATH} fill={GOLD} />
          <path d={HEADER_PATH} fill={`url(#${heroGradId})`} />
        </svg>

        {/* Content overlay — sits in the main body area (between the hex
            tabs). Figma: 512×248 centred inside 688×399 → padding ≈ 88×75. */}
        <div
          className="absolute flex flex-col justify-center"
          style={{
            left: `${(88 / 688) * 100}%`,
            right: `${(88 / 688) * 100}%`,
            top: `${(75 / 399) * 100}%`,
            bottom: `${(75 / 399) * 100}%`,
            gap: Math.round(24 * sz),
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <h1
              className="max-w-full"
              style={{
                fontWeight: 500,
                fontSize: heroTitleSize,
                lineHeight: `${heroTitleLine}px`,
                margin: 0,
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ color: GOLD }}>{t("heroGold")}</span>{" "}
              <span style={{ color: GOLD_DARK }}>{t("heroTitle")}</span>
            </h1>
            <p
              style={{
                fontWeight: 400,
                fontSize: heroBodySize,
                lineHeight: `${heroBodyLine}px`,
                letterSpacing: "-0.015em",
                color: TK.textStrong,
                textShadow: TK.textShadow,
                margin: 0,
              }}
            >
              {t("heroBody")}
            </p>
          </div>
          <Link
            href={heroHref}
            className="relative self-start inline-flex items-center justify-center overflow-hidden"
            style={{
              boxSizing: "border-box",
              width: Math.round(121 * sz),
              height: Math.round(40 * sz),
              borderRadius: Math.max(6, Math.round(8 * sz)),
              color: GOLD_TEXT,
              fontWeight: 500,
              fontSize: Math.max(12, Math.round(14 * sz)),
              lineHeight: `${Math.max(18, Math.round(20 * sz))}px`,
              letterSpacing: "-0.005em",
              textDecoration: "none",
            }}
          >
            {/* Button.svg gold slab + Figma inner highlight (text path removed for i18n). */}
            {/* eslint-disable-next-line @next/next/no-img-element -- local decorative SVG scales with layout */}
            <img
              src="/images/home/hero-cta-button-bg.svg"
              alt=""
              className="pointer-events-none absolute inset-0 h-full w-full select-none object-fill"
              draggable={false}
            />
            <span className="relative z-[1] px-2">{t("heroCta")}</span>
          </Link>
        </div>
      </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────── Cell ─────────────────────────────── */
function CellView({
  isTopPeek,
  card,
  width,
  height,
  top,
  left,
  titleSize,
  titleLine,
  badgeSize,
  badgeLine,
  cellId,
}: {
  isTopPeek: boolean;
  card: HexCard | null;
  width: number;
  height: number;
  top: number;
  left: number;
  titleSize: number;
  titleLine: number;
  badgeSize: number;
  badgeLine: number;
  cellId: string;
}) {
  return (
    <div className="absolute" style={{ width, height, top, left, zIndex: 1 }}>
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 361 437"
        preserveAspectRatio="none"
        fill="none"
      >
        <defs>
          {/* Image clipped to the inner sharp hex from Image.svg
              (328×396, offset by (16.5, 20.5) inside the 361×437 frame). */}
          <clipPath id={`hex-img-${cellId}`}>
            <path
              transform="translate(16.5 20.5)"
              d={IMAGE_PATH_LOCAL}
            />
          </clipPath>
          {/* Per-card vignette — dark at bottom, clear by ~upper 60% (reference typography). */}
          <linearGradient
            id={`scrim-${cellId}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
            gradientUnits="objectBoundingBox"
          >
            <stop offset="0%" stopColor="#000000" stopOpacity="0" />
            <stop offset="58%" stopColor="#000000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.82" />
          </linearGradient>
        </defs>

        {/* BG.svg — outer card frame */}
        <path d={BG_PATH} fill={TK.hexFill} stroke={TK.hexStroke} />

        {/* Image (clipped to inner hex) — only for cards, not the top peek */}
        {!isTopPeek && card && (
          <g clipPath={`url(#hex-img-${cellId})`}>
            <image
              href={isValidImageUrl(card!.image) ? card!.image! : "/images/image.png"}
              x="0"
              y="0"
              width="361"
              height="437"
              preserveAspectRatio="xMidYMid slice"
              style={{ filter: "grayscale(1)" }}
            />
            <rect
              x={INNER_HEX_SCRIM_RECT.x}
              y={INNER_HEX_SCRIM_RECT.y}
              width={INNER_HEX_SCRIM_RECT.w}
              height={INNER_HEX_SCRIM_RECT.h}
              fill={`url(#scrim-${cellId})`}
            />
          </g>
        )}

        {/* Top peek inner fill (#262626 @ 0.48) */}
        {isTopPeek && (
          <g clipPath={`url(#hex-img-${cellId})`}>
            <rect x="0" y="0" width="361" height="437" fill={TK.peekInner} opacity="0.48" />
          </g>
        )}

        {/* Inner sheen border — exact path of the inner hex stroked at 1px
            (Card.svg's "Stroke" element). */}
        {!isTopPeek && card && (
          <path
            transform="translate(16.5 20.5)"
            d={IMAGE_PATH_LOCAL}
            fill="none"
            stroke={TK.sheenColor}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>

      {/* HTML overlay: title + badge + click target. Sits above the SVG. */}
      {!isTopPeek && card && (
        <Link
          href={card.href}
          className="absolute"
          style={{
            inset: 0,
            clipPath: SHARP_HEX_CLIP,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-end",
            padding: `0 ${(24 / 360) * 100}% ${(48 / 435) * 100}%`,
            gap: 8,
            zIndex: 2,
          }}
        >
          <p
            className="m-0 w-full text-center"
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontWeight: 500,
              fontSize: titleSize,
              lineHeight: `${titleLine}px`,
              color: TK.textStrong,
              textShadow: TK.textShadow,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {card.title}
          </p>

          <div className="flex items-stretch" style={{ height: badgeLine + 8 }}>
            <ChevronCap direction="left" size={badgeLine + 8} />
            <div
              className="flex items-center justify-center"
              style={{
                backgroundColor: TK.badgeBg,
                backdropFilter: "blur(4px)",
                WebkitBackdropFilter: "blur(4px)",
                paddingLeft: 8,
                paddingRight: 8,
              }}
            >
              <span
                style={{
                  color: TK.textStrong,
                    fontWeight: 500,
                  fontSize: badgeSize,
                  lineHeight: `${badgeLine}px`,
                  whiteSpace: "nowrap",
                }}
              >
                {card.badge}
              </span>
            </div>
            <ChevronCap direction="right" size={badgeLine + 8} />
          </div>
        </Link>
      )}
    </div>
  );
}

/* Bracket cap — 8×24 in Figma. Triangle pointing inward, theme-tinted backdrop. */
function ChevronCap({ direction, size }: { direction: "left" | "right"; size: number }) {
  const w = Math.round(size * (8 / 24));
  return (
    <div
      style={{
        width: w,
        height: size,
        backgroundColor: TK.badgeBg,
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        clipPath:
          direction === "left"
            ? "polygon(100% 0%, 100% 100%, 0% 50%)"
            : "polygon(0% 0%, 0% 100%, 100% 50%)",
      }}
    />
  );
}

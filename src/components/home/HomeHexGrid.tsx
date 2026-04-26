"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { HexCard } from "@/app/[locale]/(withNav)/page";

const HEX_CLIP =
  "polygon(47.5% 5.67%, 48.29% 5.3%, 49.13% 5.08%, 50% 5%, 50.87% 5.08%, 51.71% 5.3%, 52.5% 5.67%, 87.14% 25.67%, 87.85% 26.17%, 88.47% 26.79%, 88.97% 27.5%, 89.34% 28.29%, 89.57% 29.13%, 89.64% 30%, 89.64% 70%, 89.57% 70.87%, 89.34% 71.71%, 88.97% 72.5%, 88.47% 73.21%, 87.85% 73.83%, 87.14% 74.33%, 52.5% 94.33%, 51.71% 94.7%, 50.87% 94.92%, 50% 95%, 49.13% 94.92%, 48.29% 94.7%, 47.5% 94.33%, 12.86% 74.33%, 12.15% 73.83%, 11.53% 73.21%, 11.03% 72.5%, 10.66% 71.71%, 10.43% 70.87%, 10.36% 70%, 10.36% 30%, 10.43% 29.13%, 10.66% 28.29%, 11.03% 27.5%, 11.53% 26.79%, 12.15% 26.17%, 12.86% 25.67%)";

function isValidImageUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

const FALLBACK_CARDS: HexCard[] = Array.from({ length: 30 }, (_, i) => ({
  id: String(i),
  title: "Insert card title here",
  badge: "12 articles",
  image: null,
  href: "/fields",
}));

const ROWS = 4;
const COL_RATIO = 0.80;
const TOP_PEEK = -0.5; // row offset for the half-hex row peeking in from the top

function buildGrid(): { row: number; col: number; isTopPeek?: boolean }[] {
  const cells: { row: number; col: number; isTopPeek?: boolean }[] = [];
  // Top peek row — partial hexes bleeding in from above the viewport
  for (let col = -1; col <= 7; col++) {
    cells.push({ row: 0, col, isTopPeek: true });
  }
  for (let row = 0; row < ROWS; row++) {
    const startCol = row === 0 ? 0 : -1;
    for (let col = startCol; col <= 7; col++) {
      cells.push({ row, col });
    }
  }
  return cells;
}

const GRID = buildGrid();

function hexPos(row: number, col: number, colWidth: number, rowHeight: number) {
  const isOffset = row % 2 === 0;
  return {
    top: row * rowHeight,
    left: col * colWidth + (isOffset ? colWidth / 2 : 0),
  };
}

function calcHexSize(vw: number): number {
  const targetCols = vw < 640 ? 2.5 : vw < 900 ? 3.5 : 5;
  return Math.round(vw / (targetCols * COL_RATIO));
}

type Props = { cards: HexCard[] };

export function HomeHexGrid({ cards }: Props) {
  const [hexSize, setHexSize] = useState(() =>
    typeof window !== "undefined" ? calcHexSize(window.innerWidth) : 350,
  );

  useEffect(() => {
    const update = () => setHexSize(calcHexSize(window.innerWidth));
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const source = cards.length > 0 ? cards : FALLBACK_CARDS;
  const borderPx = Math.round(hexSize * 0.014);
  const colWidth = Math.round(hexSize * COL_RATIO);
  const rowHeight = Math.round(hexSize * 0.71);
  const gridHeight = (ROWS - 1) * rowHeight + hexSize;

  const heroTitle = `${(hexSize * 0.075).toFixed(0)}px`;
  const heroBody  = `${(hexSize * 0.030).toFixed(0)}px`;
  const heroBtn   = `${(hexSize * 0.032).toFixed(0)}px`;
  const cardTitle = `${(hexSize * 0.032).toFixed(0)}px`;
  const cardBadge = `${(hexSize * 0.026).toFixed(0)}px`;
  const heroPadX  = Math.round(hexSize * 0.14);

  let cardIdx = 0;
  const cells = GRID.map(({ row, col, isTopPeek }) => {
    // Hero is composed of TWO adjacent cells in row 0: (0,0) holds title, (0,1) holds body + CTA
    const isHeroTitle = !isTopPeek && row === 0 && col === 0;
    const isHeroBody = !isTopPeek && row === 0 && col === 1;
    const isHero = isHeroTitle || isHeroBody;
    const card = isHero || isTopPeek ? null : source[cardIdx++ % source.length];
    const pos = hexPos(row, col, colWidth, rowHeight);
    if (isTopPeek) {
      pos.top = Math.round(rowHeight * TOP_PEEK);
      pos.left = col * colWidth;
    }
    return { isHero, isHeroTitle, isHeroBody, isTopPeek: !!isTopPeek, card, pos, size: hexSize };
  });

  return (
    <div className="relative w-full overflow-hidden" style={{ height: gridHeight }}>
      {cells.map(({ isHero, isHeroTitle, isHeroBody, isTopPeek, card, pos, size }, i) => (
        <div
          key={i}
          className="absolute"
          style={{ width: size, height: size, top: pos.top, left: pos.left, zIndex: isHero ? 2 : 1 }}
        >
          {/* Dark border frame layer */}
          <div
            className="absolute inset-0"
            style={{ clipPath: HEX_CLIP, backgroundColor: "#1a1a1a" }}
          />

          {/* Content layer — inset by borderPx so border shows around it */}
          <div
            className="absolute overflow-hidden"
            style={{ clipPath: HEX_CLIP, inset: borderPx }}
          >
            {isTopPeek ? (
              <div className="h-full w-full" style={{ backgroundColor: "#0d0d0d" }} />
            ) : isHeroTitle ? (
              <div
                className="relative flex h-full w-full flex-col items-center justify-center"
                style={{
                  background:
                    "radial-gradient(ellipse 90% 75% at 70% 70%, #5a3500 0%, #321c00 30%, #150c00 65%, #0b0b0b 95%)",
                  paddingLeft: heroPadX,
                  paddingRight: heroPadX,
                }}
              >
                <h1 className="font-semibold leading-tight text-center" style={{ fontSize: heroTitle }}>
                  <span style={{ color: "#C9A96E" }}>Trace </span>
                  <span className="text-white">The Living Archive</span>
                </h1>
              </div>
            ) : isHeroBody ? (
              <div
                className="relative flex h-full w-full flex-col justify-center"
                style={{
                  background:
                    "radial-gradient(ellipse 90% 75% at 30% 70%, #5a3500 0%, #321c00 30%, #150c00 65%, #0b0b0b 95%)",
                  paddingLeft: heroPadX,
                  paddingRight: heroPadX,
                }}
              >
                <p className="text-gray-300 leading-snug" style={{ fontSize: heroBody, marginBottom: "1em" }}>
                  We practice knowledge like tending the land: digging, planting, waiting. Culture
                  lives and breathes with us, passed down like stories. Art is an architecture of
                  the senses, built on feeling and instinct. From this rhythm, Trace of the Tide
                  emerges
                </p>
                <Link
                  href="/fields"
                  className="self-start rounded-md font-medium transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#C9A96E", color: "#1a1a1a", fontSize: heroBtn, padding: "0.4em 1em" }}
                >
                  Call to Action
                </Link>
              </div>
            ) : (
              <Link href={card!.href} className="relative block h-full w-full" style={{ backgroundColor: "#111111" }}>
                <Image
                  src={isValidImageUrl(card!.image) ? card!.image! : "/images/image.png"}
                  alt={card!.title}
                  fill
                  className="object-cover grayscale"
                  sizes={`${hexSize}px`}
                />
                {/* stronger bottom scrim for legibility */}
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 30%, transparent 55%)" }}
                />
                {/* Bottom title + badge */}
                <div
                  className="absolute flex flex-col items-center"
                  style={{ bottom: "14%", left: "14%", right: "14%", textAlign: "center" }}
                >
                  <p
                    className="font-medium leading-tight text-white"
                    style={{
                      fontSize: cardTitle,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      wordBreak: "break-word",
                    }}
                  >
                    {card!.title}
                  </p>
                  <span
                    className="text-gray-300"
                    style={{
                      display: "inline-block",
                      marginTop: "0.5em",
                      backgroundColor: "rgba(0,0,0,0.65)",
                      borderRadius: 9999,
                      padding: "0.25em 0.75em",
                      fontSize: cardBadge,
                    }}
                  >
                    {card!.badge}
                  </span>
                </div>
              </Link>
            )}
          </div>
        </div>
      ))}

      {/* Bottom dissolve — hexes fade into the page background */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0"
        style={{
          height: "55%",
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(23,23,23,0.55) 35%, rgba(23,23,23,0.9) 70%, #171717 100%)",
        }}
      />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { IdlePulse } from "@/components/motion/IdlePulse";

const HEX_CLIP =
  "polygon(47.5% 5.67%, 48.29% 5.3%, 49.13% 5.08%, 50% 5%, 50.87% 5.08%, 51.71% 5.3%, 52.5% 5.67%, 87.14% 25.67%, 87.85% 26.17%, 88.47% 26.79%, 88.97% 27.5%, 89.34% 28.29%, 89.57% 29.13%, 89.64% 30%, 89.64% 70%, 89.57% 70.87%, 89.34% 71.71%, 88.97% 72.5%, 88.47% 73.21%, 87.85% 73.83%, 87.14% 74.33%, 52.5% 94.33%, 51.71% 94.7%, 50.87% 94.92%, 50% 95%, 49.13% 94.92%, 48.29% 94.7%, 47.5% 94.33%, 12.86% 74.33%, 12.15% 73.83%, 11.53% 73.21%, 11.03% 72.5%, 10.66% 71.71%, 10.43% 70.87%, 10.36% 70%, 10.36% 30%, 10.43% 29.13%, 10.66% 28.29%, 11.03% 27.5%, 11.53% 26.79%, 12.15% 26.17%, 12.86% 25.67%)";

const DEFAULT_GAP_X = -36;
const DEFAULT_GAP_Y = -8;

const DEFAULT_GRID: { row: number; col: number }[] = [
  { row: 0, col: 0 },
  { row: 0, col: 1 },
  { row: 1, col: 0 },
  { row: 1, col: 1 },
  { row: 2, col: -1 },
  { row: 2, col: 0 },
  { row: 2, col: 1 },
  { row: 3, col: 1 },
];

function hexPosition(
  row: number,
  col: number,
  hexSize: number,
  gapX: number,
  gapY: number,
  offsetEven: boolean,
) {
  const rowHeight = hexSize * 0.75 + gapY;
  const isOffset = offsetEven ? row % 2 === 0 : row % 2 === 1;
  const colWidth = hexSize + gapX;
  return {
    top: row * rowHeight,
    left: col * colWidth + (isOffset ? colWidth / 2 : 0),
  };
}

type HexImageGridProps = {
  src?: string;
  grid?: { row: number; col: number }[];
  sizeLg?: number;
  sizeXl?: number;
  gapX?: number;
  gapY?: number;
  offsetEven?: boolean;
  breakpoint?: number;
  className?: string;
};

export function HexImageGrid({
  src = "/images/image.png",
  grid = DEFAULT_GRID,
  sizeLg = 200,
  sizeXl = 270,
  gapX = DEFAULT_GAP_X,
  gapY = DEFAULT_GAP_Y,
  offsetEven = true,
  breakpoint = 1280,
  className = "",
}: HexImageGridProps) {
  const [hexSize, setHexSize] = useState(sizeXl);

  useEffect(() => {
    const update = () =>
      setHexSize(window.innerWidth < breakpoint ? sizeLg : sizeXl);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [breakpoint, sizeLg, sizeXl]);

  const maxCol = Math.max(...grid.map((h) => h.col));
  const maxRow = Math.max(...grid.map((h) => h.row));
  const colWidth = hexSize + gapX;
  const gridW = (maxCol + 1) * colWidth + colWidth / 2 + hexSize * 0.1;
  const gridH = maxRow * (hexSize * 0.75 + gapY) + hexSize;

  return (
    <div className={`hidden shrink-0 lg:block ${className}`}>
      <div className="relative" style={{ width: gridW, height: gridH }}>
        {grid.map(({ row, col }, i) => {
          const pos = hexPosition(row, col, hexSize, gapX, gapY, offsetEven);
          // Each hexagon is a window onto ONE continuous image lying behind the
          // whole grid: the image is sized to the full grid (gridW × gridH) and
          // shifted by the negative of this cell's offset, so every hex reveals
          // its own slice of the same picture underneath. Gaps stay dark — the
          // image only shows where a hex clips it.
          return (
            <div
              key={i}
              className="absolute overflow-hidden"
              style={{
                width: hexSize,
                height: hexSize,
                top: pos.top,
                left: pos.left,
                clipPath: HEX_CLIP,
              }}
            >
              <IdlePulse
                phaseOffset={i * 0.3}
                style={{ position: "absolute", inset: 0 }}
              >
                <Image
                  src={src}
                  alt=""
                  width={Math.ceil(gridW)}
                  height={Math.ceil(gridH)}
                  className="max-w-none object-cover"
                  style={{
                    position: "absolute",
                    top: -pos.top,
                    left: -pos.left,
                    width: gridW,
                    height: gridH,
                  }}
                  sizes={`${Math.ceil(gridW)}px`}
                  priority={i === 0}
                />
              </IdlePulse>
            </div>
          );
        })}
      </div>
    </div>
  );
}

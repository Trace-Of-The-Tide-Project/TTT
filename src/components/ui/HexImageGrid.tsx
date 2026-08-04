"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { IdlePulse } from "@/components/motion/IdlePulse";
import { TOTT_HEX_CLIP_PATH } from "@/components/ui/hexClipPath";

const HEX_CLIP = TOTT_HEX_CLIP_PATH;

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

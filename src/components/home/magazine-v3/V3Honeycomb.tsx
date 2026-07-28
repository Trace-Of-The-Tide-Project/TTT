import type { ReactNode } from "react";

/**
 * Offset-row honeycomb grid (Figma: pitch 284px, row offset 142px = half
 * pitch, row pitch 234px, card 276×294). Rows alternate 4-up (flush start)
 * and 5-up (bleeding past both edges by a half card) — reproduced here with
 * CSS instead of Figma's literal edge "filler" hexes, by giving odd rows a
 * negative start margin and letting `overflow-hidden` on the section clip
 * the bleed.
 *
 * `items` is pre-chunked into rows by the caller (4, 5, 4, 5, ... or
 * whatever count the section needs) so this component stays pure layout.
 *
 * Responsive: honeycomb keeps its per-row column count down to 1280px, then
 * collapses to a plain grid below that — the pitch/offset math only reads
 * cleanly against the desktop card width Figma specified.
 */
export function V3Honeycomb({ rows }: { rows: ReactNode[][] }) {
  return (
    <div className="hidden flex-col items-center gap-0 overflow-hidden lg:flex" style={{ rowGap: "-30px" }}>
      {rows.map((row, i) => (
        <div
          key={i}
          className="flex justify-center gap-2"
          style={{
            marginInlineStart: i % 2 === 1 ? "-138px" : undefined,
            marginTop: i === 0 ? 0 : "-30px",
          }}
        >
          {row}
        </div>
      ))}
    </div>
  );
}

/** Mobile/tablet fallback: plain wrapping grid, no offset math, hex clip
 * retained on each card. Figma is desktop-only — this is my derivation. */
export function V3HoneycombFallback({ items }: { items: ReactNode[] }) {
  return (
    <div className="grid grid-cols-1 place-items-center gap-6 sm:grid-cols-2 lg:hidden">
      {items}
    </div>
  );
}

/** Split a flat list into alternating 4/5-length rows, matching the Figma
 * feature (4+5=9) and latest (4+5+4+5+4=22) counts. Any remainder past the
 * pattern is dropped into a final short row rather than lost. */
export function chunkHoneycombRows<T>(items: T[]): T[][] {
  const rows: T[][] = [];
  let i = 0;
  let toggle = 0;
  while (i < items.length) {
    const size = toggle % 2 === 0 ? 4 : 5;
    rows.push(items.slice(i, i + size));
    i += size;
    toggle++;
  }
  return rows;
}

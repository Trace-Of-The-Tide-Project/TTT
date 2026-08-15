/**
 * Shared SVG clipPath def for a soft, elongated hexagon — flat top/bottom
 * edges, gently angled sides, rounded corner joins (no sharp polygon
 * points). `clipPathUnits="objectBoundingBox"` makes the path scale with
 * whatever box it's applied to, so one def works for side cards and the
 * larger feature card alike.
 *
 * A fixed id (not React `useId`) is intentional: this same path is
 * identical for every card, so it's rendered once via `RoundedHexClipDefs`
 * (mounted a single time near the top of the page) and every card just
 * references `clip-path: url(#tott-hex-wide)`. Per-instance generated ids
 * would hydrate mismatched between server/client render passes.
 */
export const ROUNDED_HEX_CLIP_ID = "tott-hex-wide";

/**
 * Elongated hexagon in a 0–1 (objectBoundingBox) coordinate space: flat
 * top/bottom, angled left/right sides inset 10% from each edge, with a
 * ~0.035 (of box size) corner radius softening every vertex — no sharp
 * triangular points.
 */
const R = 0.035;
const ROUNDED_HEX_PATH = `
  M ${0.1 + R} 0
  L ${0.9 - R} 0
  Q ${0.9 + R * 0.4} 0 ${0.9 + R} ${R * 1.3}
  L ${1 - R * 0.3} ${0.5 - R * 1.3}
  Q 1 0.5 ${1 - R * 0.3} ${0.5 + R * 1.3}
  L ${0.9 + R} ${1 - R * 1.3}
  Q ${0.9 + R * 0.4} 1 ${0.9 - R} 1
  L ${0.1 + R} 1
  Q ${0.1 - R * 0.4} 1 ${0.1 - R} ${1 - R * 1.3}
  L ${R * 0.3} ${0.5 + R * 1.3}
  Q 0 0.5 ${R * 0.3} ${0.5 - R * 1.3}
  L ${0.1 - R} ${R * 1.3}
  Q ${0.1 - R * 0.4} 0 ${0.1 + R} 0
  Z
`;

/** Mount once per page (or once per rail section — the id is deduped by
 * the browser if it appears more than once with identical content). */
export function RoundedHexClipDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden focusable="false">
      <defs>
        <clipPath id={ROUNDED_HEX_CLIP_ID} clipPathUnits="objectBoundingBox">
          <path d={ROUNDED_HEX_PATH} />
        </clipPath>
      </defs>
    </svg>
  );
}

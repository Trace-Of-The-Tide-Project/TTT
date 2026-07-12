import type { ReactElement, SVGProps } from "react";

export type PillarKey =
  | "stone"
  | "salt"
  | "compass"
  | "harbour"
  | "courtyard"
  | "hill";

/**
 * Original line-art motifs, one per pillar. Shared 48×48 frame with fixed
 * dimensions (zero CLS); stroke inherits currentColor from the card wrapper.
 * Elements carrying a `tott-motif-*` class are animated on card hover/focus —
 * keyframes live in globals.css (`.tott-pillar-*` block), gated behind
 * prefers-reduced-motion: no-preference.
 */
const frame: SVGProps<SVGSVGElement> = {
  viewBox: "0 0 48 48",
  width: 48,
  height: 48,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const PILLAR_MOTIFS: Record<PillarKey, ReactElement> = {
  // Stone — witness of life: rounded stone over ground strokes; body settles.
  stone: (
    <svg {...frame}>
      <path
        className="tott-motif-stone"
        d="M14 26c-1-5.5 3-11 10-11s11 5.5 10 11c-.7 3.5-4.5 5.5-10 5.5S14.7 29.5 14 26Z"
      />
      <path d="M12 36h24" />
      <path d="M18 40h12" />
    </svg>
  ),
  // Salt — trace of time: central crystal, small crystals drift apart.
  salt: (
    <svg {...frame}>
      <path d="M24 12l8 10-8 10-8-10Z" />
      <path className="tott-motif-crystal-a" d="M11 12l3 4-3 4-3-4Z" />
      <path className="tott-motif-crystal-b" d="M37 28l3 4-3 4-3-4Z" />
      <path d="M15 38h18" />
    </svg>
  ),
  // Compass — trace of place: double-ended needle (direction-neutral), wobbles.
  compass: (
    <svg {...frame}>
      <circle cx="24" cy="24" r="13" />
      <path d="M24 12v3" />
      <path d="M24 33v3" />
      <path d="M12 24h3" />
      <path d="M33 24h3" />
      <path className="tott-motif-needle" d="M31 17l-4.5 9.5L17 31l4.5-9.5Z" />
      <circle cx="24" cy="24" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  ),
  // Harbour trails — anchor above waves; waves swell.
  harbour: (
    <svg {...frame}>
      <circle cx="24" cy="10" r="2.5" />
      <path d="M24 12.5V30" />
      <path d="M18 17.5h12" />
      <path d="M15 23.5c.5 5 4.5 6.5 9 6.5s8.5-1.5 9-6.5" />
      <g className="tott-motif-wave">
        <path d="M10 36.5c2.3-2.3 4.7-2.3 7 0s4.7 2.3 7 0 4.7-2.3 7 0 4.7 2.3 7 0" />
        <path d="M14 41c2.3-2.3 4.7-2.3 7 0s4.7 2.3 7 0 4.7-2.3 7 0" />
      </g>
    </svg>
  ),
  // Courtyard trails — pointed arch; stroke draws itself.
  courtyard: (
    <svg {...frame}>
      <path
        className="tott-motif-arch"
        pathLength={60}
        d="M14 36V24c0-6 3.5-10 10-13 6.5 3 10 7 10 13v12"
      />
      <path d="M10 36h28" />
    </svg>
  ),
  // Hill trails — hill curve under a moon; moon rises.
  hill: (
    <svg {...frame}>
      <circle className="tott-motif-moon" cx="33" cy="13" r="4" />
      <path d="M8 38c5-11 11-16 16-16s11 5 16 16" />
      <path d="M6 38h36" />
    </svg>
  ),
};

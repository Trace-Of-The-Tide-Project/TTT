"use client";

import { useId } from "react";

/* ─────────────────────── geometry (Figma Content Card) ───────────────────────
   Lifted verbatim from Figma's "Content Card-2.svg" — a 276×294 hex
   with smooth rounded vertices. Used as the cover frame on both the
   Publications and Issues tabs so the two surfaces share one silhouette.
*/
export const COVER_W = 276;
export const COVER_H = 294;

const HEX_FILL_PATH =
  "M131.015 3.38916C135.426 1.24904 140.574 1.24904 144.985 3.38916L266.985 62.5864C272.499 65.262 276 70.8524 276 76.9813V217.019C276 223.148 272.499 228.738 266.985 231.414L144.985 290.611C140.574 292.751 135.426 292.751 131.015 290.611L9.01525 231.414C3.50115 228.738 0 223.148 0 217.019V76.9814C0 70.8524 3.50115 65.262 9.01525 62.5864L131.015 3.38916Z";

const HEX_STROKE_PATH =
  "M131.233 3.83887C135.506 1.76562 140.494 1.76562 144.767 3.83887L266.767 63.0361C272.108 65.6281 275.5 71.044 275.5 76.9814V217.019C275.5 222.956 272.108 228.372 266.767 230.964L144.767 290.161C140.494 292.234 135.506 292.234 131.233 290.161L9.2334 230.964C3.89164 228.372 0.5 222.956 0.5 217.019V76.9814C0.5 71.044 3.89164 65.6281 9.2334 63.0361L131.233 3.83887Z";

export type HexCoverProps = {
  src: string;
  alt: string;
  /** When true, renders the Figma `paint0_linear` fade overlay across
   *  the bottom 164px of the hex (Issues tab). Defaults to false for
   *  the clean Publications cover. */
  showFade?: boolean;
};

/**
 * Rounded-vertex hex cover used by the magazine Publications and
 * Issues tabs. The image is clipped to the hex silhouette and an
 * optional bottom fade overlays the lower third so a dark
 * page-surface caption underneath reads cleanly.
 */
export function HexCover({ src, alt, showFade = false }: HexCoverProps) {
  const rawId = useId();
  const uid = rawId.replace(/:/g, "");
  const maskId = `hex-mask-${uid}`;
  const fadeId = `hex-fade-${uid}`;

  return (
    <div
      className="relative w-full"
      style={{ maxWidth: COVER_W, aspectRatio: `${COVER_W} / ${COVER_H}` }}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${COVER_W} ${COVER_H}`}
        fill="none"
        role="img"
        aria-label={alt}
      >
        <defs>
          <clipPath id={maskId}>
            <path d={HEX_FILL_PATH} />
          </clipPath>
          {showFade ? (
            <linearGradient
              id={fadeId}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
              gradientUnits="objectBoundingBox"
            >
              <stop stopColor="#171717" stopOpacity="0" />
              <stop offset="1" stopColor="#171717" />
            </linearGradient>
          ) : null}
        </defs>

        <g clipPath={`url(#${maskId})`}>
          <image
            href={src}
            x="0"
            y="0"
            width={COVER_W}
            height={COVER_H}
            preserveAspectRatio="xMidYMid slice"
            style={{ filter: "grayscale(1)" }}
          />
          {showFade ? (
            <rect
              x="0"
              y="130"
              width={COVER_W}
              height="164"
              fill={`url(#${fadeId})`}
            />
          ) : null}
        </g>

        <path
          d={HEX_STROKE_PATH}
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}

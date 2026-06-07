"use client";

import { useId } from "react";

/* ─────────────────────── geometry (Figma Book Cover) ───────────────────────
   Lifted verbatim from "Book Cover-2.svg" — a 192×288 elongated hex
   (rounded vertices). Used as the cover frame for the Publications
   tab. Distinct from `HexCover` (276×294) which is used in Issues.
*/
export const BOOK_W = 192;
export const BOOK_H = 288;
const BOOK_VIEW_W = 193;
const BOOK_VIEW_H = 288;

const BOOK_FILL_PATH =
  "M90.8462 2.5641C94.7846 0.923076 99.2154 0.923077 103.154 2.5641L183.154 35.8974C189.116 38.3817 193 44.2075 193 50.6667V237.333C193 243.793 189.116 249.618 183.154 252.103L103.154 285.436C99.2154 287.077 94.7846 287.077 90.8462 285.436L10.8462 252.103C4.8838 249.618 1 243.793 1 237.333V50.6667C1 44.2075 4.8838 38.3817 10.8462 35.8974L90.8462 2.5641Z";

const BOOK_STROKE_PATH =
  "M90.0381 3.02539C93.8535 1.43565 98.1465 1.43565 101.962 3.02539L181.962 36.3594C187.738 38.7662 191.5 44.4098 191.5 50.667V237.333C191.5 243.59 187.738 249.234 181.962 251.641L101.962 284.975C98.1465 286.564 93.8535 286.564 90.0381 284.975L10.0381 251.641C4.26232 249.234 0.5 243.59 0.5 237.333V50.667C0.5 44.4098 4.26232 38.7662 10.0381 36.3594L90.0381 3.02539Z";

export type BookCoverProps = {
  src: string;
  alt: string;
  /** Apply the grayscale treatment to the image. Defaults to true to
   * preserve the Publications-tab look; pass false to surface a
   * full-color cover. */
  grayscale?: boolean;
};

/**
 * Elongated rounded-vertex hex used by the Publications tab's
 * Book Card. Image fills the hex; 1px white-8% inner stroke traces
 * the hex outline. No bottom fade (the design surfaces a plain
 * grayscale cover, with the category / title / date stacked below
 * the image rather than overlaid on it).
 */
export function BookCover({ src, alt, grayscale = true }: BookCoverProps) {
  const rawId = useId();
  const uid = rawId.replace(/:/g, "");
  const maskId = `book-mask-${uid}`;

  return (
    <div
      className="relative w-full"
      style={{ maxWidth: BOOK_W, aspectRatio: `${BOOK_W} / ${BOOK_H}` }}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${BOOK_VIEW_W} ${BOOK_VIEW_H}`}
        fill="none"
        role="img"
        aria-label={alt}
      >
        <defs>
          <clipPath id={maskId}>
            <path d={BOOK_FILL_PATH} />
          </clipPath>
        </defs>

        <g clipPath={`url(#${maskId})`}>
          <image
            href={src}
            x="0"
            y="0"
            width={BOOK_VIEW_W}
            height={BOOK_VIEW_H}
            preserveAspectRatio="xMidYMid slice"
            style={grayscale ? { filter: "grayscale(1)" } : undefined}
          />
        </g>

        <path
          d={BOOK_STROKE_PATH}
          fill="none"
          stroke="var(--tott-home-hex-sheen)"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}

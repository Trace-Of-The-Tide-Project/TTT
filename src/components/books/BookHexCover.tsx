"use client";

import { useId } from "react";

/* ─────────────────────── geometry (Figma Book Cover) ───────────────────────
   Same 192×288 elongated rounded-vertex hex as the magazine
   `BookCover` (lifted from "Book Cover-2.svg"). The difference: this
   variant renders the real uploaded cover in FULL COLOR (no grayscale
   filter) and falls back to the silk "Book Cover.png" placeholder when
   no cover image is present. Used on the public /books grid and the
   /books/[id] detail page so an actual uploaded cover displays cleanly
   instead of being buried under a placeholder overlay.
*/
const BOOK_W = 192;
const BOOK_H = 288;
const BOOK_VIEW_W = 193;
const BOOK_VIEW_H = 288;

const BOOK_FILL_PATH =
  "M90.8462 2.5641C94.7846 0.923076 99.2154 0.923077 103.154 2.5641L183.154 35.8974C189.116 38.3817 193 44.2075 193 50.6667V237.333C193 243.793 189.116 249.618 183.154 252.103L103.154 285.436C99.2154 287.077 94.7846 287.077 90.8462 285.436L10.8462 252.103C4.8838 249.618 1 243.793 1 237.333V50.6667C1 44.2075 4.8838 38.3817 10.8462 35.8974L90.8462 2.5641Z";

const BOOK_STROKE_PATH =
  "M90.0381 3.02539C93.8535 1.43565 98.1465 1.43565 101.962 3.02539L181.962 36.3594C187.738 38.7662 191.5 44.4098 191.5 50.667V237.333C191.5 243.59 187.738 249.234 181.962 251.641L101.962 284.975C98.1465 286.564 93.8535 286.564 90.0381 284.975L10.0381 251.641C4.26232 249.234 0.5 243.59 0.5 237.333V50.667C0.5 44.4098 4.26232 38.7662 10.0381 36.3594L90.0381 3.02539Z";

/** Silk hex placeholder used when a book has no cover image. */
const BOOK_HEX_PLACEHOLDER = "/images/home/Book Cover.png";

export type BookHexCoverProps = {
  /** Resolved absolute cover URL, or null to show the silk placeholder. */
  src: string | null;
  alt: string;
};

/**
 * Full-color elongated hex book cover. The uploaded image is clipped
 * to the hex silhouette with a 1px inner stroke tracing the outline.
 * Renders the silk placeholder (in grayscale, as designed) when no
 * cover image is supplied.
 */
export function BookHexCover({ src, alt }: BookHexCoverProps) {
  const rawId = useId();
  const uid = rawId.replace(/:/g, "");
  const maskId = `book-color-mask-${uid}`;
  const href = src ?? BOOK_HEX_PLACEHOLDER;
  const isPlaceholder = !src;

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
            href={href}
            x="0"
            y="0"
            width={BOOK_VIEW_W}
            height={BOOK_VIEW_H}
            preserveAspectRatio="xMidYMid slice"
            // Real covers render in full color; only the silk
            // placeholder keeps the muted grayscale treatment.
            style={isPlaceholder ? { filter: "grayscale(1)" } : undefined}
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

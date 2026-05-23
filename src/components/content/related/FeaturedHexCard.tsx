"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";

// Shared "silk hex" card assets — same files the home "Follow our
// Writers" and writing-room "Discover Featured Writing" rows use, so
// the three rows read as one system.
const WRITER_CARD = "/images/home/Image-2.png";
const WRITER_TOP_ICON = "/images/home/Icon-4.svg";
// Hexagon matching the silk-hex frame (Image-2.png) — clips the cover
// image to the hex so a bright/full-bleed cover doesn't bleed into the
// frame's transparent corners and make the card read as a rectangle.
const HEX_CLIP =
  "polygon(47.5% 5.67%, 48.29% 5.3%, 49.13% 5.08%, 50% 5%, 50.87% 5.08%, 51.71% 5.3%, 52.5% 5.67%, 87.14% 25.67%, 87.85% 26.17%, 88.47% 26.79%, 88.97% 27.5%, 89.34% 28.29%, 89.57% 29.13%, 89.64% 30%, 89.64% 70%, 89.57% 70.87%, 89.34% 71.71%, 88.97% 72.5%, 88.47% 73.21%, 87.85% 73.83%, 87.14% 74.33%, 52.5% 94.33%, 51.71% 94.7%, 50.87% 94.92%, 50% 95%, 49.13% 94.92%, 48.29% 94.7%, 47.5% 94.33%, 12.86% 74.33%, 12.15% 73.83%, 11.53% 73.21%, 11.03% 72.5%, 10.66% 71.71%, 10.43% 70.87%, 10.36% 70%, 10.36% 30%, 10.43% 29.13%, 10.66% 28.29%, 11.03% 27.5%, 11.53% 26.79%, 12.15% 26.17%, 12.86% 25.67%)";
const CHIP_CHAMFER =
  "polygon(6px 0, calc(100% - 6px) 0, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0 calc(100% - 6px), 0 6px)";

export type FeaturedHexItem = {
  id: string;
  title: string;
  author: string;
  /** Article cover; tinted behind the silk-hex frame. */
  coverImage?: string | null;
  /** Chamfered chip label (e.g. the edition name). */
  chipLabel?: string;
  href?: string;
};

/**
 * Silk-hex card — identical visual structure to the writing-room
 * "Discover Featured Writing" card (`FeaturedWritingCard`): Image-2.png
 * silk hex frame, Icon-4.svg top glyph, bottom-fade overlay with title
 * + author chip, and a chamfered edition chip. Card width is read from
 * the `--carousel-card-w` CSS var the row sets per breakpoint.
 */
export function FeaturedHexCard({
  title,
  author,
  coverImage,
  chipLabel,
  href = "#",
}: Omit<FeaturedHexItem, "id">) {
  const cardTitle = title?.trim() || "Untitled";
  const authorName = author?.trim() || "Author";
  const initial = (authorName || cardTitle).slice(0, 1).toUpperCase() || "A";

  return (
    <Link
      href={href}
      className="relative block w-full transition-opacity hover:opacity-90"
      style={{
        maxWidth: "var(--carousel-card-w, 276px)",
        width: "var(--carousel-card-w, 276px)",
        aspectRatio: "276 / 294",
        flexShrink: 0,
      }}
    >
      {coverImage ? (
        <Image
          src={coverImage}
          alt=""
          fill
          className="absolute inset-0 select-none object-cover opacity-70 mix-blend-luminosity"
          style={{ clipPath: HEX_CLIP, WebkitClipPath: HEX_CLIP }}
          sizes="(min-width: 1920px) 360px, (min-width: 1600px) 320px, 276px"
          draggable={false}
        />
      ) : null}
      <Image
        src={WRITER_CARD}
        alt=""
        fill
        className="select-none object-contain"
        sizes="(min-width: 1920px) 360px, (min-width: 1600px) 320px, 276px"
        draggable={false}
      />

      <div
        aria-hidden
        className="absolute z-10"
        style={{ width: "48px", height: "48px", left: "calc(50% - 24px)", top: "8px" }}
      >
        <Image
          src={WRITER_TOP_ICON}
          alt=""
          fill
          sizes="48px"
          className="select-none"
          draggable={false}
        />
      </div>

      <div
        className="absolute bottom-0 left-0 z-10 flex w-full flex-col items-center justify-end"
        style={{
          height: "55.78%",
          padding: "24px 24px 56px",
          gap: "8px",
          background: "var(--tott-writer-card-fade)",
        }}
      >
        <p
          className="line-clamp-2 w-full text-center"
          style={{
            maxWidth: "228px",
            fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
            fontWeight: 500,
            fontSize: "20px",
            lineHeight: "28px",
            color: "var(--tott-home-text-strong)",
            textShadow: "var(--tott-home-text-shadow)",
          }}
        >
          {cardTitle}
        </p>

        <div
          className="flex w-full flex-wrap items-center justify-center"
          style={{ maxWidth: "228px", gap: "4px 8px" }}
        >
          <span className="flex items-center" style={{ gap: "4px" }}>
            <span
              className="flex items-center justify-center"
              style={{
                width: "26px",
                height: "26px",
                background: "var(--tott-dash-gold-text)",
                border: "1px solid var(--tott-card-border)",
                borderRadius: "999px",
                fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
                fontWeight: 500,
                fontSize: "8.5px",
                lineHeight: "10px",
                color: "var(--tott-auth-btn-text)",
              }}
            >
              {initial}
            </span>
            <span
              style={{
                fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
                fontWeight: 400,
                fontSize: "12px",
                lineHeight: "26px",
                color: "var(--tott-home-text-heading)",
                textShadow: "var(--tott-home-text-shadow)",
              }}
            >
              {authorName}
            </span>
          </span>
        </div>
      </div>

      {chipLabel ? (
        <span
          className="absolute z-20 inline-flex items-center justify-center"
          style={{
            minWidth: "56px",
            height: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            padding: "0 10px",
            bottom: "24px",
            backgroundColor: "var(--tott-home-badge-bg)",
            color: "var(--tott-home-text-strong)",
            fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
            fontWeight: 500,
            fontSize: "12px",
            lineHeight: "26px",
            clipPath: CHIP_CHAMFER,
            WebkitClipPath: CHIP_CHAMFER,
          }}
        >
          {chipLabel}
        </span>
      ) : null}
    </Link>
  );
}

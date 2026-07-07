"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { Link } from "@/i18n/navigation";

// Shared "silk hex" card assets — same files the home "Follow our
// Writers" and writing-room "Discover Featured Writing" rows use, so
// the three rows read as one system.
const WRITER_CARD = "/images/home/Image-2.png";
const WRITER_TOP_ICON = "/images/home/Icon-4.svg";
// Clip a real avatar photo to the exact silk-hex silhouette using the
// frame PNG's own alpha as a mask — pixel-accurate against the silk
// (a hand-authored clip-path polygon drifts from the art at odd sizes).
// Same technique as the Editorial Board carousel card.
const HEX_PHOTO_MASK: CSSProperties = {
  WebkitMaskImage: `url(${WRITER_CARD})`,
  maskImage: `url(${WRITER_CARD})`,
  WebkitMaskSize: "100% auto",
  maskSize: "100% auto",
  WebkitMaskPosition: "center center",
  maskPosition: "center center",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
};
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
      {/* Silk hex frame — drawn first as the base/fallback fill so a real
          photo (layered on top below) isn't washed out by the silk texture. */}
      <Image
        src={WRITER_CARD}
        alt=""
        fill
        className="select-none object-contain"
        sizes="(min-width: 1920px) 360px, (min-width: 1600px) 320px, 276px"
        draggable={false}
      />
      {coverImage ? (
        <Image
          src={coverImage}
          alt=""
          fill
          className="absolute inset-0 select-none object-cover"
          style={HEX_PHOTO_MASK}
          sizes="(min-width: 1920px) 360px, (min-width: 1600px) 320px, 276px"
          draggable={false}
          unoptimized
        />
      ) : null}

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
          className="absolute z-20 inline-flex items-center justify-center overflow-hidden text-ellipsis whitespace-nowrap"
          style={{
            minWidth: "56px",
            maxWidth: "152px",
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

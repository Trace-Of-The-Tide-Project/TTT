"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";
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

type FeaturedHexCardProps = Omit<FeaturedHexItem, "id"> & {
  /** Max width of the title line box. Defaults to 228px (home/writing-room rails). */
  nameMaxWidth?: number;
  /** Title line-clamp. Defaults to 2. */
  nameClamp?: number;
  /**
   * Deepen the bottom scrim + add meaningful photo alt text. Opt-in so the
   * shared home/writing-room rails render byte-identically. Set on the
   * writers page where long names sit over real portraits (WCAG AA contrast).
   */
  strongOverlay?: boolean;
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
  nameMaxWidth = 228,
  nameClamp = 2,
  strongOverlay = false,
}: FeaturedHexCardProps) {
  const cardTitle = title?.trim() || "Untitled";
  const authorName = author?.trim() || "Author";
  const initial = (authorName || cardTitle).slice(0, 1).toUpperCase() || "A";
  // Fall back to the silk frame (+ initials) if the portrait 404s / fails.
  const [imgOk, setImgOk] = useState(true);
  const showPhoto = Boolean(coverImage) && imgOk;

  return (
    <Link
      href={href}
      className="relative block w-full rounded-sm transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--tott-accent-gold)]"
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
      {showPhoto ? (
        <Image
          src={coverImage as string}
          alt={strongOverlay ? cardTitle : ""}
          fill
          className="absolute inset-0 select-none object-cover"
          style={HEX_PHOTO_MASK}
          sizes="(min-width: 1920px) 360px, (min-width: 1600px) 320px, 276px"
          draggable={false}
          unoptimized
          onError={() => setImgOk(false)}
        />
      ) : (
        // No/failed portrait → initials on a gold-tinted hex, clipped to the frame.
        <div
          aria-hidden
          className="absolute inset-0 flex items-center justify-center"
          style={{
            ...HEX_PHOTO_MASK,
            background:
              "color-mix(in srgb, var(--tott-dash-gold-text) 22%, transparent)",
          }}
        >
          <span
            style={{
              fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
              fontWeight: 600,
              fontSize: "44px",
              color: "var(--tott-home-text-strong)",
              opacity: 0.85,
            }}
          >
            {initial}
          </span>
        </div>
      )}

      {/* Extra scrim under the caption when text sits over a real photo — the
          shared --tott-writer-card-fade alone doesn't clear WCAG AA on bright
          portraits. Opt-in via strongOverlay so other rails are unaffected. */}
      {strongOverlay ? (
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 z-[9]"
          style={{
            height: "62%",
            background:
              "linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--tott-home-surface) 55%, transparent) 45%, var(--tott-home-surface) 100%)",
          }}
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
          className="w-full text-center"
          title={cardTitle}
          style={{
            maxWidth: `${nameMaxWidth}px`,
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: nameClamp,
            overflow: "hidden",
            overflowWrap: "anywhere",
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
          style={{ maxWidth: `${nameMaxWidth}px`, gap: "4px 8px" }}
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

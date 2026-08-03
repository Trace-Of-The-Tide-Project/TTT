"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { dirFor } from "@/i18n/dir";
import { articleHref } from "@/components/home/magazine-next/ui";
import { CalendarIcon, FolderIcon } from "@/components/ui/icons";
import { pillClipPath } from "@/components/ui/pillClipPath";
import type { ArticleCard } from "./data";

/** First two words' first grapheme, e.g. "Amina K." → "AK". Grapheme-based
 * (not char-based) so it doesn't split a combined Arabic/accented letter. */
function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => [...part][0] ?? "")
    .join("");
}

// Same silk-hex frame as FeaturedHexCard / BoardCoverflow's writer cards —
// all hex rails on this page read as one system.
const WRITER_CARD = "/images/home/Image-2.png";
const WRITER_TOP_ICON = "/images/home/Icon-4.svg";
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

/**
 * Article card (276×294) sharing the silk-hex frame with the Board writer
 * cards (Image-2.png + Icon-4.svg glyph, mask-clipped photo) instead of its
 * former bespoke rounded-hex SVG clip. Bottom scrim keeps this card's own
 * title + author/date/category meta row and the "Edition" pill — richer
 * than the plain writer card, so it isn't a straight `FeaturedHexCard` reuse.
 * Reused by Feature content and Latest content — both grids place these
 * inside `Honeycomb`.
 */
export function ContentCard({
  article,
  editionLabel,
  dateLabel,
}: {
  article: ArticleCard;
  /** i18n label for the bottom pill, e.g. t("edition"). */
  editionLabel: string;
  /** Already-formatted date string (shortDate helper upstream). */
  dateLabel: string | null;
}) {
  const dir = dirFor(article.language);
  const pillClip = pillClipPath(24);
  // Fall back to the silk frame alone if the cover photo 404s / fails.
  const [imgOk, setImgOk] = useState(true);
  const showPhoto = Boolean(article.coverImage) && imgOk;

  return (
    <Link
      href={articleHref(article.id, article.slug)}
      className="group relative block h-[294px] w-[276px] shrink-0 outline-none transition-transform duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--tott-accent-gold-focus)]"
    >
      {/* Silk hex frame — base fill so a real photo (layered on top below)
          isn't washed out by the silk texture. */}
      <Image
        src={WRITER_CARD}
        alt=""
        fill
        className="select-none object-contain"
        sizes="276px"
        draggable={false}
      />
      {showPhoto ? (
        <Image
          src={article.coverImage as string}
          alt=""
          fill
          sizes="276px"
          className="absolute inset-0 select-none object-cover transition-transform duration-500 group-hover:scale-105"
          style={HEX_PHOTO_MASK}
          draggable={false}
          onError={() => setImgOk(false)}
        />
      ) : null}

      <div
        aria-hidden
        className="absolute z-10"
        style={{ width: "48px", height: "48px", left: "calc(50% - 24px)", top: "8px" }}
      >
        <Image src={WRITER_TOP_ICON} alt="" fill sizes="48px" className="select-none" draggable={false} />
      </div>

      {/* Bottom scrim + text zone. */}
      <div
        className="absolute inset-x-0 bottom-0 z-10 flex h-[164px] flex-col items-center justify-end gap-2 px-6 pb-14 pt-6"
        style={{ background: "var(--tott-writer-card-fade)" }}
      >
        <p
          dir={dir}
          className="line-clamp-2 w-full text-center font-['IBM_Plex_Sans'] text-[20px] font-medium leading-[28px] text-[var(--tott-home-text-strong)]"
          style={{ textShadow: "var(--tott-home-text-shadow)" }}
        >
          {article.title}
        </p>
        <div className="flex w-full flex-wrap items-center justify-center gap-x-2 gap-y-1">
          {article.authorName ? (
            <span className="flex items-center gap-1 text-[12px] leading-4 text-[var(--tott-text-secondary-soft)]" style={{ textShadow: "var(--tott-home-text-shadow)" }}>
              <span className="relative flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white text-[8.5px] font-medium text-[var(--tott-hero-cta-ink)]">
                {article.authorAvatar ? (
                  <Image src={article.authorAvatar} alt="" fill sizes="16px" className="object-cover" />
                ) : (
                  initialsOf(article.authorName)
                )}
              </span>
              {article.authorName}
            </span>
          ) : null}
          {dateLabel ? (
            <span className="flex items-center gap-1 text-[12px] leading-4 text-[var(--tott-text-secondary-soft)]" style={{ textShadow: "var(--tott-home-text-shadow)" }}>
              <CalendarIcon size={16} />
              {dateLabel}
            </span>
          ) : null}
          {article.category ? (
            <span className="flex items-center gap-1 text-[12px] leading-4 text-[var(--tott-text-secondary-soft)]" style={{ textShadow: "var(--tott-home-text-shadow)" }}>
              <FolderIcon size={16} />
              {article.category}
            </span>
          ) : null}
        </div>
      </div>

      {/* Edition pill, bottom-centered, angled end-caps (Figma `Label`). */}
      <div className="absolute inset-x-0 bottom-6 z-10 flex items-center justify-center">
        <span
          className="px-4 py-1 text-[12px] font-medium leading-4 text-white"
          style={{ backgroundColor: "rgba(23,23,23,0.8)", clipPath: pillClip }}
        >
          {editionLabel}
        </span>
      </div>
    </Link>
  );
}

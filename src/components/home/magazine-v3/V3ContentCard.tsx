import { useId } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { dirFor } from "@/i18n/dir";
import { articleHref } from "@/components/home/magazine-next/ui";
import type { ArticleCard } from "./data";

/**
 * Honeycomb article card — taller than the original 276×294 for a more
 * editorial, less cramped feel, with genuinely rounded hex corners (real
 * arcs via an SVG clipPath, not the faceted `TOTT_AUTH_HEX_CLIP_PATH`
 * polygon shared with the auth flow — that one can't be curved without
 * affecting auth screens, so this card gets its own). Image, plain bottom
 * gradient scrim (no blur — a blurred hex edge over photography read as
 * muddy), centered title, author/date/category meta row, and an optional
 * bottom "Edition" pill. Reused by Feature content and Latest content —
 * both grids place these inside `V3Honeycomb`.
 */
export function V3ContentCard({
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
  const clipId = `v3-content-hex-${useId().replace(/:/g, "")}`;
  const clipUrl = `url(#${clipId})`;

  return (
    <Link
      href={articleHref(article.id, article.slug)}
      className="group relative block h-[344px] w-[276px] shrink-0 overflow-hidden outline-none transition-transform duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--tott-accent-gold-focus)]"
      style={{ clipPath: clipUrl }}
    >
      {/* Rounded hex silhouette, shared by the fill clip and the border ring
          below. objectBoundingBox coords (0–1) so it scales with the card. */}
      <svg aria-hidden width={0} height={0} className="absolute">
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path d="M 0.5 0.045 L 0.86 0.25 A 0.05 0.05 0 0 1 0.885 0.293 L 0.885 0.707 A 0.05 0.05 0 0 1 0.86 0.75 L 0.5 0.955 A 0.05 0.05 0 0 1 0.45 0.955 L 0.14 0.75 A 0.05 0.05 0 0 1 0.115 0.707 L 0.115 0.293 A 0.05 0.05 0 0 1 0.14 0.25 L 0.45 0.045 A 0.05 0.05 0 0 1 0.5 0.045 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* Base surface — shows if no cover image. */}
      <div className="absolute inset-0 bg-[var(--tott-elevated)]" />
      {article.coverImage ? (
        <Image
          src={article.coverImage}
          alt=""
          fill
          sizes="276px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : null}

      {/* Bottom scrim + text zone. */}
      <div
        className="absolute inset-x-0 bottom-0 flex h-[184px] flex-col items-center justify-end gap-2 px-6 pb-14 pt-6"
        style={{
          background:
            "linear-gradient(to bottom, rgba(23,23,23,0) 0%, #171717 100%)",
        }}
      >
        <p
          dir={dir}
          className="line-clamp-2 w-full text-center font-['IBM_Plex_Sans'] text-[20px] font-medium leading-[28px] text-white"
          style={{ textShadow: "0 1px 2px rgba(0,0,0,0.24)" }}
        >
          {article.title}
        </p>
        <div className="flex w-full flex-wrap items-center justify-center gap-x-2 gap-y-1">
          {article.authorName ? (
            <span className="flex items-center gap-1 text-[12px] leading-4 text-[var(--tott-text-secondary-soft)]" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.24)" }}>
              {article.authorName}
            </span>
          ) : null}
          {dateLabel ? (
            <span className="flex items-center gap-1 text-[12px] leading-4 text-[var(--tott-text-secondary-soft)]" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.24)" }}>
              {dateLabel}
            </span>
          ) : null}
          {article.category ? (
            <span className="flex items-center gap-1 text-[12px] leading-4 text-[var(--tott-text-secondary-soft)]" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.24)" }}>
              {article.category}
            </span>
          ) : null}
        </div>
      </div>

      {/* Edition pill, bottom-centered. */}
      <div className="absolute inset-x-0 bottom-6 flex items-center justify-center">
        <span
          className="rounded-full px-3 py-1 text-[12px] font-medium leading-4 text-white"
          style={{ backgroundColor: "rgba(23,23,23,0.85)" }}
        >
          {editionLabel}
        </span>
      </div>

      {/* Hex border — matches the surrounding page surface so it reads as an
          outline rather than a filled ring. */}
      <div
        className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-[var(--tott-card-border)]"
        style={{ clipPath: clipUrl }}
      />
    </Link>
  );
}

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { dirFor } from "@/i18n/dir";
import { TOTT_AUTH_HEX_CLIP_PATH } from "@/components/auth/shared/authHexClipPath";
import { articleHref } from "@/components/home/magazine-next/ui";
import type { ArticleCard } from "./data";

/**
 * Honeycomb article card (Figma `Content Card`, 276×294 @ desktop). Image,
 * bottom gradient scrim, centered title, author/date/category meta row, and
 * an optional bottom "Edition" pill. Reused by Feature content and Latest
 * content — both grids place these inside `V3Honeycomb`.
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

  return (
    <Link
      href={articleHref(article.id, article.slug)}
      className="group relative block h-[294px] w-[276px] shrink-0 overflow-hidden outline-none transition-transform duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--tott-accent-gold-focus)]"
      style={{ clipPath: TOTT_AUTH_HEX_CLIP_PATH }}
    >
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
        className="absolute inset-x-0 bottom-0 flex h-[164px] flex-col items-center justify-end gap-2 px-6 pb-14 pt-6 backdrop-blur-[4px]"
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
          className="rounded-full px-3 py-1 text-[12px] font-medium leading-4 text-white backdrop-blur-[4px]"
          style={{ backgroundColor: "rgba(23,23,23,0.8)" }}
        >
          {editionLabel}
        </span>
      </div>

      {/* Hex border — matches the surrounding page surface so it reads as an
          outline rather than a filled ring. */}
      <div
        className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-[var(--tott-card-border)]"
        style={{ clipPath: TOTT_AUTH_HEX_CLIP_PATH }}
      />
    </Link>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { dirFor } from "@/i18n/dir";
import { articleHref, stripHtml } from "@/components/home/magazine-next/ui";
import { CalendarIcon, FolderIcon } from "@/components/ui/icons";
import { ROUNDED_HEX_CLIP_ID } from "@/components/ui/RoundedHexClip";
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

/**
 * Editorial article card — elongated horizontal hexagon, cover image
 * clipped inside (never distorted, `object-cover` fills the box the hex
 * then clips), title + meta overlaid on a bottom scrim. Used by both
 * Feature content and Latest content rails; `variant` distinguishes the
 * single dominant center story ("feature") from the quieter side-rail
 * cards ("rail").
 */
export function ContentCard({
  article,
  editionLabel,
  dateLabel,
  variant = "rail",
}: {
  article: ArticleCard;
  /** i18n label for the small edition tag in the meta row. */
  editionLabel: string;
  /** Already-formatted date string (shortDate helper upstream). */
  dateLabel: string | null;
  variant?: "rail" | "feature";
}) {
  const dir = dirFor(article.language);
  const [imgOk, setImgOk] = useState(true);
  const showPhoto = Boolean(article.coverImage) && imgOk;
  const isFeature = variant === "feature";
  const excerpt = isFeature ? stripHtml(article.excerpt) : "";

  return (
    <Link
      href={articleHref(article.id, article.slug)}
      className="group block w-full outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--tott-accent-gold-focus)]"
    >
      <div
        className={`relative w-full overflow-hidden bg-[var(--tott-panel-bg)] ${
          isFeature ? "aspect-[16/9] sm:aspect-[1.55/1]" : "aspect-[1.55/1]"
        }`}
        style={{ clipPath: `url(#${ROUNDED_HEX_CLIP_ID})` }}
      >
        {showPhoto ? (
          <Image
            src={article.coverImage as string}
            alt=""
            fill
            sizes={isFeature ? "(min-width: 1024px) 60vw, 100vw" : "(min-width: 1024px) 22vw, 100vw"}
            className="select-none object-cover transition-transform duration-500 group-hover:scale-[1.05]"
            draggable={false}
            onError={() => setImgOk(false)}
          />
        ) : null}

        {/* Scrim so overlaid text stays readable regardless of image tone. */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0) 75%)" }}
        />

        {/* Content zone — inset from the angled edges so text never
            crosses the hex silhouette. */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-end text-center ${
            isFeature ? "px-[16%] pb-[9%]" : "px-[15%] pb-[8%]"
          }`}
        >
          {isFeature ? (
            <span
              className="mb-2 text-[11px] font-medium uppercase tracking-wide text-[var(--tott-accent-gold)]"
              style={{ textShadow: "0 1px 2px rgba(0,0,0,0.6)" }}
            >
              {editionLabel}
            </span>
          ) : null}

          <h3
            dir={dir}
            className={`line-clamp-2 font-['IBM_Plex_Sans'] font-medium text-white ${
              isFeature ? "text-[30px] leading-[36px]" : "text-[16px] leading-[21px]"
            }`}
            style={{ textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}
          >
            {article.title}
          </h3>

          {excerpt ? (
            <p
              dir={dir}
              className="mx-auto mt-2 line-clamp-2 max-w-[46ch] text-[14px] leading-[20px] text-white/80"
              style={{ textShadow: "0 1px 2px rgba(0,0,0,0.6)" }}
            >
              {excerpt}
            </p>
          ) : null}

          <div
            className={`mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px] leading-4 text-white/85 ${
              isFeature ? "" : "text-[10px]"
            }`}
            style={{ textShadow: "0 1px 2px rgba(0,0,0,0.6)" }}
          >
            {article.authorName ? (
              <span className="flex items-center gap-1">
                <span className="relative flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white text-[8px] font-medium text-[var(--tott-hero-cta-ink)]">
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
              <span className="flex items-center gap-1">
                <CalendarIcon size={14} />
                {dateLabel}
              </span>
            ) : null}
            {article.category ? (
              <span className="flex items-center gap-1">
                <FolderIcon size={14} />
                {article.category}
              </span>
            ) : null}
            <span className="text-[var(--tott-accent-gold)]">{editionLabel}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

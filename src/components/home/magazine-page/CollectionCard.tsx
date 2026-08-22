import { useId } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { pillClipPath } from "@/components/ui/pillClipPath";
import type { CollectionCard as CollectionCardData } from "./data";

/**
 * Collection card (Figma `Collection Card`, 276×448): beveled-octagon
 * silhouette — flat top/bottom/side edges with rounded corners at each
 * bevel (Figma's mask path is straight segments; the visible rounding
 * comes from the SVG's corner join, reproduced here with quadratic
 * curves) — a different family from `ContentCard`'s pointed hex.
 * Blurred bottom scrim, name, description, optional article-count chip
 * with angled end-caps.
 */
export function CollectionCard({
  collection,
  articlesLabel,
}: {
  collection: CollectionCardData;
  articlesLabel: string | null;
}) {
  const clipId = `v3-collection-hex-${useId().replace(/:/g, "")}`;
  const clipUrl = `url(#${clipId})`;
  const pillClip = pillClipPath(24);

  return (
    <Link
      href={collection.href}
      className="group relative block h-[356px] w-[220px] shrink-0 overflow-hidden outline-none transition-transform duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--tott-accent-gold-focus)] sm:h-[448px] sm:w-[276px]"
      style={{ clipPath: clipUrl }}
    >
      <svg aria-hidden width={0} height={0} className="absolute">
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path d="M 0.4605 0.0149 Q 0.5 0.0036 0.5395 0.0149 L 0.9278 0.1255 Q 0.9673 0.1368 0.982 0.1514 L 0.9853 0.1546 Q 1 0.1692 1 0.1962 L 1 0.8038 Q 1 0.8308 0.9853 0.8454 L 0.982 0.8486 Q 0.9673 0.8632 0.9278 0.8745 L 0.5395 0.9851 Q 0.5 0.9964 0.4605 0.9851 L 0.0722 0.8745 Q 0.0327 0.8632 0.018 0.8486 L 0.0147 0.8454 Q 0 0.8308 0 0.8038 L 0 0.1962 Q 0 0.1692 0.0147 0.1546 L 0.018 0.1514 Q 0.0327 0.1368 0.0722 0.1255 L 0.4605 0.0149 Z" />
          </clipPath>
        </defs>
      </svg>

      <div className="absolute inset-0 bg-[var(--tott-elevated)]" />
      {collection.coverImage ? (
        <Image
          src={collection.coverImage}
          alt={collection.name}
          fill
          sizes="(max-width: 640px) 220px, 276px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : null}

      {/* `backdrop-filter` blur has no opacity to fade — a single blurred
          rectangle shows a hard seam where it starts, so the blur ramps in
          over a masked band taller than the visible content block below. */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[224px] backdrop-blur-[4px] sm:h-[280px]"
        style={{
          maskImage: "linear-gradient(to top, black 0%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 100%)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 flex h-[168px] flex-col items-center justify-end gap-3 px-4 pb-6 pt-6 sm:h-[210px] sm:gap-4 sm:px-6 sm:pb-10 sm:pt-8"
        style={{ background: "linear-gradient(to bottom, rgba(23,23,23,0) 0%, var(--tott-home-surface) 100%)" }}
      >
        <div className="flex w-full flex-col items-center gap-2">
          <p
            className="line-clamp-2 w-full text-center font-['IBM_Plex_Sans'] text-[20px] font-medium leading-[28px] text-white"
            style={{ textShadow: "0 1px 2px rgba(0,0,0,0.24)" }}
          >
            {collection.name}
          </p>
          {collection.description ? (
            <p
              className="line-clamp-2 w-full text-center text-[14px] leading-5 tracking-[-0.07px] text-white"
              style={{ textShadow: "0 1px 2px rgba(0,0,0,0.24)" }}
            >
              {collection.description}
            </p>
          ) : null}
        </div>
        {articlesLabel ? (
          <span
            className="px-4 py-1 text-[12px] font-medium leading-4 text-white"
            style={{ backgroundColor: "rgba(23,23,23,0.8)", clipPath: pillClip }}
          >
            {articlesLabel}
          </span>
        ) : null}
      </div>

      <div
        className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-[var(--tott-card-border)]"
        style={{ clipPath: clipUrl }}
      />
    </Link>
  );
}

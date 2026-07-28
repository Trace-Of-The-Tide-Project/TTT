import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { V3_COLLECTION_HEX_CLIP_PATH } from "./collectionCardClipPath";
import type { CollectionCard as CollectionCardType } from "./data";

/**
 * Tall hex collection card (Figma `Collection Card`, 276×448). Same scrim
 * language as V3ContentCard but a taller image zone and an "N articles"
 * chip instead of author/date/category meta.
 */
export function V3CollectionCard({
  collection,
  articlesLabel,
}: {
  collection: CollectionCardType;
  /** i18n-formatted, e.g. t("articleCount", {count}) — omitted chip when count is 0 (unknown). */
  articlesLabel: string | null;
}) {
  return (
    <Link
      href={collection.href}
      className="group relative block h-[448px] w-[276px] shrink-0 overflow-hidden outline-none transition-transform duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--tott-accent-gold-focus)]"
      style={{ clipPath: V3_COLLECTION_HEX_CLIP_PATH }}
    >
      <div className="absolute inset-0 bg-[var(--tott-elevated)]" />
      {collection.coverImage ? (
        <Image
          src={collection.coverImage}
          alt=""
          fill
          sizes="276px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : null}

      <div
        className="absolute inset-x-0 bottom-0 flex h-[180px] flex-col items-center justify-end gap-6 px-6 py-8 backdrop-blur-[4px]"
        style={{
          background: "linear-gradient(to bottom, rgba(23,23,23,0) 0%, #171717 100%)",
        }}
      >
        <p
          className="line-clamp-2 w-full text-center font-['IBM_Plex_Sans'] text-[20px] font-medium leading-[28px] text-white"
          style={{ textShadow: "0 1px 2px rgba(0,0,0,0.24)" }}
        >
          {collection.name}
        </p>
        {articlesLabel ? (
          <span
            className="rounded-full px-3 py-1 text-[12px] font-medium leading-4 text-white backdrop-blur-[4px]"
            style={{ backgroundColor: "rgba(23,23,23,0.8)" }}
          >
            {articlesLabel}
          </span>
        ) : null}
      </div>

      <div
        className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-[var(--tott-card-border)]"
        style={{ clipPath: V3_COLLECTION_HEX_CLIP_PATH }}
      />
    </Link>
  );
}

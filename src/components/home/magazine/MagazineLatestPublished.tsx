"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FirstWordGold } from "./FirstWordGold";
import { BookCover } from "./BookCover";

// Pre-rendered hex card image (193×288, transparent background outside
// the hex). Silk fill + border baked in — used as the fallback when an
// article has no cover image of its own.
const CARD_IMAGE = "/images/home/Book Cover.png";

// Octagonal chamfer for the category chip — 6px corner cuts.
const CHIP_CHAMFER =
  "polygon(6px 0, calc(100% - 6px) 0, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0 calc(100% - 6px), 0 6px)";

export type LatestPublishedItem = {
  id: string;
  /** Category label rendered in the gold chip. */
  category: string;
  /** Article title shown under the chip. */
  title: string;
  /** Author display name shown under the title. */
  author: string;
  /** Reading time in minutes — rendered with the existing
   * "{minutes} min read" translation. */
  readingTime: number;
  /** Optional cover image overlaid on the silk hex. */
  coverImage?: string | null;
  /** Optional href for the card; today the design uses no link. */
  href?: string | null;
};

export type MagazineLatestPublishedProps = {
  /** Pass an empty array to hide the section. */
  items: LatestPublishedItem[];
};

/**
 * "Latest Published" — horizontal row of vertical-hex cards.
 *
 * The cards take their data from `items`; the silk hex graphic stays
 * baked in (it's the brand frame). The article's `coverImage` is
 * layered on top, clipped to the hex silhouette so the cover only
 * shows inside the visible hex.
 */
export function MagazineLatestPublished({
  items,
}: MagazineLatestPublishedProps) {
  const t = useTranslations("Home.magazine.publications");

  if (items.length === 0) return null;

  return (
    <section
      aria-labelledby="latest-published-heading"
      className="px-4 sm:px-6 md:px-8"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2
            id="latest-published-heading"
            className="text-lg font-medium tracking-tight sm:text-xl"
            style={{ color: "var(--tott-home-text-strong)" }}
          >
            <FirstWordGold raw={t("latestHeading")} />
          </h2>
          <p
            className="mt-1 text-sm"
            style={{ color: "var(--tott-home-text-muted)" }}
          >
            {t("latestSubtitle")}
          </p>
        </div>
        <Link
          href="/books"
          className="inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-90"
          style={{ color: "var(--tott-accent-gold)" }}
        >
          {t("viewMore")}
          <span aria-hidden>→</span>
        </Link>
      </div>

      <ul className="mt-8 flex flex-wrap justify-center gap-4 sm:gap-5">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex basis-[calc(50%-0.5rem)] flex-col items-stretch sm:basis-[170px] sm:max-w-[192px]"
          >
            <PublishedCardLink id={item.id}>
            {item.coverImage ? (
              // Real cover fills the hex at full opacity/colour; the hex
              // path itself provides the shape + 1px sheen border.
              <BookCover src={item.coverImage} alt={item.title} grayscale={false} />
            ) : (
              // No cover — fall back to the baked-in silk hex graphic.
              <div
                className="relative w-full"
                style={{ aspectRatio: "193 / 288" }}
              >
                <Image
                  src={CARD_IMAGE}
                  alt=""
                  fill
                  className="object-contain"
                  sizes="(min-width: 1024px) 192px, (min-width: 640px) 25vw, 45vw"
                />
              </div>
            )}
            <div className="mt-3 flex flex-col items-center text-center">
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: "88px",
                  height: "24px",
                  padding: "0 10px",
                  backgroundColor: "var(--tott-magazine-btn-bg)",
                  color: "var(--tott-auth-btn-text)",
                  fontSize: "11px",
                  fontWeight: 500,
                  clipPath: CHIP_CHAMFER,
                  WebkitClipPath: CHIP_CHAMFER,
                }}
              >
                {item.category}
              </span>
              <p
                className="mt-2 line-clamp-2 text-sm font-medium leading-snug sm:text-[0.95rem]"
                style={{ color: "var(--tott-home-text-strong)" }}
              >
                {item.title}
              </p>
              <p
                className="mt-1 text-xs sm:text-sm"
                style={{ color: "var(--tott-home-text-muted)" }}
              >
                {item.author}
                {item.readingTime > 0 ? (
                  <>
                    {" · "}
                    {t("cardReadTime", { minutes: item.readingTime })}
                  </>
                ) : null}
              </p>
            </div>
            </PublishedCardLink>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Wraps a card body in a Link to the public article reader when an
 * id is present; otherwise renders the body unwrapped so we never
 * produce a dead link. */
function PublishedCardLink({
  id,
  children,
}: {
  id: string | null | undefined;
  children: React.ReactNode;
}) {
  if (!id) return <>{children}</>;
  return (
    <Link
      href={`/content/article?id=${encodeURIComponent(id)}`}
      className="flex flex-col items-stretch transition-opacity hover:opacity-90"
    >
      {children}
    </Link>
  );
}

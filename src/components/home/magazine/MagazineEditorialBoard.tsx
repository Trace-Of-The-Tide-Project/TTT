"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  CalendarIcon,
  FolderIcon,
  BookIcon,
} from "@/components/ui/icons";
import { RichContent } from "@/components/ui/rich-text/RichContent";
import { FirstWordGold } from "./FirstWordGold";
import { HexPatternBackdrop } from "./HexPatternBackdrop";

// Top-icon SVG for the writer cards (Icon-4.svg in the home folder).
const WRITER_TOP_ICON = "/images/home/Icon-4.svg";

// Octagonal chamfer for label chips — 6px corner cuts. Same shape as
// the "Architecture / Art / Fashion ..." pills on the Latest Published
// row above so the page reads as one consistent system.
const CHIP_CHAMFER =
  "polygon(6px 0, calc(100% - 6px) 0, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0 calc(100% - 6px), 0 6px)";

// Pre-rendered hex/mask shape (196×206, transparent outside the
// hex silhouette). Used as the background mask for category cards.
const CARD_MASK = "/images/home/Mask.png";

// Pre-rendered hex card image (276×291 with silk fill + transparent
// hex silhouette). The card "shape" comes from this PNG, not a CSS
// border — overlay text/icons sit inside the visible hex.
const WRITER_CARD = "/images/home/Image-2.png";

// Clip a real avatar photo to the silk-hex silhouette (PNG alpha as mask),
// centered to line up with the `object-contain` silk below, so a portrait
// fills the hex in full colour instead of ghosting behind the silk.
const HEX_PHOTO_MASK = {
  WebkitMaskImage: `url(${WRITER_CARD})`,
  maskImage: `url(${WRITER_CARD})`,
  WebkitMaskSize: "100% auto",
  maskSize: "100% auto",
  WebkitMaskPosition: "center center",
  maskPosition: "center center",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  maskMode: "alpha",
} as React.CSSProperties;

// Side filler — gradient strip used at the left/right edges of the
// writer carousel to suggest more cards beyond the visible row.
const FILLER = "/images/home/Content Grid Filler.png";

// Fallback hex-wrapped icon for category cards when no specific
// category-icon mapping matches. The Less Read Content row uses a
// stable rotation through the available category artworks so each
// card has a distinct top-icon.
const CATEGORY_ICON_POOL = [
  "/images/home/IconArt.svg",          // Art (palette)
  "/images/home/IconFilm.svg",         // Film (filmstrip)
  "/images/home/IconArchitecture.svg", // Architecture (temple)
  "/images/home/IconMusic.svg",        // Music (note)
  "/images/home/IconSociety.svg",      // Society (home)
];

export type LessReadArticleItem = {
  id: string;
  title: string;
  author: string;
  date: string;
  category: string;
  edition?: string | null;
  /** Optional — when provided, replaces the rotating fallback. */
  iconSrc?: string;
};

export type FollowWriterItem = {
  id: string;
  /** User id the follow toggle targets (writer profiles wrap a user). */
  userId?: string | null;
  /** Display name shown under the silk hex. */
  name: string;
  /** Card title — typically the writer's bio headline; falls back to
   * the writer's display name when missing. */
  title?: string | null;
  edition?: string | null;
  /** Optional avatar / cover surfaced inside the hex frame. */
  avatar?: string | null;
};

export type FounderQuoteData = {
  quote: string;
  name: string;
};

export type MagazineEditorialBoardProps = {
  /** "Explore Less Read Content" cards. Empty array hides the row. */
  lessReadArticles: LessReadArticleItem[];
  /** "Follow our Writers" cards. Empty array hides the row. */
  writers: FollowWriterItem[];
  /** Founder pull-quote — when null/undefined, falls back to the
   * translation strings (the existing copy). */
  founder?: FounderQuoteData | null;
};

/**
 * Editorial Board pane:
 *  - Explore Less Read Content: hex category cards from low-view
 *    articles.
 *  - Follow our Writers: hex author cards from the featured writers
 *    endpoint.
 *  - Founder pull-quote at the bottom over a soft hex pattern.
 *
 * Each row hides cleanly when its data array is empty.
 */
export function MagazineEditorialBoard({
  lessReadArticles,
  writers,
  founder,
}: MagazineEditorialBoardProps) {
  const t = useTranslations("Home.magazine.editorialBoard");
  const founderQuote = founder?.quote ?? t("founderQuote");
  const founderName = founder?.name ?? t("founderName");
  const showLessRead = lessReadArticles.length > 0;
  const showWriters = writers.length > 0;

  return (
    <div className="grid gap-16 sm:gap-20">
      {/* ─── Explore Less Read Content ─────────────────────────────── */}
      {showLessRead ? (
        <section
          aria-labelledby="less-read-heading"
          className="px-4 sm:px-6 md:px-8"
        >
          <h2
            id="less-read-heading"
            style={{
              fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
              fontWeight: 500,
              fontSize: "18px",
              lineHeight: "24px",
              color: "var(--tott-home-text-strong)",
            }}
          >
            <FirstWordGold raw={t("lessReadHeading")} />
          </h2>

          <ul className="mt-6 flex flex-wrap justify-center gap-4 sm:gap-6">
            {lessReadArticles.map((article, i) => {
              const card = (
                <CategoryCard
                  iconSrc={
                    article.iconSrc ??
                    CATEGORY_ICON_POOL[i % CATEGORY_ICON_POOL.length]
                  }
                  title={article.title}
                  author={article.author}
                  date={article.date}
                  category={article.category}
                  edition={article.edition ?? ""}
                />
              );
              return (
                <li
                  key={article.id}
                  className="flex basis-[calc(50%-0.5rem)] justify-center sm:basis-[180px] sm:max-w-[196px]"
                >
                  {article.id ? (
                    <Link
                      href={`/content/article?id=${encodeURIComponent(article.id)}`}
                      className="flex w-full justify-center transition-opacity hover:opacity-90"
                    >
                      {card}
                    </Link>
                  ) : (
                    card
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {/* ─── Follow our Writers ─────────────────────────────────────── */}
      {showWriters ? (
        <section aria-labelledby="follow-writers-heading">
        <header
          className="flex items-center px-4 sm:px-6 md:px-8"
          style={{ gap: "24px" }}
        >
          <div className="flex flex-col" style={{ gap: "4px" }}>
            <h2
              id="follow-writers-heading"
              style={{
                fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
                fontWeight: 500,
                fontSize: "18px",
                lineHeight: "24px",
                color: "var(--tott-home-text-strong)",
              }}
            >
              <FirstWordGold raw={t("writersHeading")} />
            </h2>
            <p
              style={{
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 400,
                fontSize: "14px",
                lineHeight: "20px",
                letterSpacing: "-0.005em",
                color: "var(--tott-home-text-muted)",
                textShadow: "var(--tott-home-text-shadow)",
              }}
            >
              {t("writersSubtitle")}
            </p>
          </div>
        </header>

        <div className="relative mt-8 overflow-hidden">
          {/* Mobile / tablet / lg — responsive grid (no fillers). */}
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 xl:hidden">
            {writers.slice(0, 4).map((w) => (
              <div key={w.id} className="flex justify-center">
                <WriterCardLink id={w.id}>
                  <WriterCard writer={w} />
                </WriterCardLink>
              </div>
            ))}
          </div>

          {/* xl — flex row with side fillers (clipped on the edges of
              the viewport at 1280–1535 by the parent's overflow-hidden).
              The two fillers are asymmetric — the left one is mirrored
              (scaleX(-1)) so both fade inward toward the cards. Under RTL the
              flex main axis reverses, which swaps the fillers to the wrong
              sides (mirrored filler lands on the right). dir="ltr" pins the row
              so the fillers + cards keep their designed left→right positions in
              every locale, matching the English layout. */}
          <div
            dir="ltr"
            className="hidden items-start justify-center xl:flex"
            style={{ gap: "8px" }}
          >
            <div
              aria-hidden
              className="shrink-0"
              style={{ width: "138px", height: "294px", position: "relative" }}
            >
              <Image
                src={FILLER}
                alt=""
                fill
                className="select-none object-cover"
                style={{
                  transform: "scaleX(-1)",
                  filter: "var(--tott-image-invert)",
                }}
                sizes="138px"
                draggable={false}
              />
            </div>
            {writers.slice(0, 4).map((w) => (
              <WriterCardLink key={`d-${w.id}`} id={w.id}>
                <WriterCard writer={w} />
              </WriterCardLink>
            ))}
            <div
              aria-hidden
              className="shrink-0"
              style={{ width: "138px", height: "294px", position: "relative" }}
            >
              <Image
                src={FILLER}
                alt=""
                fill
                className="select-none object-cover"
                style={{ filter: "var(--tott-image-invert)" }}
                sizes="138px"
                draggable={false}
              />
            </div>
          </div>
        </div>
      </section>
      ) : null}

      {/* ─── Founder pull-quote — falls back to translations when no
          founder data is wired through (which is the current state
          until a CMS magazine page lands). */}
      <section
        className="relative overflow-hidden px-4 py-16 sm:px-12 sm:py-28 md:py-32"
        style={{ minHeight: "420px" }}
      >
        <HexPatternBackdrop />
        <blockquote
          className="relative mx-auto flex w-full max-w-[1232px] flex-col items-stretch"
          style={{ gap: "16px" }}
        >
          <p
            style={{
              fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
              fontWeight: 500,
              fontSize: "clamp(1.25rem, 3.2vw + 0.5rem, 2rem)",
              lineHeight: 1.25,
              color: "var(--tott-home-text-strong)",
              textAlign: "center",
              margin: 0,
            }}
          >
            <RichContent html={founderQuote} variant="inline" />
          </p>
          <footer
            style={{
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 500,
              fontSize: "16px",
              lineHeight: "24px",
              letterSpacing: "-0.01em",
              color: "var(--tott-home-text-strong)",
              textAlign: "center",
            }}
          >
            {founderName}
          </footer>
        </blockquote>
      </section>
    </div>
  );
}

/** Wraps a writer card in a Link to the writer detail page when an id
 * is present. Uses `display:contents` so the link is transparent to
 * the parent flex/grid layout — the inner card keeps its own sizing. */
function WriterCardLink({
  id,
  children,
}: {
  id: string | null | undefined;
  children: React.ReactNode;
}) {
  if (!id) return <>{children}</>;
  return (
    <Link
      href={`/writers/${encodeURIComponent(id)}`}
      className="contents"
      aria-label="View writer"
    >
      {children}
    </Link>
  );
}

/**
 * Category card — Mask.png hex background with a 48×48 SVG icon at the
 * top, gold-gradient title in the centre, and the Author/Date/Category/
 * Edition meta row underneath.
 */
function CategoryCard({
  iconSrc,
  title,
  author,
  date,
  category,
  edition,
}: {
  iconSrc: string;
  title: string;
  author: string;
  date: string;
  category: string;
  edition: string;
}) {
  // Gold radial-gradient text effect from the Figma spec.
  const goldGradientTextStyle = {
    fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
    fontWeight: 500,
    fontSize: "16px",
    lineHeight: "20px",
    color: "var(--tott-dash-gold-label)",
  } as React.CSSProperties;

  const metaTextStyle = {
    fontFamily: "'Inter', var(--font-sans, sans-serif)",
    fontWeight: 400,
    fontSize: "12px",
    lineHeight: "16px",
    color: "var(--tott-home-text-heading)",
    textShadow: "var(--tott-home-text-shadow)",
  } as React.CSSProperties;

  return (
    <div
      className="relative flex flex-col items-center justify-center"
      style={{
        width: "100%",
        maxWidth: "196px",
        aspectRatio: "196 / 206",
        padding: "12% 12%",
        flexShrink: 1,
      }}
    >
      {/* Pre-rendered hex mask as the card background. Inverted on
          light theme via the shared --tott-image-invert token so the
          dark hex flips to a light hex without losing the bevel/edge
          detail baked into Mask.png. */}
      <Image
        src={CARD_MASK}
        alt=""
        fill
        className="pointer-events-none select-none"
        style={{ filter: "var(--tott-image-invert)" }}
        sizes="196px"
        draggable={false}
      />

      {/* Top icon — pre-rendered 48×48 SVG (hex background + glyph all
          baked in). Positioned absolutely at the top of the card. */}
      <div
        aria-hidden
        className="absolute z-10"
        style={{
          width: "48px",
          height: "48px",
          left: "calc(50% - 24px)",
          top: "12px",
        }}
      >
        <Image
          src={iconSrc}
          alt=""
          fill
          sizes="48px"
          className="select-none"
          draggable={false}
        />
      </div>

      {/* Text block — title + meta, sits in the middle of the hex.
          z-10 so it renders above the Mask.png background. Margin-top
          pushes the block down past the absolute icon above. */}
      <div
        className="z-10 flex flex-col items-center"
        style={{ width: "148px", gap: "8px", marginTop: "8px" }}
      >
        {/* Title — single line; long titles truncate so the meta grid
            below stays anchored at the same y on every card. */}
        <p
          className="overflow-hidden text-center"
          style={{
            ...goldGradientTextStyle,
            width: "148px",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
          title={title}
        >
          {title}
        </p>

        {/* Meta — fixed 2×2 grid (Author | Date / Category | Edition).
            Locks each piece of meta to a deterministic cell so the
            date always sits in row 1, column 2 regardless of how
            long author / category text is. Each cell truncates with
            an ellipsis instead of wrapping. */}
        <div
          className="grid grid-cols-2 items-center justify-items-start"
          style={{ width: "148px", rowGap: "4px", columnGap: "8px" }}
        >
          {/* Author (row 1, col 1) */}
          <span
            className="flex min-w-0 items-center"
            style={{ gap: "4px", maxWidth: "100%" }}
          >
            <span
              className="flex shrink-0 items-center justify-center"
              style={{
                width: "16px",
                height: "16px",
                background: "var(--tott-dash-gold-text)",
                border: "1px solid var(--tott-card-border)",
                borderRadius: "999px",
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 500,
                fontSize: "8.5px",
                lineHeight: "10px",
                color: "var(--tott-auth-btn-text)",
              }}
            >
              A
            </span>
            <span
              style={{
                ...metaTextStyle,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                minWidth: 0,
              }}
              title={author}
            >
              {author}
            </span>
          </span>

          {/* Date (row 1, col 2) */}
          <span
            className="flex min-w-0 items-center"
            style={{ gap: "4px", maxWidth: "100%" }}
          >
            <span
              aria-hidden
              className="flex h-4 w-4 shrink-0 items-center justify-center [&>svg]:h-4 [&>svg]:w-4"
              style={{
                color: "var(--tott-home-text-strong)",
                filter: "drop-shadow(var(--tott-home-text-shadow))",
              }}
            >
              <CalendarIcon />
            </span>
            <span
              style={{
                ...metaTextStyle,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                minWidth: 0,
              }}
              title={date}
            >
              {date}
            </span>
          </span>

          {/* Category (row 2, col 1) */}
          <span
            className="flex min-w-0 items-center"
            style={{ gap: "4px", maxWidth: "100%" }}
          >
            <span
              aria-hidden
              className="flex h-4 w-4 shrink-0 items-center justify-center [&>svg]:h-4 [&>svg]:w-4"
              style={{
                color: "var(--tott-home-text-strong)",
                filter: "drop-shadow(var(--tott-home-text-shadow))",
              }}
            >
              <FolderIcon />
            </span>
            <span
              style={{
                ...metaTextStyle,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                minWidth: 0,
              }}
              title={category}
            >
              {category}
            </span>
          </span>

          {/* Edition (row 2, col 2) */}
          <span
            className="flex min-w-0 items-center"
            style={{ gap: "4px", maxWidth: "100%" }}
          >
            <span
              aria-hidden
              className="flex h-4 w-4 shrink-0 items-center justify-center [&>svg]:h-4 [&>svg]:w-4"
              style={{
                color: "var(--tott-home-text-strong)",
                filter: "drop-shadow(var(--tott-home-text-shadow))",
              }}
            >
              <BookIcon />
            </span>
            <span
              style={{
                ...metaTextStyle,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                minWidth: 0,
              }}
              title={edition}
            >
              {edition}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Writer card — hex-shaped per the comp. The Image-2.png provides both
 * the silhouette (transparent outside the hex) AND the silk fill, so
 * we don't need a CSS clip-path. Overlay elements sit inside the
 * visible hex area.
 */
function WriterCard({ writer }: { writer: FollowWriterItem }) {
  const t = useTranslations("Home.magazine.editorialBoard");
  const cardTitle = writer.title?.trim() || writer.name || t("writerCardTitle");
  const initial = (writer.name || cardTitle).slice(0, 1).toUpperCase() || "A";
  const editionLabel = writer.edition?.trim() || t("writerEdition");
  // Avatars are optional and the URL may be missing/broken (placeholder seed
  // data, 404s). On load error we drop the overlay so the silk hex frame shows
  // through cleanly instead of the browser's broken-image icon.
  const [avatarFailed, setAvatarFailed] = useState(false);

  return (
    <article
      className="relative w-full"
      style={{
        maxWidth: "276px",
        aspectRatio: "276 / 294",
        flexShrink: 0,
      }}
    >
      {/* Silk hex frame drawn first — fallback fill behind a real avatar,
          and the whole card when there's no photo (or it 404s). */}
      <Image
        src={WRITER_CARD}
        alt=""
        fill
        className="select-none object-contain"
        sizes="276px"
        draggable={false}
      />

      {/* Real avatar photo — clipped to the hex silhouette and shown in full
          colour on top of the silk (not ghosted behind it). External signed
          GCS URL, so `unoptimized` to dodge the Next optimizer 502. */}
      {writer.avatar && !avatarFailed ? (
        <Image
          src={writer.avatar}
          alt=""
          fill
          unoptimized
          className="absolute inset-0 select-none object-cover"
          style={HEX_PHOTO_MASK}
          sizes="276px"
          draggable={false}
          onError={() => setAvatarFailed(true)}
        />
      ) : null}

      {/* Top icon — pre-rendered Icon-4.svg (48×48 with hex bg + glyph
          baked in). */}
      <div
        aria-hidden
        className="absolute z-10"
        style={{
          width: "48px",
          height: "48px",
          left: "calc(50% - 24px)",
          top: "8px",
        }}
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

      {/* Bottom Text frame — proportional to the card width so the
          gradient follows the hex silhouette as the card shrinks on
          mobile/tablet. Padding kept in px to match the Figma spec on
          desktop. The dark fade is theme-aware: rendered on dark mode
          (matches the page surface), suppressed on light mode (would
          otherwise show as a dark rectangle below the silk hex). */}
      <div
        className="absolute bottom-0 left-0 z-10 flex w-full flex-col items-center justify-end"
        style={{
          height: "55.78%",
          padding: "24px 24px 56px",
          gap: "8px",
          background: "var(--tott-writer-card-fade)",
        }}
      >
        {/* Title */}
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

        {/* Author meta */}
        <div
          className="flex w-full flex-wrap items-center justify-center"
          style={{ maxWidth: "228px", gap: "4px 8px" }}
        >
          <span className="flex items-center" style={{ gap: "4px" }}>
            <span
              className="flex items-center justify-center"
              style={{
                width: "16px",
                height: "16px",
                background: "var(--tott-dash-gold-text)",
                border: "1px solid var(--tott-card-border)",
                borderRadius: "999px",
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
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
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 400,
                fontSize: "12px",
                lineHeight: "16px",
                color: "var(--tott-home-text-heading)",
                textShadow: "var(--tott-home-text-shadow)",
              }}
            >
              {writer.name}
            </span>
          </span>
        </div>
      </div>

      {/* Edition label — chamfered chip (cut corners), same shape as
          the Latest Published category pills. Dark fill so it reads
          on the silk image. */}
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
          fontFamily: "'Inter', var(--font-sans, sans-serif)",
          fontWeight: 500,
          fontSize: "12px",
          lineHeight: "16px",
          clipPath: CHIP_CHAMFER,
          WebkitClipPath: CHIP_CHAMFER,
        }}
      >
        {editionLabel}
      </span>
    </article>
  );
}

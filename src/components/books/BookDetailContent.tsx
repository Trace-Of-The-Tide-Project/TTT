"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Link, useRouter } from "@/i18n/navigation";
import { useSubmitBookReview } from "@/hooks/mutations/book-reviews";
import { formatApiError } from "@/lib/api/error-message";
import HexBackground from "@/components/ui/HexBackground";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";
import { HexPatternBackdrop } from "@/components/home/magazine/HexPatternBackdrop";
import { BookHexCover } from "@/components/books/BookHexCover";
import { MessageBubbleIcon } from "@/components/ui/icons";
import {
  DownloadIcon,
  ChevronRightIcon,
} from "@/components/ui/icons";

const SHARE_HEX = "/images/home/Icon-5.svg";
// Custom Figma icons used in the book detail action buttons.
const BUY_ICON = "/images/books/buy-icon.svg";
const PREVIEW_ICON = "/images/books/preview-icon.svg";

const CHIP_CHAMFER =
  "polygon(6px 0, calc(100% - 6px) 0, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0 calc(100% - 6px), 0 6px)";

export type BookDetail = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  category: string;
  author: string;
  /** Comma-separated names. Empty string when no co-authors. */
  coAuthors: string;
  /** Publisher name from the book record; null hides the row. */
  publisher: string | null;
  /** Year (string for forward-compat with non-numeric values). */
  year: string | null;
  /** Display name (e.g. "English"); null hides the row. */
  language: string | null;
  /** Reading time in minutes; null hides this row. */
  readingTime: number | null;
  /** Page count from the book record; null hides this row. */
  pageCount: number | null;
  /** Optional view count fallback (not used on /knowledge/books). */
  viewCount: number | null;
  /** Resolved absolute URL when the book has a downloadable PDF. */
  pdfUrl: string | null;
  /** rating_average from the book record (0..5). null hides the row. */
  rating: number | null;
  /** rating_count from the book record. null hides "(N reviews)". */
  reviewCount: number | null;
  /** Numeric price (or null when free / unset). */
  price: number | null;
  /** Currency code, used for formatting price. */
  currency: string;
};

export type BookReviewItem = {
  id: string;
  author: string;
  date: string;
  rating: number;
  body: string;
  quote?: string;
  quotePage?: number;
};

export function BookDetailContent({
  book,
  reviews,
}: {
  book: BookDetail;
  reviews: BookReviewItem[];
}) {
  const t = useTranslations("Home.bookDetail");

  return (
    <main
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{ backgroundColor: "var(--tott-home-surface)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-35 overflow-hidden"
        style={{ opacity: "var(--tott-dash-hex-opacity, 1)" }}
      >
        <HexBackground />
      </div>

      <div className="relative mx-auto w-full max-w-[1100px] px-4 pb-16 pt-24 sm:px-6 sm:pt-28 md:px-8 md:pt-32 min-[1600px]:max-w-[1400px]">
        {/* Breadcrumb — simple rounded-rectangle bar with the
            theme-aware --tott-dark-pill fill. Home glyph, then a
            space (no chevron) before the "Books" label, with
            chevrons between subsequent crumbs. Last item is
            Inter 500 white; others Inter 400 muted. */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center"
          style={{
            height: "56px",
            padding: "0 20px",
            gap: "12px",
            backgroundColor: "var(--tott-panel-bg)",
            border: "1px solid var(--tott-card-border)",
            borderRadius: "12px",
          }}
        >
          <Link
            href="/"
            aria-label="Home"
            className="inline-flex items-center justify-center transition-opacity hover:opacity-80 [&>svg]:h-5 [&>svg]:w-5"
            style={{
              width: "20px",
              height: "20px",
              color: "var(--tott-home-text-muted)",
            }}
          >
            <BreadcrumbHomeIcon />
          </Link>
          <Link
            href="/books"
            style={{
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "20px",
              letterSpacing: "-0.005em",
              color: "var(--tott-home-text-muted)",
            }}
            className="transition-opacity hover:opacity-80"
          >
            {t("breadcrumbBooks")}
          </Link>
          {book.category ? (
            <>
              <BreadcrumbChevron />
              <Link
                href="/books"
                className="capitalize transition-opacity hover:opacity-80"
                style={{
                  fontFamily: "'Inter', var(--font-sans, sans-serif)",
                  fontWeight: 400,
                  fontSize: "14px",
                  lineHeight: "20px",
                  letterSpacing: "-0.005em",
                  color: "var(--tott-home-text-muted)",
                }}
              >
                {book.category}
              </Link>
            </>
          ) : null}
          <BreadcrumbChevron />
          <span
            className="line-clamp-1 min-w-0"
            style={{
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 500,
              fontSize: "14px",
              lineHeight: "20px",
              letterSpacing: "-0.005em",
              color: "var(--tott-home-text-strong)",
            }}
          >
            {book.title}
          </span>
        </nav>

        {/* ── Top split: cover + info ───────────────────────────── */}
        <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-[260px_minmax(0,1fr)] min-[1600px]:gap-12 min-[1600px]:md:grid-cols-[340px_minmax(0,1fr)]">
          {/* Left column: cover + Buy Now / Preview buttons stacked
              under it (matches Figma layout where the actions sit
              beneath the cover, not inside the info column). */}
          <div
            className="mx-auto flex w-full flex-col md:mx-0"
            style={{ maxWidth: "360px", gap: "12px" }}
          >
            <BookHexCover src={book.coverImage} alt={book.title} />

            {/* Buy Now — Figma "Button" spec: 360×40, gold bg with
                an inset white-40% top highlight, 8px radius. */}
            <button
              type="button"
              className="inline-flex w-full items-center justify-center transition-opacity hover:opacity-90 min-[1600px]:h-14! min-[1600px]:text-base!"
              style={{
                height: "40px",
                padding: "8px",
                gap: "8px",
                borderRadius: "8px",
                backgroundColor: "var(--tott-magazine-btn-bg)",
                boxShadow: "inset 0px 1px 0px rgba(255, 255, 255, 0.4)",
                color: "var(--tott-auth-btn-text)",
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 500,
                fontSize: "14px",
                lineHeight: "20px",
                letterSpacing: "-0.005em",
                border: "none",
              }}
            >
              <span
                aria-hidden
                className="relative h-6"
                style={{ width: "28px" }}
              >
                <Image
                  src={BUY_ICON}
                  alt=""
                  fill
                  sizes="28px"
                  className="select-none"
                  draggable={false}
                />
              </span>
              {t("buyNow")}
            </button>
            {/* Preview — Figma "Button" spec: 360×40, #333333 bg
                (theme-aware via --tott-card-border), inset white-8%
                top highlight, 8px radius, Inter 400 14/20 white
                label (Paragraph/Small — note weight 400, not 500).
                Links to the dedicated /books/{id}/preview route. */}
            <Link
              href={`/books/${book.id}/preview`}
              className="inline-flex w-full items-center justify-center transition-opacity hover:opacity-90 min-[1600px]:h-14! min-[1600px]:text-base!"
              style={{
                height: "40px",
                padding: "8px",
                gap: "8px",
                borderRadius: "8px",
                backgroundColor: "var(--tott-card-border)",
                boxShadow: "inset 0px 1px 1px rgba(255, 255, 255, 0.08)",
                color: "var(--tott-home-text-strong)",
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 400,
                fontSize: "14px",
                lineHeight: "20px",
                letterSpacing: "-0.005em",
                border: "none",
              }}
            >
              <span
                aria-hidden
                className="relative h-6"
                style={{ width: "28px" }}
              >
                <Image
                  src={PREVIEW_ICON}
                  alt=""
                  fill
                  sizes="28px"
                  className="select-none"
                  draggable={false}
                />
              </span>
              {t("preview")}
            </Link>
          </div>

          {/* Info column — min-w-0 lets this grid child shrink below
              its content width so long unbroken strings wrap instead
              of forcing the column (and the page) wider. */}
          <div className="flex min-w-0 flex-col" style={{ padding: "0 8px", gap: "24px" }}>
            <h1
              className="min-[1600px]:text-[44px]! min-[1920px]:text-[56px]!"
              style={{
                fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
                fontWeight: 500,
                fontSize: "clamp(1.75rem, 2.4vw + 1rem, 2rem)",
                lineHeight: "1.25",
                color: "var(--tott-home-text-strong)",
                margin: 0,
                overflowWrap: "anywhere",
                wordBreak: "break-word",
              }}
            >
              {book.title}
            </h1>

            {/* Meta Data row — Category chip · partial-fill star
                with rating · "(N reviews)". Whole row hides when
                neither the category nor a rating is available. */}
            {book.category || book.rating !== null ? (
              <div
                className="flex flex-wrap items-center"
                style={{ gap: "12px" }}
              >
                {book.category ? <CategoryChip label={book.category} /> : null}
                {book.category && book.rating !== null ? (
                  <span
                    aria-hidden
                    style={{
                      fontFamily: "'Inter', var(--font-sans, sans-serif)",
                      fontWeight: 500,
                      fontSize: "12px",
                      lineHeight: "16px",
                      color: "var(--tott-home-text-muted)",
                      textShadow: "var(--tott-home-text-shadow)",
                    }}
                  >
                    ·
                  </span>
                ) : null}
                {book.rating !== null ? (
                  <span
                    className="flex items-center"
                    style={{ gap: "4px" }}
                  >
                    <PartialStar fill={book.rating / 5} size={16} />
                    <span
                      style={{
                        fontFamily: "'Inter', var(--font-sans, sans-serif)",
                        fontWeight: 500,
                        fontSize: "12px",
                        lineHeight: "16px",
                        color: "var(--tott-home-text-strong)",
                      }}
                    >
                      {book.rating.toFixed(1)}
                    </span>
                    {book.reviewCount !== null ? (
                      <span
                        style={{
                          fontFamily: "'Inter', var(--font-sans, sans-serif)",
                          fontWeight: 400,
                          fontSize: "12px",
                          lineHeight: "16px",
                          color: "var(--tott-home-text-muted)",
                        }}
                      >
                        {t("ratingReviews", { count: book.reviewCount })}
                      </span>
                    ) : null}
                  </span>
                ) : null}
              </div>
            ) : null}

            {/* Book Data — flex column of label+value rows.
                Each label is a fixed 128px so values align to a
                shared left edge. Padding 2px 0 + gap 8 per Figma. */}
            <div className="flex flex-col" style={{ gap: "8px" }}>
              <DataRow label={t("metaAuthoredBy")}>
                <AvatarCircle initial={book.author} />
                <span style={DATA_VALUE_STYLE}>{book.author}</span>
              </DataRow>
              {book.coAuthors ? (
                <DataRow label={t("metaCoAuthors")}>
                  <AvatarStack
                    initials={book.coAuthors
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .slice(0, 5)}
                  />
                  <span style={DATA_VALUE_STYLE}>
                    {formatCoAuthors(book.coAuthors)}
                  </span>
                </DataRow>
              ) : null}
              {book.publisher ? (
                <DataRow label={t("metaPublisher")}>
                  <span style={DATA_VALUE_STYLE}>{book.publisher}</span>
                </DataRow>
              ) : null}
              {book.year ? (
                <DataRow label={t("metaYear")}>
                  <span style={DATA_VALUE_STYLE}>{book.year}</span>
                </DataRow>
              ) : null}
              {book.language ? (
                <DataRow label={t("metaLanguage")}>
                  <span style={DATA_VALUE_STYLE}>{book.language}</span>
                </DataRow>
              ) : null}
              {book.pageCount ? (
                <DataRow label={t("metaPages")}>
                  <span style={DATA_VALUE_STYLE}>
                    {t("pages", { count: book.pageCount })}
                  </span>
                </DataRow>
              ) : book.readingTime ? (
                <DataRow label={t("metaPages")}>
                  <span style={DATA_VALUE_STYLE}>
                    {book.readingTime} min read
                  </span>
                </DataRow>
              ) : null}
              {book.pdfUrl ? (
                <DataRow label={t("metaContents")}>
                  <a
                    href={book.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="inline-flex items-center transition-opacity hover:opacity-90"
                    style={{
                      gap: "6px",
                      color: "var(--tott-dash-gold-label)",
                      fontFamily: "'Inter', var(--font-sans, sans-serif)",
                      fontWeight: 500,
                      fontSize: "12px",
                      lineHeight: "16px",
                    }}
                  >
                    <span
                      aria-hidden
                      className="[&>svg]:h-4 [&>svg]:w-4"
                    >
                      <DownloadIcon />
                    </span>
                    {t("downloadPdf")}
                  </a>
                </DataRow>
              ) : null}
            </div>

            {/* Description */}
            {book.excerpt ? (
              <section className="flex flex-col" style={{ gap: "8px" }}>
                <h2
                  className="min-[1600px]:text-[22px]!"
                  style={{
                    fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
                    fontWeight: 500,
                    fontSize: "16px",
                    lineHeight: "24px",
                    color: "var(--tott-home-text-muted)",
                    margin: 0,
                  }}
                >
                  Description
                </h2>
                <p
                  className="min-[1600px]:text-[17px]! min-[1600px]:leading-7!"
                  style={{
                    fontFamily: "'Inter', var(--font-sans, sans-serif)",
                    fontWeight: 400,
                    fontSize: "14px",
                    lineHeight: "20px",
                    letterSpacing: "-0.005em",
                    color: "var(--tott-home-text-strong)",
                    textShadow: "var(--tott-home-text-shadow)",
                    margin: 0,
                    // Break long unbroken strings (e.g. pasted URLs or
                    // gibberish with no spaces) so the description wraps
                    // inside the column instead of overflowing the page.
                    overflowWrap: "anywhere",
                    wordBreak: "break-word",
                  }}
                >
                  {book.excerpt}
                </p>
              </section>
            ) : null}

            {/* Reviews — sits inside the info column so the Figma
                left:540px position is preserved. Wired to
                /knowledge/books/{id}/reviews via the
                useSubmitBookReview mutation. */}
            <ReviewsSection
              bookId={book.id}
              reviews={reviews}
              tHeading={t("reviewsHeading")}
              tSeeAll={t("seeAllReviews")}
              tPlaceholder={t("writeReviewPlaceholder")}
              tAddQuote={t("addQuote")}
              tSubmit={t("submitReview")}
              tPage={(n) => t("page", { n })}
            />
          </div>
        </div>
      </div>

      {/* ── Share your story footer ───────────────────────────── */}
      <ShareYourStory />
    </main>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────

/** Home glyph for the breadcrumb — exact path from the Figma
 * `icon 3/home.svg` export, recoloured via currentColor so the
 * parent's text color drives it. */
function BreadcrumbHomeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M15.8334 7.25879L11.3892 3.80213C10.9992 3.49872 10.5192 3.33398 10.0251 3.33398C9.53093 3.33398 9.05091 3.49872 8.6609 3.80213L4.2159 7.25879C3.94877 7.46653 3.73264 7.73256 3.58403 8.03658C3.43541 8.3406 3.35824 8.67456 3.3584 9.01296V15.013C3.3584 15.455 3.53399 15.8789 3.84655 16.1915C4.15911 16.504 4.58304 16.6796 5.02507 16.6796H15.0251C15.4671 16.6796 15.891 16.504 16.2036 16.1915C16.5161 15.8789 16.6917 15.455 16.6917 15.013V9.01296C16.6917 8.32713 16.3751 7.67963 15.8334 7.25879Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BreadcrumbChevron() {
  return (
    <span
      aria-hidden
      className="inline-flex shrink-0 items-center justify-center [&>svg]:h-4 [&>svg]:w-4"
      style={{
        width: "16px",
        height: "20px",
        // Figma uses #5C5C5C — between border and muted-text — for
        // separators. Approximate with text-muted so the chevron
        // adapts to both themes.
        color: "var(--tott-home-text-muted)",
        opacity: 0.7,
      }}
    >
      <ChevronRightIcon />
    </span>
  );
}

/** Shared style for the right-side value text in each Book Data row.
 * Inter 500 12/16 strong on the page. */
const DATA_VALUE_STYLE = {
  fontFamily: "'Inter', var(--font-sans, sans-serif)",
  fontWeight: 500,
  fontSize: "12px",
  lineHeight: "16px",
  color: "var(--tott-home-text-strong)",
} as const;

/** Single label + value row in the Book Data block. Label fixed at
 * 128px so values align to a shared left edge across all rows. */
function DataRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center"
      style={{ padding: "2px 0", gap: "8px" }}
    >
      <span
        style={{
          width: "128px",
          flexShrink: 0,
          fontFamily: "'Inter', var(--font-sans, sans-serif)",
          fontWeight: 500,
          fontSize: "12px",
          lineHeight: "16px",
          color: "var(--tott-home-text-muted)",
          textShadow: "var(--tott-home-text-shadow)",
        }}
      >
        {label}
      </span>
      <span
        className="flex min-w-0 items-center"
        style={{ gap: "8px" }}
      >
        {children}
      </span>
    </div>
  );
}

/** Category chip — Figma "Label" element with the lighter
 * #DBC99E gold (--tott-dash-gold-text), dark text. Three-part
 * Left/Center/Right structure renders as a single rectangle. */
function CategoryChip({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center justify-center capitalize"
      style={{
        minWidth: "76px",
        height: "24px",
        padding: "4px 10px",
        backgroundColor: "var(--tott-dash-gold-text)",
        color: "var(--tott-auth-btn-text)",
        fontFamily: "'Inter', var(--font-sans, sans-serif)",
        fontWeight: 500,
        fontSize: "12px",
        lineHeight: "16px",
        boxShadow: "inset 0px 1px 1px rgba(255, 255, 255, 0.04)",
        clipPath: CHIP_CHAMFER,
        WebkitClipPath: CHIP_CHAMFER,
      }}
    >
      {label}
    </span>
  );
}

function AvatarCircle({ initial }: { initial: string }) {
  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: "20px",
        height: "20px",
        backgroundColor: "var(--tott-dash-gold-text)",
        fontFamily: "'Inter', var(--font-sans, sans-serif)",
        fontWeight: 500,
        fontSize: "10px",
        lineHeight: "12px",
        color: "var(--tott-auth-btn-text)",
      }}
    >
      {initial.charAt(0).toUpperCase() || "A"}
    </span>
  );
}

/** Overlapping avatar stack for the Co-authors row — 20×20 each
 * with a 2px ring matching the page surface so the overlap reads
 * cleanly. Offset -4px per Figma. */
function AvatarStack({ initials }: { initials: string[] }) {
  return (
    <span
      aria-hidden
      className="inline-flex items-center"
      style={{ marginInlineStart: "4px" }}
    >
      {initials.map((s, i) => (
        <span
          key={`${s}-${i}`}
          className="flex shrink-0 items-center justify-center rounded-full"
          style={{
            width: "20px",
            height: "20px",
            marginInline: "0 -4px",
            backgroundColor: "var(--tott-dash-gold-text)",
            color: "var(--tott-auth-btn-text)",
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 500,
            fontSize: "10px",
            lineHeight: "12px",
            boxShadow: "0 0 0 2px var(--tott-home-surface)",
          }}
        >
          {s.charAt(0).toUpperCase() || "A"}
        </span>
      ))}
    </span>
  );
}

/** Compress a comma-separated list of co-authors into the Figma
 * "Name, Name, Name +N" pattern. Shows the first three names and
 * the +N count for the rest. */
function formatCoAuthors(raw: string): string {
  const all = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (all.length === 0) return "";
  const head = all.slice(0, 3).join(", ");
  const extra = all.length - 3;
  return extra > 0 ? `${head} +${extra}` : head;
}

/** Filled star polygon — used as the fill layer when painting a
 * partial-fill rating star (the "liquid" inside the outline). */
function SolidStar() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

/** Outlined star polygon — always visible, so the user can see the
 * full star silhouette even when the gold fill only reaches partway
 * up the shape. */
function OutlineStar() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinejoin="round"
      aria-hidden
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

/** Single star whose gold fill rises from the bottom like a liquid
 * level — the outline stays fully visible so the rest of the star
 * shape is still readable as "this is a 5-star rating, the gold is
 * how much you got". For 4.5/5 the bottom 90% of the star paints
 * gold, the top 10% is just the outline against the page bg. */
function PartialStar({ fill, size = 16 }: { fill: number; size?: number }) {
  const clamped = Math.max(0, Math.min(1, fill));
  return (
    <span
      aria-hidden
      className="relative inline-block"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        color: "var(--tott-accent-gold)",
      }}
    >
      {/* Bottom-up gold fill layer — clip from the top so only the
          bottom `clamped * size` is visible. The inner span sticks
          to the bottom so the polygon geometry stays the same as
          the outline layer, just visually cropped. */}
      {clamped > 0 ? (
        <span
          className="absolute left-0 right-0 overflow-hidden"
          style={{
            bottom: 0,
            height: `${clamped * 100}%`,
          }}
        >
          <span
            className="absolute left-0"
            style={{
              bottom: 0,
              width: `${size}px`,
              height: `${size}px`,
            }}
          >
            <SolidStar />
          </span>
        </span>
      ) : null}
      {/* Outline — always full, painted on top so the stroke is
          crisp regardless of the fill height beneath it. */}
      <span className="absolute inset-0">
        <OutlineStar />
      </span>
    </span>
  );
}


// ─── Reviews ─────────────────────────────────────────────────────

function ReviewsSection({
  bookId,
  reviews,
  tHeading,
  tSeeAll,
  tPlaceholder,
  tAddQuote,
  tSubmit,
  tPage,
}: {
  bookId: string;
  reviews: BookReviewItem[];
  tHeading: string;
  tSeeAll: string;
  tPlaceholder: string;
  tAddQuote: string;
  tSubmit: string;
  tPage: (n: number) => string;
}) {
  const [draft, setDraft] = useState("");
  const [draftRating, setDraftRating] = useState(0);
  const [showQuote, setShowQuote] = useState(false);
  const [quote, setQuote] = useState("");
  const [guestName, setGuestName] = useState("");
  const submit = useSubmitBookReview(bookId);
  const router = useRouter();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (draftRating < 1) {
      toast.error("Please pick a star rating before submitting.");
      return;
    }
    submit.mutate(
      {
        rating: draftRating,
        review_text: draft.trim() || null,
        quote: showQuote && quote.trim() ? quote.trim() : null,
        guest_name: guestName.trim() || null,
      },
      {
        onSuccess: () => {
          toast.success("Review submitted", {
            description: "Thanks for sharing your thoughts.",
          });
          setDraft("");
          setQuote("");
          setShowQuote(false);
          setDraftRating(0);
          setGuestName("");
          // Re-run the server component so the new review (and the
          // updated rating average + count on the book record) appear
          // without a full page reload.
          router.refresh();
        },
        onError: (err) => {
          toast.error("Couldn't submit review", {
            description: formatApiError(err, "Please try again."),
          });
        },
      },
    );
  };

  const submitting = submit.isPending;

  return (
    <section
      aria-label={tHeading}
      className="relative mt-8 w-full"
      style={{ padding: "24px" }}
    >
      <ChamferedFrame size={24} borderColor="var(--tott-card-border)" />

      {/* Header: "Reviews" h2 + "See all reviews" gold link */}
      <div
        className="flex items-center justify-between"
        style={{ gap: "16px" }}
      >
        <h2
          className="min-[1600px]:text-[22px]!"
          style={{
            fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
            fontWeight: 500,
            fontSize: "16px",
            lineHeight: "24px",
            color: "var(--tott-home-text-strong)",
            margin: 0,
          }}
        >
          {tHeading}
        </h2>
        <Link
          href={`/books/${bookId}/reviews`}
          className="inline-flex items-center transition-opacity hover:opacity-90"
          style={{ gap: "8px", color: "var(--tott-dash-gold-label)" }}
        >
          <span
            aria-hidden
            className="[&>svg]:h-4 [&>svg]:w-4"
          >
            <MessageBubbleIcon />
          </span>
          <span
            style={{
              fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "20px",
              letterSpacing: "-0.006em",
            }}
          >
            {tSeeAll}
          </span>
        </Link>
      </div>

      {/* Write-a-review form — wired to POST /knowledge/books/{id}
          /reviews via useSubmitBookReview. The endpoint is public,
          so the form works for guests; we collect a guest_name
          inline instead of forcing auth. */}
      <form onSubmit={onSubmit} className="mt-4">
        <label
          htmlFor="book-review-textarea"
          style={{
            display: "block",
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 500,
            fontSize: "14px",
            lineHeight: "20px",
            letterSpacing: "-0.005em",
            color: "var(--tott-home-text-strong)",
            marginBottom: "8px",
          }}
        >
          {tPlaceholder}
        </label>
        <textarea
          id="book-review-textarea"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Share your thoughts about this book"
          rows={4}
          disabled={submitting}
          className="w-full focus:outline-none focus:ring-0 disabled:opacity-60"
          style={{
            backgroundColor: "var(--tott-panel-bg)",
            border: "1px solid var(--tott-card-border)",
            borderRadius: "8px",
            padding: "8px 12px",
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 400,
            fontSize: "14px",
            lineHeight: "20px",
            letterSpacing: "0.005em",
            color: "var(--tott-home-text-strong)",
            boxShadow: "none",
            resize: "vertical",
            outline: "none",
            minHeight: "112px",
          }}
        />

        {/* Optional quote field — toggled via Add Quote button. */}
        {showQuote ? (
          <input
            type="text"
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            placeholder="Favourite quote (optional)"
            disabled={submitting}
            className="mt-3 w-full focus:outline-none focus:ring-0 disabled:opacity-60"
            style={{
              backgroundColor: "var(--tott-panel-bg)",
              border: "1px solid var(--tott-card-border)",
              borderRadius: "8px",
              padding: "8px 12px",
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontStyle: "italic",
              fontSize: "14px",
              lineHeight: "20px",
              color: "var(--tott-home-text-strong)",
              boxShadow: "none",
              outline: "none",
              height: "40px",
            }}
          />
        ) : null}

        {/* Guest name input — only relevant pre-auth. The endpoint
            accepts no name and stores anonymous reviews, but the
            UI looks better with a name attached. */}
        <input
          type="text"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          placeholder="Your name (optional)"
          disabled={submitting}
          className="mt-3 w-full focus:outline-none focus:ring-0 disabled:opacity-60"
          style={{
            backgroundColor: "var(--tott-panel-bg)",
            border: "1px solid var(--tott-card-border)",
            borderRadius: "8px",
            padding: "8px 12px",
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 400,
            fontSize: "14px",
            lineHeight: "20px",
            color: "var(--tott-home-text-strong)",
            boxShadow: "none",
            outline: "none",
            height: "40px",
          }}
        />

        {/* Actions row */}
        <div
          className="mt-4 flex flex-wrap items-center"
          style={{ gap: "16px" }}
        >
          <span className="flex flex-1 items-center" style={{ gap: "4px" }}>
            <InteractiveStars
              value={draftRating}
              onChange={setDraftRating}
              size={24}
            />
          </span>
          <button
            type="button"
            onClick={() => setShowQuote((v) => !v)}
            disabled={submitting}
            className="inline-flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{
              height: "40px",
              padding: "8px 16px",
              borderRadius: "8px",
              backgroundColor: "var(--tott-card-border)",
              boxShadow: "inset 0px 1px 1px rgba(255, 255, 255, 0.08)",
              color: "var(--tott-home-text-strong)",
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "20px",
              letterSpacing: "-0.005em",
              border: "none",
            }}
          >
            {tAddQuote}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{
              height: "40px",
              padding: "8px 16px",
              borderRadius: "8px",
              backgroundColor: "var(--tott-magazine-btn-bg)",
              boxShadow: "inset 0px 1px 0px rgba(255, 255, 255, 0.4)",
              color: "var(--tott-auth-btn-text)",
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 500,
              fontSize: "14px",
              lineHeight: "20px",
              letterSpacing: "-0.005em",
              border: "none",
            }}
          >
            {submitting ? "Submitting…" : tSubmit}
          </button>
        </div>
      </form>

      {/* Divider */}
      <span
        aria-hidden
        className="mt-4 block w-full"
        style={{ borderTop: "1.5px solid var(--tott-card-border)" }}
      />

      {/* Review list — no card chrome; just avatar + body rows.
          Empty state shown when no reviews exist (the article API
          doesn't surface reviews yet). */}
      {reviews.length === 0 ? (
        <p
          className="mt-6 text-center"
          style={{
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 400,
            fontSize: "14px",
            lineHeight: "20px",
            letterSpacing: "-0.005em",
            color: "var(--tott-home-text-muted)",
          }}
        >
          No reviews yet.
        </p>
      ) : null}
      <ul className="mt-4 flex flex-col" style={{ gap: "16px" }}>
        {reviews.map((r) => (
          <li
            key={r.id}
            className="flex items-start"
            style={{ gap: "8px" }}
          >
            <ReviewAvatar initial={r.author} />
            <div
              className="flex min-w-0 flex-1 flex-col"
              style={{ gap: "8px" }}
            >
              {/* Header: name+stars on the left, date right */}
              <div
                className="flex items-start"
                style={{ gap: "8px" }}
              >
                <div
                  className="flex flex-col"
                  style={{ minWidth: "88px" }}
                >
                  <span
                    style={{
                      fontFamily: "'Inter', var(--font-sans, sans-serif)",
                      fontWeight: 500,
                      fontSize: "14px",
                      lineHeight: "20px",
                      letterSpacing: "-0.005em",
                      color: "var(--tott-home-text-strong)",
                    }}
                  >
                    {r.author}
                  </span>
                  <span
                    aria-label={`${r.rating} out of 5 stars`}
                    className="inline-flex items-center"
                    style={{ padding: "4px 0", gap: "2px" }}
                  >
                    {[0, 1, 2, 3, 4].map((i) => (
                      <span
                        key={i}
                        className="inline-block"
                        style={{
                          width: "12px",
                          height: "12px",
                          color:
                            i < Math.floor(r.rating)
                              ? "var(--tott-accent-gold)"
                              : "var(--tott-card-border)",
                        }}
                      >
                        <SolidStar />
                      </span>
                    ))}
                  </span>
                </div>
                <span
                  className="ml-auto"
                  style={{
                    fontFamily: "'Inter', var(--font-sans, sans-serif)",
                    fontWeight: 400,
                    fontSize: "12px",
                    lineHeight: "16px",
                    textAlign: "right",
                    color: "var(--tott-home-text-muted)",
                  }}
                >
                  {r.date}
                </span>
              </div>

              {/* Quote block (when present) */}
              {r.quote ? (
                <blockquote
                  className="flex items-start"
                  style={{
                    borderLeft: "2px solid var(--tott-accent-gold)",
                    padding: "6px 12px",
                    gap: "4px",
                    margin: 0,
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'Inter', var(--font-sans, sans-serif)",
                      fontWeight: 400,
                      fontStyle: "italic",
                      fontSize: "16px",
                      lineHeight: "24px",
                      letterSpacing: "-0.01em",
                      color: "var(--tott-home-text-strong)",
                      textShadow: "var(--tott-home-text-shadow)",
                      margin: 0,
                    }}
                  >
                    {r.quote}
                  </p>
                  {r.quotePage ? (
                    <span
                      style={{
                        fontFamily: "'Inter', var(--font-sans, sans-serif)",
                        fontWeight: 400,
                        fontSize: "12px",
                        lineHeight: "16px",
                        color: "var(--tott-home-text-muted)",
                      }}
                    >
                      {tPage(r.quotePage)}
                    </span>
                  ) : null}
                </blockquote>
              ) : null}

              {/* Body text */}
              <p
                style={{
                  fontFamily: "'Inter', var(--font-sans, sans-serif)",
                  fontWeight: 400,
                  fontSize: "14px",
                  lineHeight: "20px",
                  letterSpacing: "-0.005em",
                  color: "var(--tott-home-text-strong)",
                  textShadow: "var(--tott-home-text-shadow)",
                  margin: 0,
                }}
              >
                {r.body}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Larger 40×40 avatar circle for review rows. */
function ReviewAvatar({ initial }: { initial: string }) {
  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: "40px",
        height: "40px",
        backgroundColor: "var(--tott-dash-gold-text)",
        color: "var(--tott-auth-btn-text)",
        fontFamily: "'Inter', var(--font-sans, sans-serif)",
        fontWeight: 400,
        fontSize: "16px",
        lineHeight: "20px",
      }}
    >
      {initial.charAt(0).toUpperCase() || "A"}
    </span>
  );
}

function InteractiveStars({
  value,
  onChange,
  size = 16,
}: {
  value: number;
  onChange: (v: number) => void;
  size?: number;
}) {
  return (
    <span className="inline-flex items-center" style={{ gap: "4px" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          aria-label={`${i} stars`}
          aria-pressed={i === value}
          onClick={() => onChange(i)}
          className="relative inline-block transition-opacity hover:opacity-90"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            color:
              i <= value ? "var(--tott-accent-gold)" : "var(--tott-card-border)",
            background: "transparent",
            border: 0,
            padding: 0,
          }}
        >
          <SolidStar />
        </button>
      ))}
    </span>
  );
}

// ─── Share Your Story footer (same layout as Books page) ─────────

function ShareYourStory() {
  const t = useTranslations("Home");
  return (
    <section
      aria-labelledby="book-detail-share-heading"
      className="relative w-full overflow-hidden px-4 py-16 sm:px-12 sm:py-28 md:py-32"
      style={{ minHeight: "420px" }}
    >
      <HexPatternBackdrop />
      <div className="relative mx-auto flex w-full max-w-[560px] flex-col items-center text-center">
        <div
          aria-hidden
          className="relative"
          style={{ width: "80px", height: "88px" }}
        >
          <Image
            src={SHARE_HEX}
            alt=""
            fill
            sizes="80px"
            className="select-none"
            draggable={false}
          />
        </div>
        <div
          className="mt-6 flex w-full flex-col items-center"
          style={{ gap: "8px" }}
        >
          <h2
            id="book-detail-share-heading"
            className="min-[1600px]:text-[36px]! min-[1600px]:leading-[44px]!"
            style={{
              width: "100%",
              fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
              fontWeight: 500,
              fontSize: "24px",
              lineHeight: "32px",
              color: "var(--tott-home-text-strong)",
              textAlign: "center",
              margin: 0,
            }}
          >
            {t("shareTitle")}
          </h2>
          <p
            className="min-[1600px]:text-[17px]! min-[1600px]:leading-7!"
            style={{
              width: "100%",
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "20px",
              letterSpacing: "-0.005em",
              color: "var(--tott-home-text-muted)",
              textAlign: "center",
              margin: 0,
            }}
          >
            {t("shareBody")}
          </p>
        </div>
        <Link
          href="/contribute"
          className="mt-6 inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium transition-colors hover:opacity-90"
          style={{
            backgroundColor: "var(--tott-magazine-btn-bg)",
            color: "var(--tott-auth-btn-text)",
          }}
        >
          {t("shareCta")}
        </Link>
      </div>
    </section>
  );
}

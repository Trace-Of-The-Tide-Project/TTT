"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import HexBackground from "@/components/ui/HexBackground";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";
import { HexPatternBackdrop } from "@/components/home/magazine/HexPatternBackdrop";

const BOOK_HEX = "/images/home/Book Cover.png";
const SHARE_HEX = "/images/home/Icon-5.svg";

const CHIP_CHAMFER =
  "polygon(6px 0, calc(100% - 6px) 0, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0 calc(100% - 6px), 0 6px)";

export type BookReviewsBookSummary = {
  id: string;
  title: string;
  author: string;
  excerpt: string | null;
  coverImage: string | null;
  category: string;
  rating: number | null;
  reviewCount: number | null;
};

export type BookReviewsItem = {
  id: string;
  author: string;
  date: string;
  rating: number;
  body: string;
  quote?: string;
  quotePage?: number;
};

/**
 * "All reviews" page for a book — shows a condensed book summary
 * (cover + title + category + rating + author + description) at
 * the top, then the full reviews list. No write-review form or
 * "See all reviews" link (this IS the see-all destination).
 */
export function BookReviewsContent({
  book,
  reviews,
}: {
  book: BookReviewsBookSummary;
  reviews: BookReviewsItem[];
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

      <div className="relative mx-auto w-full max-w-[1100px] px-4 pb-16 pt-24 sm:px-6 sm:pt-28 md:px-8 md:pt-32">
        {/* Breadcrumb — Books > Title > Reviews */}
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
          <BreadcrumbHomeIcon />
          <Link
            href="/books"
            style={CRUMB_LINK_STYLE}
            className="transition-opacity hover:opacity-80"
          >
            {t("breadcrumbBooks")}
          </Link>
          <BreadcrumbChevron />
          <Link
            href={`/books/${book.id}`}
            className="line-clamp-1 transition-opacity hover:opacity-80"
            style={CRUMB_LINK_STYLE}
          >
            {book.title}
          </Link>
          <BreadcrumbChevron />
          <span style={CRUMB_ACTIVE_STYLE}>{t("reviewsHeading")}</span>
        </nav>

        {/* Compact book hero — cover left, info right */}
        <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-[200px_minmax(0,1fr)]">
          <div
            className="mx-auto w-full md:mx-0"
            style={{ maxWidth: "200px" }}
          >
            <div
              className="relative w-full"
              style={{ aspectRatio: "193 / 288" }}
            >
              {book.coverImage ? (
                <Image
                  src={book.coverImage}
                  alt=""
                  fill
                  className="absolute inset-0 object-cover opacity-70 mix-blend-luminosity"
                  sizes="200px"
                  priority
                />
              ) : null}
              <Image
                src={BOOK_HEX}
                alt=""
                fill
                className="object-contain"
                sizes="200px"
                priority
              />
            </div>
          </div>

          <div className="flex flex-col" style={{ gap: "16px" }}>
            <h1
              style={{
                fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
                fontWeight: 500,
                fontSize: "clamp(1.5rem, 2vw + 0.75rem, 2rem)",
                lineHeight: "1.25",
                color: "var(--tott-home-text-strong)",
                margin: 0,
              }}
            >
              {book.title}
            </h1>

            {/* Category + rating row */}
            {book.category || book.rating !== null ? (
              <div
                className="flex flex-wrap items-center"
                style={{ gap: "12px" }}
              >
                {book.category ? (
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
                      clipPath: CHIP_CHAMFER,
                      WebkitClipPath: CHIP_CHAMFER,
                    }}
                  >
                    {book.category}
                  </span>
                ) : null}
                {book.rating !== null ? (
                  <RatingPill
                    rating={book.rating}
                    reviewCount={book.reviewCount}
                    reviewsTpl={(n) => t("ratingReviews", { count: n })}
                  />
                ) : null}
              </div>
            ) : null}

            {/* Authored by */}
            <div
              className="flex items-center"
              style={{ gap: "8px" }}
            >
              <span style={LABEL_STYLE}>{t("metaAuthoredBy")}</span>
              <ReviewAvatar initial={book.author} size={20} fontSize={10} />
              <span style={VALUE_STYLE}>{book.author}</span>
            </div>

            {book.excerpt ? (
              <section className="flex flex-col" style={{ gap: "8px" }}>
                <h2
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
                  {book.excerpt}
                </p>
              </section>
            ) : null}
          </div>
        </div>

        {/* Reviews list */}
        <ul
          className="mt-10 flex flex-col"
          style={{ gap: "20px" }}
        >
          {reviews.length === 0 ? (
            <p
              className="text-center"
              style={{
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 400,
                fontSize: "14px",
                lineHeight: "20px",
                color: "var(--tott-home-text-muted)",
              }}
            >
              No reviews yet.
            </p>
          ) : (
            reviews.map((r) => (
              <li
                key={r.id}
                className="relative flex items-start"
                style={{ gap: "12px", padding: "20px 24px" }}
              >
                <ChamferedFrame
                  size={24}
                  borderColor="var(--tott-card-border)"
                />
                <ReviewAvatar initial={r.author} size={40} fontSize={16} />
                <div
                  className="flex min-w-0 flex-1 flex-col"
                  style={{ gap: "8px" }}
                >
                  <div
                    className="flex items-start"
                    style={{ gap: "8px" }}
                  >
                    <div className="flex flex-col">
                      <span
                        style={{
                          fontFamily:
                            "'Inter', var(--font-sans, sans-serif)",
                          fontWeight: 500,
                          fontSize: "14px",
                          lineHeight: "20px",
                          letterSpacing: "-0.005em",
                          color: "var(--tott-home-text-strong)",
                        }}
                      >
                        {r.author}
                      </span>
                      <SmallStarRow rating={r.rating} />
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

                  {r.quote ? (
                    <blockquote
                      className="flex flex-col items-start"
                      style={{
                        borderLeft: "2px solid var(--tott-accent-gold)",
                        padding: "6px 12px",
                        gap: "4px",
                        margin: 0,
                      }}
                    >
                      <p
                        style={{
                          fontFamily:
                            "'Inter', var(--font-sans, sans-serif)",
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
                            fontFamily:
                              "'Inter', var(--font-sans, sans-serif)",
                            fontWeight: 400,
                            fontSize: "12px",
                            lineHeight: "16px",
                            color: "var(--tott-home-text-muted)",
                          }}
                        >
                          {t("page", { n: r.quotePage })}
                        </span>
                      ) : null}
                    </blockquote>
                  ) : null}

                  {r.body ? (
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
                  ) : null}
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      <ShareYourStory />
    </main>
  );
}

// ─── Helpers (kept local — slight typography differences from
//     BookDetailContent so reusing one would be more brittle) ─────

const CRUMB_LINK_STYLE = {
  fontFamily: "'Inter', var(--font-sans, sans-serif)",
  fontWeight: 400,
  fontSize: "14px",
  lineHeight: "20px",
  letterSpacing: "-0.005em",
  color: "var(--tott-home-text-muted)",
} as const;

const CRUMB_ACTIVE_STYLE = {
  fontFamily: "'Inter', var(--font-sans, sans-serif)",
  fontWeight: 500,
  fontSize: "14px",
  lineHeight: "20px",
  letterSpacing: "-0.005em",
  color: "var(--tott-home-text-strong)",
} as const;

const LABEL_STYLE = {
  fontFamily: "'Inter', var(--font-sans, sans-serif)",
  fontWeight: 500,
  fontSize: "12px",
  lineHeight: "16px",
  color: "var(--tott-home-text-muted)",
  textShadow: "var(--tott-home-text-shadow)",
} as const;

const VALUE_STYLE = {
  fontFamily: "'Inter', var(--font-sans, sans-serif)",
  fontWeight: 500,
  fontSize: "12px",
  lineHeight: "16px",
  color: "var(--tott-home-text-strong)",
} as const;

function BreadcrumbHomeIcon() {
  return (
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
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
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
    </Link>
  );
}

function BreadcrumbChevron() {
  return (
    <span
      aria-hidden
      className="inline-flex shrink-0 items-center justify-center"
      style={{
        width: "16px",
        height: "20px",
        color: "var(--tott-home-text-muted)",
        opacity: 0.7,
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </span>
  );
}

function RatingPill({
  rating,
  reviewCount,
  reviewsTpl,
}: {
  rating: number;
  reviewCount: number | null;
  reviewsTpl: (n: number) => string;
}) {
  return (
    <span className="flex items-center" style={{ gap: "4px" }}>
      <SoloStar fill={rating / 5} size={16} />
      <span
        style={{
          fontFamily: "'Inter', var(--font-sans, sans-serif)",
          fontWeight: 500,
          fontSize: "12px",
          lineHeight: "16px",
          color: "var(--tott-home-text-strong)",
        }}
      >
        {rating.toFixed(1)}
      </span>
      {reviewCount !== null ? (
        <span
          style={{
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 400,
            fontSize: "12px",
            lineHeight: "16px",
            color: "var(--tott-home-text-muted)",
          }}
        >
          {reviewsTpl(reviewCount)}
        </span>
      ) : null}
    </span>
  );
}

function SoloStar({ fill, size = 16 }: { fill: number; size?: number }) {
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
      {clamped > 0 ? (
        <span
          className="absolute left-0 right-0 overflow-hidden"
          style={{ bottom: 0, height: `${clamped * 100}%` }}
        >
          <span
            className="absolute left-0"
            style={{
              bottom: 0,
              width: `${size}px`,
              height: `${size}px`,
            }}
          >
            <StarFilled />
          </span>
        </span>
      ) : null}
      <span className="absolute inset-0">
        <StarOutline />
      </span>
    </span>
  );
}

function SmallStarRow({ rating }: { rating: number }) {
  return (
    <span
      className="inline-flex items-center"
      style={{ padding: "4px 0", gap: "2px" }}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          aria-hidden
          className="inline-block"
          style={{
            width: "12px",
            height: "12px",
            color:
              i < Math.floor(rating)
                ? "var(--tott-accent-gold)"
                : "var(--tott-card-border)",
          }}
        >
          <StarFilled />
        </span>
      ))}
    </span>
  );
}

function StarFilled() {
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

function StarOutline() {
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

function ReviewAvatar({
  initial,
  size,
  fontSize,
}: {
  initial: string;
  size: number;
  fontSize: number;
}) {
  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: "var(--tott-dash-gold-text)",
        color: "var(--tott-auth-btn-text)",
        fontFamily: "'Inter', var(--font-sans, sans-serif)",
        fontWeight: 500,
        fontSize: `${fontSize}px`,
        lineHeight: 1,
      }}
    >
      {initial.charAt(0).toUpperCase() || "A"}
    </span>
  );
}

function ShareYourStory() {
  const t = useTranslations("Home");
  return (
    <section
      aria-labelledby="book-reviews-share-heading"
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
            id="book-reviews-share-heading"
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

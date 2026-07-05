"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import HexBackground from "@/components/ui/HexBackground";
import { BookHexCover } from "@/components/books/BookHexCover";
import { BookActionButtons, BookDownloadLink } from "@/components/books/BookPurchaseActions";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { BookDetailBreadcrumb, DataRow, CategoryChip, AvatarCircle, AvatarStack, formatCoAuthors, DATA_VALUE_STYLE } from "./detail/BookMeta";
import { ReviewsSection, PartialStar } from "./reviews/BookReviews";
import { BookDetailBanner } from "./detail/BookDetailBanner";

const PREVIEW_ICON = "/images/books/preview-icon.svg";

export type BookDetail = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  category: string;
  author: string;
  coAuthors: string;
  publisher: string | null;
  year: string | null;
  language: string | null;
  readingTime: number | null;
  pageCount: number | null;
  viewCount: number | null;
  pdfUrl: string | null;
  rating: number | null;
  reviewCount: number | null;
  price: number | null;
  currency: string;
  isFree: boolean;
  isOwned: boolean;
  printEnabled: boolean;
  printPrice: number | null;
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

export function BookDetailContent({ book, reviews }: { book: BookDetail; reviews: BookReviewItem[] }) {
  const t = useTranslations("Home.bookDetail");

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden" style={{ backgroundColor: "var(--tott-home-surface)" }}>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-35 overflow-hidden" style={{ opacity: "var(--tott-dash-hex-opacity, 1)" }}>
        <HexBackground />
      </div>

      <div className="relative mx-auto w-full max-w-[1100px] px-4 pb-16 pt-24 sm:px-6 sm:pt-28 md:px-8 md:pt-32 min-[1600px]:max-w-[1400px]">
        <BookDetailBreadcrumb bookTitle={book.title} bookCategory={book.category} breadcrumbBooks={t("breadcrumbBooks")} />

        <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-[260px_minmax(0,1fr)] min-[1600px]:gap-12 min-[1600px]:md:grid-cols-[340px_minmax(0,1fr)]">
          <div className="mx-auto flex w-full flex-col md:mx-0" style={{ maxWidth: "360px", gap: "12px" }}>
            <BookHexCover src={book.coverImage} alt={book.title} />
            <BookActionButtons
              bookId={book.id}
              price={book.price}
              currency={book.currency}
              isFree={book.isFree}
              isOwnedInitial={book.isOwned}
              printEnabled={book.printEnabled}
              printPrice={book.printPrice}
            />
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
              <span aria-hidden className="relative h-6" style={{ width: "28px" }}>
                <Image src={PREVIEW_ICON} alt="" fill sizes="28px" className="select-none" draggable={false} />
              </span>
              {t("preview")}
            </Link>
          </div>

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

            {book.category || book.rating !== null ? (
              <div className="flex flex-wrap items-center" style={{ gap: "12px" }}>
                {book.category ? <CategoryChip label={book.category} /> : null}
                {book.category && book.rating !== null ? (
                  <span aria-hidden style={{ fontFamily: "'Inter', var(--font-sans, sans-serif)", fontWeight: 500, fontSize: "12px", lineHeight: "16px", color: "var(--tott-home-text-muted)", textShadow: "var(--tott-home-text-shadow)" }}>·</span>
                ) : null}
                {book.rating !== null ? (
                  <span className="flex items-center" style={{ gap: "4px" }}>
                    <PartialStar fill={book.rating / 5} size={16} />
                    <span style={{ fontFamily: "'Inter', var(--font-sans, sans-serif)", fontWeight: 500, fontSize: "12px", lineHeight: "16px", color: "var(--tott-home-text-strong)" }}>
                      {book.rating.toFixed(1)}
                    </span>
                    {book.reviewCount !== null ? (
                      <span style={{ fontFamily: "'Inter', var(--font-sans, sans-serif)", fontWeight: 400, fontSize: "12px", lineHeight: "16px", color: "var(--tott-home-text-muted)" }}>
                        {t("ratingReviews", { count: book.reviewCount })}
                      </span>
                    ) : null}
                  </span>
                ) : null}
              </div>
            ) : null}

            <div className="flex flex-col" style={{ gap: "8px" }}>
              <DataRow label={t("metaAuthoredBy")}>
                <AvatarCircle initial={book.author} />
                <span style={DATA_VALUE_STYLE}>{book.author}</span>
              </DataRow>
              {book.coAuthors ? (
                <DataRow label={t("metaCoAuthors")}>
                  <AvatarStack initials={book.coAuthors.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 5)} />
                  <span style={DATA_VALUE_STYLE}>{formatCoAuthors(book.coAuthors)}</span>
                </DataRow>
              ) : null}
              {book.publisher ? <DataRow label={t("metaPublisher")}><span style={DATA_VALUE_STYLE}>{book.publisher}</span></DataRow> : null}
              {book.year ? <DataRow label={t("metaYear")}><span style={DATA_VALUE_STYLE}>{book.year}</span></DataRow> : null}
              {book.language ? <DataRow label={t("metaLanguage")}><span style={DATA_VALUE_STYLE}>{book.language}</span></DataRow> : null}
              {book.pageCount ? (
                <DataRow label={t("metaPages")}><span style={DATA_VALUE_STYLE}>{t("pages", { count: book.pageCount })}</span></DataRow>
              ) : book.readingTime ? (
                <DataRow label={t("metaPages")}><span style={DATA_VALUE_STYLE}>{book.readingTime} min read</span></DataRow>
              ) : null}
              {book.isFree || book.isOwned ? (
                <DataRow label={t("metaContents")}><BookDownloadLink bookId={book.id} label={t("downloadPdf")} /></DataRow>
              ) : null}
            </div>

            {book.excerpt ? (
              <RevealOnScroll>
                <section className="flex flex-col" style={{ gap: "8px" }}>
                  <h2
                    className="min-[1600px]:text-[22px]!"
                    style={{ fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)", fontWeight: 500, fontSize: "16px", lineHeight: "24px", color: "var(--tott-home-text-muted)", margin: 0 }}
                  >
                    Description
                  </h2>
                  <p
                    className="min-[1600px]:text-[17px]! min-[1600px]:leading-7!"
                    style={{ fontFamily: "'Inter', var(--font-sans, sans-serif)", fontWeight: 400, fontSize: "14px", lineHeight: "20px", letterSpacing: "-0.005em", color: "var(--tott-home-text-strong)", textShadow: "var(--tott-home-text-shadow)", margin: 0, overflowWrap: "anywhere", wordBreak: "break-word" }}
                  >
                    {book.excerpt}
                  </p>
                </section>
              </RevealOnScroll>
            ) : null}

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

      <BookDetailBanner />
    </main>
  );
}

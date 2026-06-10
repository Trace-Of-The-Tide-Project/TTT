import { notFound } from "next/navigation";
import {
  isUsableArticleMediaRef,
  resolveArticleMediaSrc,
} from "@/lib/content/article-media-url";
import { getBookById, getBookReviews } from "@/services/books.service";
import {
  BookDetailContent,
  type BookDetail,
  type BookReviewItem,
} from "@/components/books/BookDetailContent";

export const dynamic = "force-dynamic";

function languageName(code: string | null | undefined): string {
  const v = (code ?? "").trim().toLowerCase();
  if (!v) return "";
  const map: Record<string, string> = {
    en: "English",
    ar: "Arabic",
    es: "Spanish",
    fr: "French",
    de: "German",
  };
  return map[v] ?? v.toUpperCase();
}

function getYear(iso: string | null | undefined): string {
  const v = (iso ?? "").trim();
  if (!v) return "";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "" : String(d.getFullYear());
}

function formatReviewDate(iso: string | null | undefined): string {
  const v = (iso ?? "").trim();
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

type PageProps = {
  params: Promise<{ id: string; locale: string }>;
};

export default async function BookDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Fetch book + reviews in parallel.
  const [book, reviews] = await Promise.all([
    getBookById(id),
    getBookReviews(id, { limit: 20 }),
  ]);
  if (!book) return notFound();

  const ref = book.cover_image?.trim();
  const cover =
    ref && isUsableArticleMediaRef(ref) ? resolveArticleMediaSrc(ref) : null;
  const pdfRef = book.pdf_url?.trim();
  const pdfUrl =
    pdfRef && isUsableArticleMediaRef(pdfRef)
      ? resolveArticleMediaSrc(pdfRef)
      : null;

  const detail: BookDetail = {
    id: book.id,
    slug: book.id,
    title: book.title,
    excerpt: book.summary?.trim() || null,
    coverImage: cover,
    category: (book.genre ?? "").trim().toLowerCase(),
    author: book.author?.trim() || "Author",
    coAuthors: Array.isArray(book.co_authors) ? book.co_authors.join(", ") : "",
    publisher: book.publisher?.trim() || null,
    year:
      (book.year != null && String(book.year).trim()) ||
      getYear(book.published_date) ||
      null,
    language: languageName(book.language) || null,
    readingTime: null, // Books don't carry reading_time.
    pageCount:
      typeof book.page_count === "number" && book.page_count > 0
        ? book.page_count
        : null,
    viewCount: null,
    pdfUrl,
    rating:
      typeof book.rating_average === "number" && book.rating_average > 0
        ? book.rating_average
        : null,
    reviewCount:
      typeof book.rating_count === "number" && book.rating_count >= 0
        ? book.rating_count
        : null,
    price:
      book.price == null || book.price === ""
        ? null
        : Number(book.price),
    currency: (book.currency ?? "USD").toUpperCase(),
    isFree: book.is_free ?? (book.price == null || Number(book.price) <= 0),
    isOwned: book.is_owned ?? false,
  };

  const reviewItems: BookReviewItem[] = reviews.map((r) => ({
    id: r.id,
    author:
      r.reviewer?.full_name?.trim() ||
      r.reviewer?.username?.trim() ||
      r.guest_name?.trim() ||
      "Anonymous",
    date: formatReviewDate(r.createdAt),
    rating: r.rating,
    body: r.review_text?.trim() || "",
    quote: r.quote?.trim() || undefined,
  }));

  return <BookDetailContent book={detail} reviews={reviewItems} />;
}

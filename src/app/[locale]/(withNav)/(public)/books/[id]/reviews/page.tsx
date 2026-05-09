import { notFound } from "next/navigation";
import {
  isUsableArticleMediaRef,
  resolveArticleMediaSrc,
} from "@/lib/content/article-media-url";
import { getBookById, getBookReviews } from "@/services/books.service";
import {
  BookReviewsContent,
  type BookReviewsBookSummary,
  type BookReviewsItem,
} from "@/components/books/BookReviewsContent";

export const dynamic = "force-dynamic";

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

export default async function BookReviewsPage({ params }: PageProps) {
  const { id } = await params;

  const [book, reviews] = await Promise.all([
    getBookById(id),
    getBookReviews(id, { limit: 100 }),
  ]);
  if (!book) return notFound();

  const ref = book.cover_image?.trim();
  const cover =
    ref && isUsableArticleMediaRef(ref) ? resolveArticleMediaSrc(ref) : null;

  const summary: BookReviewsBookSummary = {
    id: book.id,
    title: book.title,
    author: book.author?.trim() || "Author",
    excerpt: book.summary?.trim() || null,
    coverImage: cover,
    category: (book.genre ?? "").trim().toLowerCase(),
    rating:
      typeof book.rating_average === "number" && book.rating_average > 0
        ? book.rating_average
        : null,
    reviewCount:
      typeof book.rating_count === "number" && book.rating_count >= 0
        ? book.rating_count
        : null,
  };

  const items: BookReviewsItem[] = reviews.map((r) => ({
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

  return <BookReviewsContent book={summary} reviews={items} />;
}

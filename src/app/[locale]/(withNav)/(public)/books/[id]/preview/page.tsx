import { notFound } from "next/navigation";
import {
  isUsableArticleMediaRef,
  resolveArticleMediaSrc,
} from "@/lib/content/article-media-url";
import { getBookById } from "@/services/books.service";
import {
  BookPreviewContent,
  type BookPreviewBook,
} from "@/components/books/BookPreviewContent";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string; locale: string }>;
};

export default async function BookPreviewPage({ params }: PageProps) {
  const { id } = await params;
  const book = await getBookById(id);
  if (!book) return notFound();

  const ref = book.pdf_url?.trim();
  const pdfUrl =
    ref && isUsableArticleMediaRef(ref) ? resolveArticleMediaSrc(ref) : null;

  const summary: BookPreviewBook = {
    id: book.id,
    title: book.title,
    category: (book.genre ?? "").trim().toLowerCase(),
    rating:
      typeof book.rating_average === "number" && book.rating_average > 0
        ? book.rating_average
        : null,
    reviewCount:
      typeof book.rating_count === "number" && book.rating_count >= 0
        ? book.rating_count
        : null,
    pageCount:
      typeof book.page_count === "number" && book.page_count > 0
        ? book.page_count
        : null,
    pdfUrl,
  };

  return <BookPreviewContent book={summary} />;
}

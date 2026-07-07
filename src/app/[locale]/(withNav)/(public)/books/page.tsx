import { getLocale } from "next-intl/server";
import {
  isUsableArticleMediaRef,
  resolveArticleMediaSrc,
} from "@/lib/content/article-media-url";
import { getBooks, type Book } from "@/services/books.service";
import {
  BooksPageContent,
  type BookItem,
} from "@/components/books/BooksPageContent";

export const dynamic = "force-dynamic";

function priceNumber(p: Book["price"]): number {
  if (p === null || p === undefined || p === "") return 0;
  if (typeof p === "number") return Number.isFinite(p) ? p : 0;
  const n = Number(p);
  return Number.isFinite(n) ? n : 0;
}

function authorOf(b: Book): string {
  const coAuthorStr = Array.isArray(b.co_authors) ? b.co_authors[0] : (b.co_authors ?? "");
  return (b.author?.trim() || coAuthorStr.trim() || "").trim() || "Author";
}

/** Server component — fetches the real /knowledge/books catalogue
 * and shapes each record into BookItem for the client grid. */
export default async function BooksPage() {
  const locale = await getLocale();
  // One card per translation group, viewer's language preferred.
  const books = await getBooks({ limit: 100, dedupe: "group", viewer_lang: locale });

  const items: BookItem[] = books.map((b) => {
    const ref = b.cover_image?.trim();
    const cover =
      ref && isUsableArticleMediaRef(ref)
        ? resolveArticleMediaSrc(ref)
        : null;

    return {
      id: b.id,
      // Books don't have a slug field — use the id for the route.
      slug: b.id,
      title: b.title,
      author: authorOf(b),
      coverImage: cover,
      category: (b.genre ?? "").trim() || null,
      language: (b.language ?? "").trim().toLowerCase() || null,
      price: priceNumber(b.price),
      rating:
        typeof b.rating_average === "number" && b.rating_average > 0
          ? b.rating_average
          : 0,
      reviewCount:
        typeof b.rating_count === "number" && b.rating_count >= 0
          ? b.rating_count
          : 0,
    };
  });

  return <BooksPageContent items={items} />;
}

import { serverGet } from "@/lib/api/isomorphic-fetch";
import { BooksPageContent, type BookItem } from "@/components/books/BooksPageContent";

export const dynamic = "force-dynamic";

type RawArticle = {
  id: string;
  title: string;
  slug?: string | null;
  cover_image?: string | null;
  category?: string | null;
  language?: string | null;
  view_count?: number | null;
  reading_time?: number | null;
  published_at?: string | null;
  author?: {
    full_name?: string | null;
    username?: string | null;
    profile?: { display_name?: string | null; avatar?: string | null } | null;
  } | null;
};

type Envelope<T> = { data?: T[] };

function unwrapList<T>(raw: Envelope<T> | T[] | null): T[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  return raw.data ?? [];
}

function pickAuthorName(a: RawArticle["author"]): string {
  return (
    a?.profile?.display_name?.trim() ||
    a?.full_name?.trim() ||
    a?.username?.trim() ||
    "Author"
  );
}

/** Server component — fetches articles and shapes them into the
 * BookItem contract used by the client page. Treats articles as
 * the "books" data source until the backend exposes a dedicated
 * /books endpoint. */
export default async function BooksPage() {
  const raw = await serverGet<Envelope<RawArticle>>("/articles", {
    status: "published",
    limit: 100,
    sortBy: "published_at",
    order: "DESC",
  });

  const items: BookItem[] = unwrapList(raw).map((a, i) => ({
    id: a.id,
    title: a.title,
    author: pickAuthorName(a.author),
    coverImage: a.cover_image ?? null,
    category: (a.category ?? "").trim() || null,
    language: (a.language ?? "").trim().toLowerCase() || null,
    // Demo pricing/rating — the API doesn't expose these for
    // articles. Stable derivation from index so the list isn't
    // jittery between renders.
    price: i % 3 === 0 ? 0 : 4.99 + (i % 5),
    rating: 4 + ((i * 0.3) % 1),
    reviewCount: 50 + i * 17,
  }));

  return <BooksPageContent items={items} />;
}

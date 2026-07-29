import { api } from "./api";

export type ArticleBookLink = {
  book_id: string;
  book_title: string | null;
  chapter_order: number;
  chapter_title: string | null;
};

function unwrapList(raw: unknown): ArticleBookLink[] {
  if (Array.isArray(raw)) return raw as ArticleBookLink[];
  if (raw && typeof raw === "object" && Array.isArray((raw as Record<string, unknown>).data)) {
    return (raw as Record<string, unknown>).data as ArticleBookLink[];
  }
  return [];
}

/** GET /knowledge/articles/:id/books — which book(s), if any, this article
 *  is a chapter of. There is no scalar book_id on the article; the join is
 *  book-owned (book_chapters), so this reads it from the article side. */
export async function getBooksForArticle(articleId: string): Promise<ArticleBookLink[]> {
  const { data } = await api.get<unknown>(`/knowledge/articles/${encodeURIComponent(articleId)}/books`);
  return unwrapList(data);
}

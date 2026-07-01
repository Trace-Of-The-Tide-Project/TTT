import { api } from "./api";

export type BookChapter = {
  id: string;
  book_id: string;
  article_id: string;
  chapter_order: number;
  chapter_title: string | null;
  article?: { id: string; title: string; slug: string } | null;
};

function unwrapList(raw: unknown): BookChapter[] {
  if (Array.isArray(raw)) return raw as BookChapter[];
  if (raw && typeof raw === "object" && Array.isArray((raw as Record<string, unknown>).data)) {
    return (raw as Record<string, unknown>).data as BookChapter[];
  }
  return [];
}

/** GET /knowledge/books/:id/chapters */
export async function getBookChapters(bookId: string): Promise<BookChapter[]> {
  const { data } = await api.get<unknown>(`/knowledge/books/${encodeURIComponent(bookId)}/chapters`);
  return unwrapList(data);
}

/** PUT /knowledge/books/:id/chapters — replaces the full ordered list. */
export async function setBookChapters(
  bookId: string,
  chapters: { article_id: string; chapter_title?: string | null }[],
): Promise<BookChapter[]> {
  const { data } = await api.put<unknown>(`/knowledge/books/${encodeURIComponent(bookId)}/chapters`, {
    chapters,
  });
  return unwrapList(data);
}

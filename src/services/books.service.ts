import { api } from "./api";
import { serverGet } from "@/lib/api/isomorphic-fetch";

/**
 * Knowledge Book record from `GET /knowledge/books`. Field set
 * mirrors the live API response — fields are optional/nullable
 * because the backend frequently leaves them blank.
 */
export type Book = {
  id: string;
  title: string;
  author?: string | null;
  co_authors?: string[] | null;
  publisher?: string | null;
  published_date?: string | null;
  year?: number | string | null;
  summary?: string | null;
  cover_image?: string | null;
  pdf_url?: string | null;
  genre?: string | null;
  language?: string | null;
  page_count?: number | null;
  price?: number | string | null;
  currency?: string | null;
  rating_average?: number | null;
  rating_count?: number | null;
  magazine_id?: string | null;
  created_by?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type BookReview = {
  id: string;
  book_id: string;
  user_id: string | null;
  guest_name: string | null;
  rating: number;
  review_text: string | null;
  quote: string | null;
  createdAt: string;
  updatedAt: string;
  reviewer?: {
    id?: string;
    username?: string | null;
    full_name?: string | null;
  } | null;
};

export type GetBooksParams = {
  search?: string;
  page?: number;
  limit?: number;
  /** Free / paid filter is applied client-side; the backend doesn't
   * document a canonical filter today. */
  language?: string;
  genre?: string;
  /** Server may accept these — they map straight to fields. */
  magazine_id?: string;
};

type Envelope<T> = { data?: T[]; meta?: unknown };

function unwrapList<T>(raw: Envelope<T> | T[] | null | unknown): T[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "object" && raw !== null && "data" in raw) {
    const d = (raw as { data?: T[] }).data;
    return Array.isArray(d) ? d : [];
  }
  return [];
}

function unwrapItem<T>(raw: unknown): T | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const inner = o.data;
  if (inner && typeof inner === "object" && "id" in (inner as object)) {
    return inner as T;
  }
  if ("id" in o) return o as unknown as T;
  return null;
}

/** GET /knowledge/books — public list. Server-or-client safe. */
export async function getBooks(params?: GetBooksParams): Promise<Book[]> {
  const path = "/knowledge/books";
  if (typeof window === "undefined") {
    const raw = await serverGet<unknown>(path, params);
    return unwrapList<Book>(raw);
  }
  try {
    const { data } = await api.get<unknown>(path, { params });
    return unwrapList<Book>(data);
  } catch {
    return [];
  }
}

/** GET /knowledge/books/{id} */
export async function getBookById(id: string): Promise<Book | null> {
  const path = `/knowledge/books/${encodeURIComponent(id)}`;
  if (typeof window === "undefined") {
    const raw = await serverGet<unknown>(path);
    return unwrapItem<Book>(raw);
  }
  try {
    const { data } = await api.get<unknown>(path);
    return unwrapItem<Book>(data);
  } catch {
    return null;
  }
}

/** GET /knowledge/books/{id}/reviews */
export async function getBookReviews(
  bookId: string,
  params?: { limit?: number; page?: number },
): Promise<BookReview[]> {
  const path = `/knowledge/books/${encodeURIComponent(bookId)}/reviews`;
  if (typeof window === "undefined") {
    const raw = await serverGet<unknown>(path, params);
    return unwrapList<BookReview>(raw);
  }
  try {
    const { data } = await api.get<unknown>(path, { params });
    return unwrapList<BookReview>(data);
  } catch {
    return [];
  }
}

export type SubmitBookReviewPayload = {
  rating: number;
  review_text?: string | null;
  quote?: string | null;
  /** Display name when submitting as a guest (no auth). */
  guest_name?: string | null;
};

/** POST /knowledge/books/{id}/reviews — public, no auth required. */
export async function submitBookReview(
  bookId: string,
  payload: SubmitBookReviewPayload,
): Promise<BookReview | null> {
  const { data } = await api.post<unknown>(
    `/knowledge/books/${encodeURIComponent(bookId)}/reviews`,
    payload,
  );
  return unwrapItem<BookReview>(data);
}

export type BookPayload = {
  title: string;
  author?: string | null;
  co_authors?: string[] | null;
  publisher?: string | null;
  published_date?: string | null;
  year?: number | null;
  summary?: string | null;
  cover_image?: string | null;
  pdf_url?: string | null;
  genre?: string | null;
  language?: "en" | "ar" | "es" | "fr" | "de" | null;
  page_count?: number | null;
  price?: number | null;
  currency?: string | null;
  magazine_id?: string | null;
  created_by?: string | null;
};

/** POST /knowledge/books — requires JWT + admin role. */
export async function createBook(payload: BookPayload): Promise<Book> {
  const { data } = await api.post<unknown>("/knowledge/books", payload);
  const item = unwrapItem<Book>(data);
  if (!item) throw new Error("Invalid response from create book");
  return item;
}

/** PATCH /knowledge/books/:id */
export async function updateBook(
  id: string,
  payload: Partial<BookPayload>,
): Promise<Book> {
  const { data } = await api.patch<unknown>(
    `/knowledge/books/${encodeURIComponent(id)}`,
    payload,
  );
  const item = unwrapItem<Book>(data);
  if (!item) throw new Error("Invalid response from update book");
  return item;
}

/** DELETE /knowledge/books/:id */
export async function deleteBook(id: string): Promise<void> {
  await api.delete(`/knowledge/books/${encodeURIComponent(id)}`);
}

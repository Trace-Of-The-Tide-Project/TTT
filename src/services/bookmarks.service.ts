import { api } from "./api";

export type Bookmark = {
  id: string;
  article_id: string;
  created_at: string;
};

export type BookmarksPage = {
  data: Bookmark[];
  total: number;
  page: number;
  limit: number;
};

export async function getBookmarks(params?: { page?: number; limit?: number }): Promise<BookmarksPage> {
  const res = await api.get("/bookmarks", { params });
  return res.data;
}

export async function checkBookmark(articleId: string): Promise<{ isBookmarked: boolean }> {
  const res = await api.get(`/bookmarks/check/${articleId}`);
  return res.data;
}

export async function addBookmark(articleId: string): Promise<Bookmark> {
  const res = await api.post(`/bookmarks/${articleId}`);
  return res.data;
}

export async function removeBookmark(articleId: string): Promise<void> {
  await api.delete(`/bookmarks/${articleId}`);
}

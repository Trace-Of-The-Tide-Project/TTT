import { api } from "./api";
import type { ArticleListItem } from "./articles.service";

export type Bookmark = {
  id: string;
  article_id: string;
  createdAt: string;
  article?: ArticleListItem;
};

export type BookmarksPage = {
  rows: Bookmark[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

export async function getBookmarks(params?: { page?: number; limit?: number }): Promise<BookmarksPage> {
  const res = await api.get("/bookmarks", { params });
  return res.data.data;
}

export async function checkBookmark(articleId: string): Promise<{ isBookmarked: boolean }> {
  const res = await api.get(`/bookmarks/check/${articleId}`);
  return res.data.data;
}

export async function addBookmark(articleId: string): Promise<Bookmark> {
  const res = await api.post(`/bookmarks/${articleId}`);
  return res.data.data;
}

export async function removeBookmark(articleId: string): Promise<void> {
  await api.delete(`/bookmarks/${articleId}`);
}

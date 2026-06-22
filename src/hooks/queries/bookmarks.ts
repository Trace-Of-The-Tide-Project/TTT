import { useQuery } from "@tanstack/react-query";
import { checkBookmark, getBookmarks } from "@/services/bookmarks.service";

export const bookmarksKeys = {
  all: ["bookmarks"] as const,
  list: (params?: { page?: number; limit?: number }) =>
    ["bookmarks", "list", params ?? {}] as const,
  check: (articleId: string) => ["bookmarks", "check", articleId] as const,
};

export function useBookmarks(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: bookmarksKeys.list(params),
    queryFn: () => getBookmarks(params),
    meta: { silent: true },
  });
}

export function useBookmarkCheck(articleId: string | null | undefined) {
  return useQuery({
    queryKey: bookmarksKeys.check(articleId ?? ""),
    queryFn: () => checkBookmark(articleId as string),
    enabled: Boolean(articleId),
    meta: { silent: true },
  });
}

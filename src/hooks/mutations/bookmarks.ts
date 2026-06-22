import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addBookmark, removeBookmark } from "@/services/bookmarks.service";
import { bookmarksKeys } from "@/hooks/queries/bookmarks";

export function useAddBookmark(articleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => addBookmark(articleId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bookmarksKeys.check(articleId) });
      qc.invalidateQueries({ queryKey: bookmarksKeys.list() });
    },
    meta: { silent: true },
  });
}

export function useRemoveBookmark(articleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => removeBookmark(articleId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bookmarksKeys.check(articleId) });
      qc.invalidateQueries({ queryKey: bookmarksKeys.list() });
    },
    meta: { silent: true },
  });
}

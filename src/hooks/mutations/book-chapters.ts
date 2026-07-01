import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setBookChapters } from "@/services/book-chapters.service";
import { bookChaptersKeys } from "@/hooks/queries/book-chapters";

export function useSetBookChapters(bookId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (chapters: { article_id: string; chapter_title?: string | null }[]) =>
      setBookChapters(bookId, chapters),
    onSuccess: () => qc.invalidateQueries({ queryKey: bookChaptersKeys.list(bookId) }),
  });
}

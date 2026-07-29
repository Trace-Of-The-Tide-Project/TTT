import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setBookChapters, scheduleBookChapters } from "@/services/book-chapters.service";
import { bookChaptersKeys } from "@/hooks/queries/book-chapters";

export function useSetBookChapters(bookId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (chapters: { article_id: string; chapter_title?: string | null }[]) =>
      setBookChapters(bookId, chapters),
    onSuccess: () => qc.invalidateQueries({ queryKey: bookChaptersKeys.list(bookId) }),
  });
}

export function useScheduleBookChapters(bookId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ startAt, intervalDays }: { startAt: string; intervalDays: number }) =>
      scheduleBookChapters(bookId, startAt, intervalDays),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bookChaptersKeys.list(bookId) });
      qc.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}

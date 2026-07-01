import { useQuery } from "@tanstack/react-query";
import { getBookChapters } from "@/services/book-chapters.service";

export const bookChaptersKeys = {
  list: (bookId: string) => ["book-chapters", bookId] as const,
};

export function useBookChapters(bookId: string | null | undefined) {
  return useQuery({
    queryKey: bookChaptersKeys.list(bookId ?? ""),
    queryFn: () => getBookChapters(bookId as string),
    enabled: Boolean(bookId),
  });
}

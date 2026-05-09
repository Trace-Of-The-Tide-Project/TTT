import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  submitBookReview,
  type SubmitBookReviewPayload,
} from "@/services/books.service";

export const bookReviewsKeys = {
  all: ["book-reviews"] as const,
  byBook: (bookId: string) => ["book-reviews", "list", bookId] as const,
};

export function useSubmitBookReview(bookId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubmitBookReviewPayload) =>
      submitBookReview(bookId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bookReviewsKeys.byBook(bookId) });
    },
  });
}

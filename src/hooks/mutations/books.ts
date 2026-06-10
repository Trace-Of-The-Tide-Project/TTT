import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createBook,
  updateBook,
  deleteBook,
  type BookPayload,
} from "@/services/books.service";
import { booksKeys } from "@/hooks/queries/books";

export function useCreateBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: BookPayload) => createBook(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: booksKeys.all }),
    meta: { silent: true },
  });
}

export function useUpdateBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { bookId: string; payload: Partial<BookPayload> }) =>
      updateBook(args.bookId, args.payload),
    onSuccess: (_d, args) => {
      qc.invalidateQueries({ queryKey: booksKeys.byId(args.bookId) });
      qc.invalidateQueries({ queryKey: booksKeys.all });
    },
    meta: { silent: true },
  });
}

export function useDeleteBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bookId: string) => deleteBook(bookId),
    onSuccess: () => qc.invalidateQueries({ queryKey: booksKeys.all }),
    meta: { silent: true },
  });
}

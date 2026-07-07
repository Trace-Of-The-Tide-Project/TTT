import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createBook,
  updateBook,
  deleteBook,
  linkBookTranslation,
  type BookPayload,
} from "@/services/books.service";
import { booksKeys } from "@/hooks/queries/books";
import { translationKeys } from "@/hooks/queries/translations";

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

export function useLinkBookTranslation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { bookId: string; targetId: string }) =>
      linkBookTranslation(args.bookId, args.targetId),
    onSuccess: (_d, args) => {
      qc.invalidateQueries({ queryKey: translationKeys.group("book", args.bookId) });
      qc.invalidateQueries({ queryKey: translationKeys.group("book", args.targetId) });
      qc.invalidateQueries({ queryKey: booksKeys.all });
    },
    meta: { silent: true },
  });
}

import { useQuery } from "@tanstack/react-query";
import { getBooks, getBookById, type GetBooksParams } from "@/services/books.service";

export const booksKeys = {
  all: ["books"] as const,
  list: (params?: GetBooksParams) => ["books", "list", params ?? {}] as const,
  byId: (id: string) => ["books", "byId", id] as const,
};

export function useBooks(params?: GetBooksParams) {
  return useQuery({
    queryKey: booksKeys.list(params),
    queryFn: () => getBooks(params),
  });
}

export function useBook(bookId: string | null | undefined) {
  return useQuery({
    queryKey: booksKeys.byId(bookId ?? ""),
    queryFn: () => getBookById(bookId as string),
    enabled: Boolean(bookId),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });
}

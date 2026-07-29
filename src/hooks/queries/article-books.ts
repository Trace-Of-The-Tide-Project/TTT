import { useQuery } from "@tanstack/react-query";
import { getBooksForArticle } from "@/services/article-books.service";

export const articleBooksKeys = {
  list: (articleId: string) => ["article-books", articleId] as const,
};

export function useArticleBooks(articleId: string | null | undefined) {
  return useQuery({
    queryKey: articleBooksKeys.list(articleId ?? ""),
    queryFn: () => getBooksForArticle(articleId as string),
    enabled: Boolean(articleId),
  });
}

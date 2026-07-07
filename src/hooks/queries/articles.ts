import { useQuery } from "@tanstack/react-query";
import {
  getArticleById,
  getArticleBySlug,
  getArticles,
  getCollectionArticles,
  getMyArticles,
  getRelatedArticles,
} from "@/services/articles.service";

export const articlesKeys = {
  all: ["articles"] as const,
  list: (params?: Record<string, string | number | boolean | undefined>) =>
    ["articles", "list", params ?? {}] as const,
  myList: (params?: { status?: string; limit?: number; offset?: number }) =>
    ["articles", "my", params ?? {}] as const,
  byId: (id: string) => ["articles", "byId", id] as const,
  bySlug: (slug: string) => ["articles", "bySlug", slug] as const,
  related: (id: string) => ["articles", "related", id] as const,
  inCollection: (collectionId: string) =>
    ["articles", "collection", collectionId] as const,
};

export function useArticles(
  params?: Record<string, string | number | boolean | undefined>,
  options?: { silent?: boolean },
) {
  return useQuery({
    queryKey: articlesKeys.list(params),
    queryFn: () => getArticles(params),
    meta: options?.silent ? { silent: true } : undefined,
  });
}

export function useArticle(articleId: string | null | undefined) {
  return useQuery({
    queryKey: articlesKeys.byId(articleId ?? ""),
    queryFn: () => getArticleById(articleId as string),
    enabled: Boolean(articleId),
    // Editor populates form state from this query; a background refetch on
    // window focus would wipe unsaved edits.
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });
}

export function useArticleBySlug(slug: string | null | undefined) {
  return useQuery({
    queryKey: articlesKeys.bySlug(slug ?? ""),
    queryFn: () => getArticleBySlug(slug as string),
    enabled: Boolean(slug),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });
}

export function useRelatedArticles(articleId: string | null | undefined) {
  return useQuery({
    queryKey: articlesKeys.related(articleId ?? ""),
    queryFn: () => getRelatedArticles(articleId as string),
    enabled: Boolean(articleId),
  });
}

export function useMyArticles(params?: { status?: string; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: articlesKeys.myList(params),
    queryFn: () => getMyArticles(params),
    meta: { silent: true },
  });
}

export function useCollectionArticles(collectionId: string | null | undefined) {
  return useQuery({
    queryKey: articlesKeys.inCollection(collectionId ?? ""),
    queryFn: () => getCollectionArticles(collectionId as string),
    enabled: Boolean(collectionId),
  });
}

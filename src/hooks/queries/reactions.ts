import { useQuery } from "@tanstack/react-query";
import { getArticleReactions } from "@/services/reactions.service";

export const reactionsKeys = {
  all: ["reactions"] as const,
  article: (articleId: string) => ["reactions", "article", articleId] as const,
};

/**
 * Single-article reaction summary — the article detail page. The feed gets
 * its summaries in bulk from the /follows/feed payload, not from here.
 */
export function useArticleReactions(articleId: string | null | undefined, enabled = true) {
  return useQuery({
    queryKey: reactionsKeys.article(articleId ?? ""),
    queryFn: () => getArticleReactions(articleId as string),
    enabled: Boolean(articleId) && enabled,
    meta: { silent: true },
  });
}

import { useQuery } from "@tanstack/react-query";
import { listArticleComments } from "@/services/comments.service";

export const commentsKeys = {
  all: ["comments"] as const,
  article: (articleId: string) => ["comments", "article", articleId] as const,
};

/** Lazy — pass enabled=false until the comment section is opened, so the
 * feed never fetches comments it doesn't show. */
export function useArticleComments(articleId: string | null | undefined, enabled: boolean) {
  return useQuery({
    queryKey: commentsKeys.article(articleId ?? ""),
    queryFn: () => listArticleComments(articleId as string),
    enabled: Boolean(articleId) && enabled,
  });
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reorderIssueArticles } from "@/services/magazine-issues.service";
import { updateArticle } from "@/services/articles.service";
import { issueArticlesKeys } from "@/hooks/queries/issue-articles";

export function useAssignArticleToIssue(issueId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { articleId: string; magazineId: string | null }) =>
      updateArticle(args.articleId, { issue_id: issueId, magazine_id: args.magazineId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: issueArticlesKeys.list(issueId) }),
  });
}

export function useUnassignArticleFromIssue(issueId: string) {
  const qc = useQueryClient();
  return useMutation({
    // Detach from the issue but keep it in the magazine pool: clear issue_id
    // only. Backend keeps product='magazine' (once magazine, stays magazine),
    // magazine_id is retained so it stays reachable and reassignable.
    mutationFn: (articleId: string) => updateArticle(articleId, { issue_id: null }),
    onSuccess: () => qc.invalidateQueries({ queryKey: issueArticlesKeys.list(issueId) }),
  });
}

export function useReorderIssueArticles(issueId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (articleIds: string[]) => reorderIssueArticles(issueId, articleIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: issueArticlesKeys.list(issueId) }),
  });
}

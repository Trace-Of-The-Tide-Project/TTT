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
    mutationFn: (articleId: string) =>
      updateArticle(articleId, { issue_id: null, magazine_id: null }),
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

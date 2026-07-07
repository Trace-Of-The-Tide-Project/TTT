import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addArticleContributor,
  getArticleContributors,
  removeArticleContributor,
  type ContributorRole,
} from "@/services/article-contributors.service";

export const articleContributorsKeys = {
  list: (articleId: string) => ["article-contributors", articleId] as const,
};

export function useArticleContributors(articleId: string | null | undefined) {
  return useQuery({
    queryKey: articleContributorsKeys.list(articleId ?? ""),
    queryFn: () => getArticleContributors(articleId as string),
    enabled: Boolean(articleId),
  });
}

export function useAddArticleContributor(articleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { user_id: string; role?: ContributorRole | string }) =>
      addArticleContributor(articleId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: articleContributorsKeys.list(articleId) }),
  });
}

export function useRemoveArticleContributor(articleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (contributorId: string) => removeArticleContributor(articleId, contributorId),
    onSuccess: () => qc.invalidateQueries({ queryKey: articleContributorsKeys.list(articleId) }),
  });
}

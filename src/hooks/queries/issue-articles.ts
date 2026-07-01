import { useQuery } from "@tanstack/react-query";
import { getIssueArticles } from "@/services/magazine-issues.service";

export const issueArticlesKeys = {
  list: (issueId: string) => ["issue-articles", issueId] as const,
};

export function useIssueArticles(issueId: string | null | undefined) {
  return useQuery({
    queryKey: issueArticlesKeys.list(issueId ?? ""),
    queryFn: () => getIssueArticles(issueId as string),
    enabled: Boolean(issueId),
  });
}

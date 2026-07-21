import { useQuery } from "@tanstack/react-query";
import { getIssueSections } from "@/services/magazine-issues.service";

export const issueSectionsKeys = {
  list: (issueId: string) => ["issue-sections", issueId] as const,
};

export function useIssueSections(issueId: string | null | undefined) {
  return useQuery({
    queryKey: issueSectionsKeys.list(issueId ?? ""),
    queryFn: () => getIssueSections(issueId as string),
    enabled: Boolean(issueId),
  });
}

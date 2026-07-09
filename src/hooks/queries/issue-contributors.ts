import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addIssueContributor,
  getIssueContributors,
  removeIssueContributor,
  reorderIssueContributors,
} from "@/services/magazine-issues.service";

export const issueContributorsKeys = {
  list: (issueId: string) => ["issue-contributors", issueId] as const,
};

export function useIssueContributors(issueId: string | null | undefined) {
  return useQuery({
    queryKey: issueContributorsKeys.list(issueId ?? ""),
    queryFn: () => getIssueContributors(issueId as string),
    enabled: Boolean(issueId),
  });
}

export function useAddIssueContributor(issueId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { writer_id: string; role?: string }) =>
      addIssueContributor(issueId, input),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: issueContributorsKeys.list(issueId) }),
  });
}

export function useRemoveIssueContributor(issueId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (contributorId: string) =>
      removeIssueContributor(issueId, contributorId),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: issueContributorsKeys.list(issueId) }),
  });
}

export function useReorderIssueContributors(issueId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (contributorIds: string[]) =>
      reorderIssueContributors(issueId, contributorIds),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: issueContributorsKeys.list(issueId) }),
  });
}

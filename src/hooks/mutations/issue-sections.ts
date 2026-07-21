import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createIssueSection,
  removeIssueSection,
  reorderIssueSections,
  updateIssueSection,
  type IssueSectionLayout,
} from "@/services/magazine-issues.service";
import { issueSectionsKeys } from "@/hooks/queries/issue-sections";

export function useCreateIssueSection(issueId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { title: string; slug?: string }) =>
      createIssueSection(issueId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: issueSectionsKeys.list(issueId) }),
  });
}

export function useUpdateIssueSection(issueId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      sectionId: string;
      title?: string;
      is_visible?: boolean;
      layout?: IssueSectionLayout;
    }) => {
      const { sectionId, ...input } = args;
      return updateIssueSection(issueId, sectionId, input);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: issueSectionsKeys.list(issueId) }),
  });
}

export function useRemoveIssueSection(issueId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sectionId: string) => removeIssueSection(issueId, sectionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: issueSectionsKeys.list(issueId) }),
  });
}

export function useReorderIssueSections(issueId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sectionIds: string[]) => reorderIssueSections(issueId, sectionIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: issueSectionsKeys.list(issueId) }),
  });
}

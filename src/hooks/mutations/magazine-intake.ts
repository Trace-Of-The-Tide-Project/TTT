import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  submitIssueProposal,
  updateContributionStatus,
  type IssueProposalInput,
  type ContributionListItem,
} from "@/services/contributions.service";
import { createMagazineIssue } from "@/services/magazine-issues.service";
import { contributionsKeys } from "@/hooks/queries/contributions";
import { magazineIssuesKeys } from "@/hooks/queries/magazine-issues";

/** Public — submit a magazine-issue proposal from the landing page. */
export function useSubmitIssueProposal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: IssueProposalInput) => submitIssueProposal(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: contributionsKeys.all }),
  });
}

/**
 * Admin — approve a proposal: create a published magazine issue from
 * the contribution (so it appears on the public magazine page) and mark
 * the source contribution as published.
 */
export function useApproveIssueProposal() {
  const qc = useQueryClient();
  return useMutation({
    meta: { silent: true },
    mutationFn: async (args: {
      contribution: ContributionListItem;
      kind: string;
    }) => {
      const c = args.contribution;
      await createMagazineIssue({
        title: c.title,
        kind: args.kind,
        status: "published",
        excerpt: c.description ? c.description.slice(0, 200) : null,
        description: c.description ?? null,
      });
      await updateContributionStatus(c.id, "published");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: contributionsKeys.all });
      qc.invalidateQueries({ queryKey: magazineIssuesKeys.all });
    },
  });
}

/** Admin — reject a proposal (archive the contribution; reversible). */
export function useRejectIssueProposal() {
  const qc = useQueryClient();
  return useMutation({
    meta: { silent: true },
    mutationFn: (id: string) => updateContributionStatus(id, "archived"),
    onSuccess: () => qc.invalidateQueries({ queryKey: contributionsKeys.all }),
  });
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createMagazineIssue,
  updateMagazineIssue,
  deleteMagazineIssue,
  type MagazineIssueInput,
} from "@/services/magazine-issues.service";
import { magazineIssuesKeys } from "@/hooks/queries/magazine-issues";
import { translationKeys } from "@/hooks/queries/translations";

export function useCreateMagazineIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: MagazineIssueInput) => createMagazineIssue(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: magazineIssuesKeys.all });
      // A new language version changes its group's translation chips.
      void qc.invalidateQueries({ queryKey: translationKeys.all });
    },
    meta: { silent: true },
  });
}

export function useUpdateMagazineIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: string; payload: Partial<MagazineIssueInput> }) =>
      updateMagazineIssue(args.id, args.payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: magazineIssuesKeys.all }),
    meta: { silent: true },
  });
}

export function useDeleteMagazineIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMagazineIssue(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: magazineIssuesKeys.all }),
    meta: { silent: true },
  });
}

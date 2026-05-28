import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createMagazineIssue,
  updateMagazineIssue,
  deleteMagazineIssue,
  type MagazineIssueInput,
} from "@/services/magazine-issues.service";
import { magazineIssuesKeys } from "@/hooks/queries/magazine-issues";

export function useCreateMagazineIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: MagazineIssueInput) => createMagazineIssue(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: magazineIssuesKeys.all }),
  });
}

export function useUpdateMagazineIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: string; payload: Partial<MagazineIssueInput> }) =>
      updateMagazineIssue(args.id, args.payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: magazineIssuesKeys.all }),
  });
}

export function useDeleteMagazineIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMagazineIssue(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: magazineIssuesKeys.all }),
  });
}

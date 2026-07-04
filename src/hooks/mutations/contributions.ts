import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createContribution,
  deleteContribution,
  updateContribution,
  updateContributionStatus,
  type ContributionStatusValue,
  type ContributionUpdatePayload,
} from "@/services/contributions.service";
import { contributionsKeys } from "@/hooks/queries/contributions";

export function useCreateContribution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => createContribution(formData),
    onSuccess: () => qc.invalidateQueries({ queryKey: contributionsKeys.all }),
  });
}

export function useDeleteContribution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteContribution(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: contributionsKeys.all }),
  });
}

export function useUpdateContribution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ContributionUpdatePayload }) =>
      updateContribution(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: contributionsKeys.all }),
  });
}

export function useUpdateContributionStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ContributionStatusValue }) =>
      updateContributionStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: contributionsKeys.all }),
  });
}

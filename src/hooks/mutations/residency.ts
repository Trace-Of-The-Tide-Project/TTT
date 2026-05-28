import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateResidencyApplicationStatus,
  type ResidencyApplicationStatus,
} from "@/services/residency.service";
import { residencyKeys } from "@/hooks/queries/residency";

export function useUpdateResidencyApplicationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: string; status: ResidencyApplicationStatus }) =>
      updateResidencyApplicationStatus(args.id, args.status),
    onSuccess: () => qc.invalidateQueries({ queryKey: residencyKeys.all }),
  });
}

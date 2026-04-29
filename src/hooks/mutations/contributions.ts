import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createContribution } from "@/services/contributions.service";
import { contributionsKeys } from "@/hooks/queries/contributions";

export function useCreateContribution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => createContribution(formData),
    onSuccess: () => qc.invalidateQueries({ queryKey: contributionsKeys.all }),
  });
}

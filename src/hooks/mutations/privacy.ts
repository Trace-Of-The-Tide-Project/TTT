import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePrivacy, type UpdatePrivacyInput } from "@/services/privacy.service";
import { privacyKeys } from "@/hooks/queries/privacy";

export function useUpdatePrivacy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdatePrivacyInput) => updatePrivacy(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: privacyKeys.detail() }),
  });
}

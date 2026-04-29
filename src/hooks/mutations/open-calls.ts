import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createOpenCall,
  type CreateOpenCallPayload,
} from "@/services/open-calls.service";
import { openCallsKeys } from "@/hooks/queries/open-calls";

export function useCreateOpenCall() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOpenCallPayload) => createOpenCall(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: openCallsKeys.all }),
  });
}

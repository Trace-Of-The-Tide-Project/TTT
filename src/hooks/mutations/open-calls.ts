import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createOpenCall,
  applyToOpenCall,
  type CreateOpenCallPayload,
  type ApplyToOpenCallInput,
} from "@/services/open-calls.service";
import { openCallsKeys } from "@/hooks/queries/open-calls";

export function useCreateOpenCall() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOpenCallPayload) => createOpenCall(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: openCallsKeys.all }),
  });
}

export function useApplyToOpenCall(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ApplyToOpenCallInput) => applyToOpenCall(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: openCallsKeys.byId(id) }),
  });
}

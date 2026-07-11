import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  archivePlan,
  banSubscriber,
  createPlan,
  updatePlan,
  type CreatePlanPayload,
  type UpdatePlanPayload,
} from "@/services/subscription-plans.service";

export const subscriptionPlansKeys = {
  all: ["admin", "subscription-plans"] as const,
};

// Callers wrap mutateAsync in mutationToast, so errors are silent here.

export function useCreatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePlanPayload) => createPlan(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: subscriptionPlansKeys.all }),
    meta: { silent: true },
  });
}

export function useUpdatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: string; payload: UpdatePlanPayload }) =>
      updatePlan(args.id, args.payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: subscriptionPlansKeys.all }),
    meta: { silent: true },
  });
}

export function useArchivePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => archivePlan(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: subscriptionPlansKeys.all }),
    meta: { silent: true },
  });
}

export function useBanSubscriber() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => banSubscriber(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: subscriptionPlansKeys.all }),
    meta: { silent: true },
  });
}

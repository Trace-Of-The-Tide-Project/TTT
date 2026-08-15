import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createGiftCheckout,
  submitInKindGift,
  requestAccess,
  approveGift,
  type CreateGiftPayload,
  type RequestAccessPayload,
} from "@/services/gifting.service";
import { giftingKeys } from "@/hooks/queries/gifting";

// Callers wrap mutateAsync in mutationToast, so errors are silent here.

/** Monetary gift — returns the Stripe Checkout URL to redirect to. */
export function useCreateGiftCheckout() {
  return useMutation({
    mutationFn: (args: { payload: CreateGiftPayload; locale?: string }) =>
      createGiftCheckout(args.payload, args.locale),
    meta: { silent: true },
  });
}

export function useSubmitInKindGift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateGiftPayload) => submitInKindGift(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: giftingKeys.all }),
    meta: { silent: true },
  });
}

export function useRequestAccess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: RequestAccessPayload) => requestAccess(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: giftingKeys.all }),
    meta: { silent: true },
  });
}

export function useApproveGift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: string; expires_at?: string }) =>
      approveGift(args.id, { expires_at: args.expires_at }),
    onSuccess: () => qc.invalidateQueries({ queryKey: giftingKeys.all }),
    meta: { silent: true },
  });
}

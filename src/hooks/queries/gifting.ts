import { useQuery } from "@tanstack/react-query";
import { getMyGifts, listPendingGifts } from "@/services/gifting.service";

export const giftingKeys = {
  all: ["gifting"] as const,
  mine: () => ["gifting", "mine"] as const,
  pending: (status?: string) => ["gifting", "pending", status] as const,
};

export function useMyGifts(enabled = true) {
  return useQuery({
    queryKey: giftingKeys.mine(),
    queryFn: getMyGifts,
    enabled,
    refetchOnWindowFocus: false,
  });
}

export function usePendingGifts(status = "pending", enabled = true) {
  return useQuery({
    queryKey: giftingKeys.pending(status),
    queryFn: () => listPendingGifts(status),
    enabled,
    refetchOnWindowFocus: false,
  });
}

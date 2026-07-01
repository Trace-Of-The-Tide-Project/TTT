import { useMutation, useQueryClient } from "@tanstack/react-query";
import { shipPrintOrder } from "@/services/print-orders.service";
import { printOrdersKeys } from "@/hooks/queries/print-orders";

export function useShipPrintOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: string; trackingNumber?: string }) =>
      shipPrintOrder(args.id, args.trackingNumber),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["print-orders"] }),
  });
}

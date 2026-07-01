import { useQuery } from "@tanstack/react-query";
import { getPrintOrders, type PrintOrderStatus } from "@/services/print-orders.service";

export const printOrdersKeys = {
  list: (params?: { page?: number; limit?: number; status?: PrintOrderStatus }) =>
    ["print-orders", params ?? {}] as const,
};

export function usePrintOrders(params?: { page?: number; limit?: number; status?: PrintOrderStatus }) {
  return useQuery({
    queryKey: printOrdersKeys.list(params),
    queryFn: () => getPrintOrders(params),
    placeholderData: (prev) => prev,
  });
}

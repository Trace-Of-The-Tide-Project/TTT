import { useQuery } from "@tanstack/react-query";
import { getCart, getLibrary } from "@/services/commerce.service";

export const commerceKeys = {
  all: ["commerce"] as const,
  cart: () => ["commerce", "cart"] as const,
  library: () => ["commerce", "library"] as const,
};

export function useCart(enabled = true) {
  return useQuery({
    queryKey: commerceKeys.cart(),
    queryFn: getCart,
    enabled,
    refetchOnWindowFocus: false,
  });
}

export function useLibrary(enabled = true) {
  return useQuery({
    queryKey: commerceKeys.library(),
    queryFn: getLibrary,
    enabled,
    refetchOnWindowFocus: false,
  });
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addToCart,
  addIssueToCart,
  removeFromCart,
  removeIssueFromCart,
  clearCart,
  createCheckout,
} from "@/services/commerce.service";
import { commerceKeys } from "@/hooks/queries/commerce";
import { booksKeys } from "@/hooks/queries/books";

export function useAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bookId: string) => addToCart(bookId),
    onSuccess: (cart) => {
      qc.setQueryData(commerceKeys.cart(), cart);
      qc.invalidateQueries({ queryKey: commerceKeys.cart() });
    },
  });
}

export function useAddIssueToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (issueId: string) => addIssueToCart(issueId),
    onSuccess: (cart) => {
      qc.setQueryData(commerceKeys.cart(), cart);
      qc.invalidateQueries({ queryKey: commerceKeys.cart() });
    },
  });
}

export function useRemoveFromCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bookId: string) => removeFromCart(bookId),
    onSuccess: (cart) => {
      qc.setQueryData(commerceKeys.cart(), cart);
    },
  });
}

export function useRemoveIssueFromCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (issueId: string) => removeIssueFromCart(issueId),
    onSuccess: (cart) => {
      qc.setQueryData(commerceKeys.cart(), cart);
    },
  });
}

export function useClearCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => clearCart(),
    onSuccess: (cart) => {
      qc.setQueryData(commerceKeys.cart(), cart);
    },
  });
}

/** Create a Stripe Checkout Session and return the redirect URL. */
export function useCreateCheckout() {
  return useMutation({
    mutationFn: (locale?: string) => createCheckout(locale),
  });
}

/** Invalidate cart + library after a purchase is confirmed. */
export function useInvalidatePurchases() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: commerceKeys.cart() });
    qc.invalidateQueries({ queryKey: commerceKeys.library() });
    qc.invalidateQueries({ queryKey: booksKeys.all });
  };
}

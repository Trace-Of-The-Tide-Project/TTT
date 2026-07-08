"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCart } from "@/hooks/queries/commerce";
import {
  useRemoveFromCart,
  useRemoveIssueFromCart,
  useCreateCheckout,
} from "@/hooks/mutations/commerce";
import { formatApiError } from "@/lib/api/error-message";

function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function CartContent() {
  const t = useTranslations("Home.Commerce");
  const locale = useLocale();
  const router = useRouter();
  const { status } = useAuth();

  const authed = status === "authenticated";
  const { data: cart, isLoading } = useCart(authed);
  const removeItem = useRemoveFromCart();
  const removeIssue = useRemoveIssueFromCart();
  const checkout = useCreateCheckout();

  // Cart requires auth — bounce guests to login.
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent("/books/cart")}`);
    }
  }, [status, router]);

  const items = cart?.items ?? [];
  const subtotal = cart?.meta.subtotal ?? 0;
  const currency = cart?.meta.currency ?? "USD";

  async function handleCheckout() {
    try {
      const url = await checkout.mutateAsync(locale);
      window.location.assign(url);
    } catch (e) {
      toast.error(formatApiError(e, t("checkoutError")));
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold text-[var(--tott-home-text-strong)]">
        {t("cartTitle")}
      </h1>

      {isLoading ? (
        <p className="text-[var(--tott-home-text-muted)]">…</p>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-[var(--tott-card-border)] p-8 text-center">
          <p className="mb-4 text-[var(--tott-home-text-muted)]">
            {t("cartEmpty")}
          </p>
          <Link
            href="/books"
            className="text-[var(--tott-dash-gold-label)] hover:underline"
          >
            {t("browseBooks")}
          </Link>
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {items.map((item) => (
              <li
                key={item.book_id ?? item.issue_id}
                className="flex items-center gap-4 rounded-lg border border-[var(--tott-card-border)] p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-[var(--tott-home-text-strong)]">
                    {item.title}
                  </p>
                  {item.author ? (
                    <p className="truncate text-sm text-[var(--tott-home-text-muted)]">
                      {item.author}
                    </p>
                  ) : null}
                </div>
                <span className="text-[var(--tott-dash-gold-label)]">
                  {formatMoney(item.price, item.currency)}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    item.issue_id
                      ? removeIssue.mutate(item.issue_id)
                      : removeItem.mutate(item.book_id!)
                  }
                  disabled={removeItem.isPending}
                  className="text-sm text-[var(--tott-home-text-muted)] hover:underline disabled:opacity-50"
                >
                  {t("remove")}
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center justify-between border-t border-[var(--tott-card-border)] pt-4">
            <span className="text-[var(--tott-home-text-muted)]">
              {t("subtotal")}
            </span>
            <span className="text-lg font-semibold text-[var(--tott-home-text-strong)]">
              {formatMoney(subtotal, currency)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCheckout}
            disabled={checkout.isPending}
            className="mt-6 w-full rounded-lg py-3 font-medium transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{
              backgroundColor: "var(--tott-magazine-btn-bg)",
              boxShadow: "inset 0px 1px 0px rgba(255, 255, 255, 0.4)",
              color: "var(--tott-auth-btn-text)",
            }}
          >
            {t("checkout")}
          </button>
          <div className="mt-4 text-center">
            <Link
              href="/books"
              className="text-sm text-[var(--tott-home-text-muted)] hover:underline"
            >
              {t("continueShopping")}
            </Link>
          </div>
        </>
      )}
    </main>
  );
}

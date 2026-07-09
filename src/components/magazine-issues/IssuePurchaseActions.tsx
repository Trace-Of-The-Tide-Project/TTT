"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  useAddIssueToCart,
  useCreateCheckout,
} from "@/hooks/mutations/commerce";
import { getIssueDownloadUrl } from "@/services/magazine-issues.service";
import { formatApiError } from "@/lib/api/error-message";

const BTN =
  "inline-flex h-10 items-center justify-center rounded-lg px-5 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-60";
const GOLD: React.CSSProperties = {
  backgroundColor: "var(--tott-magazine-btn-bg)",
  color: "var(--tott-auth-btn-text)",
};
const SUBTLE: React.CSSProperties = {
  backgroundColor: "var(--tott-card-border)",
  color: "var(--tott-home-text-strong)",
};

function priceText(price: number | null, currency: string): string {
  if (price == null) return "";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "USD",
    }).format(price);
  } catch {
    return currency + " " + price.toFixed(2);
  }
}

/**
 * Buy / download actions for a magazine issue. Mirrors the book flow:
 *  - free or owned -> "Download PDF" (fresh signed URL)
 *  - paid, not owned -> "Buy now" (straight to Stripe) + "Add to cart"
 * Ownership comes from the SSR payload; the backend rejects a duplicate buy
 * with a clear message if the SSR pass missed the caller's cookie.
 */
export function IssuePurchaseActions({
  issueId,
  slug,
  price,
  currency,
  isFree,
  isOwned,
}: {
  issueId: string;
  slug: string | null;
  price: number | null;
  currency: string;
  isFree: boolean;
  isOwned: boolean;
}) {
  const t = useTranslations("MagazineIssueDetail");
  const tCommerce = useTranslations("Home.Commerce");
  const locale = useLocale();
  const router = useRouter();
  const { user, status } = useAuth();

  const addToCart = useAddIssueToCart();
  const checkout = useCreateCheckout();
  const [busy, setBusy] = useState(false);

  const backTo = "/magazine-issues/" + (slug ?? issueId);

  function requireLogin(): boolean {
    if (status === "authenticated" && user) return true;
    router.push("/auth/login?callbackUrl=" + encodeURIComponent(backTo));
    return false;
  }

  async function handleDownload() {
    if (!requireLogin()) return;
    setBusy(true);
    try {
      const url = await getIssueDownloadUrl(issueId);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      toast.error(formatApiError(e, tCommerce("downloadError")));
    } finally {
      setBusy(false);
    }
  }

  async function handleAddToCart() {
    if (!requireLogin()) return;
    try {
      await addToCart.mutateAsync(issueId);
      toast.success(t("addedToCart"));
    } catch (e) {
      toast.error(formatApiError(e, tCommerce("checkoutError")));
    }
  }

  async function handleBuyNow() {
    if (!requireLogin()) return;
    try {
      await addToCart.mutateAsync(issueId).catch(() => undefined);
      const url = await checkout.mutateAsync(locale);
      window.location.assign(url);
    } catch (e) {
      toast.error(formatApiError(e, tCommerce("checkoutError")));
    }
  }

  if (isFree || isOwned) {
    return (
      <button
        type="button"
        onClick={handleDownload}
        disabled={busy}
        className={BTN}
        style={GOLD}
      >
        {t("downloadPdf")}
      </button>
    );
  }

  const pending = addToCart.isPending || checkout.isPending;
  const label = priceText(price, currency);

  return (
    <>
      <button
        type="button"
        onClick={handleBuyNow}
        disabled={pending}
        className={BTN}
        style={GOLD}
      >
        {label ? t("buyNow") + " · " + label : t("buyNow")}
      </button>
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={pending}
        className={BTN}
        style={SUBTLE}
      >
        {t("addToCart")}
      </button>
    </>
  );
}

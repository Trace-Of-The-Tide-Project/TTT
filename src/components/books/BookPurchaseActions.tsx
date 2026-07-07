"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAddToCart, useCreateCheckout } from "@/hooks/mutations/commerce";
import { checkOwnership, createPrintCheckout } from "@/services/commerce.service";
import { getBookDownloadUrl } from "@/services/books.service";
import { formatApiError } from "@/lib/api/error-message";
import { DownloadIcon } from "@/components/ui/icons";

const BUY_ICON = "/images/books/buy-icon.svg";

/** Shared 360×40 gold "Button" style from the Figma book-detail spec. */
const GOLD_BUTTON_STYLE: React.CSSProperties = {
  height: "40px",
  padding: "8px",
  gap: "8px",
  borderRadius: "8px",
  backgroundColor: "var(--tott-magazine-btn-bg)",
  boxShadow: "inset 0px 1px 0px rgba(255, 255, 255, 0.4)",
  color: "var(--tott-auth-btn-text)",
  fontFamily: "'Inter', var(--font-sans, sans-serif)",
  fontWeight: 500,
  fontSize: "14px",
  lineHeight: "20px",
  letterSpacing: "-0.005em",
  border: "none",
};

function formatPrice(price: number | null, currency: string): string {
  if (price == null) return "";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "USD",
    }).format(price);
  } catch {
    return `${currency} ${price.toFixed(2)}`;
  }
}

/**
 * The primary action under the book cover. Behaviour by state:
 *  - free or owned → "Read / Download" (opens a fresh signed URL)
 *  - paid, not owned, logged in → "Add to cart" (+ price), then a quick
 *    "Buy now" that goes straight to Stripe Checkout
 *  - paid, not owned, logged out → prompts login
 */
export function BookActionButtons({
  bookId,
  price,
  currency,
  isFree,
  isOwnedInitial,
  printEnabled,
  printPrice,
}: {
  bookId: string;
  price: number | null;
  currency: string;
  isFree: boolean;
  isOwnedInitial: boolean;
  printEnabled?: boolean;
  printPrice?: number | null;
}) {
  const t = useTranslations("Home.bookDetail");
  const tCommerce = useTranslations("Home.Commerce");
  const locale = useLocale();
  const router = useRouter();
  const { user, status } = useAuth();

  const [owned, setOwned] = useState(isOwnedInitial);
  const addToCart = useAddToCart();
  const checkout = useCreateCheckout();
  const [printBusy, setPrintBusy] = useState(false);

  function requireLoginForPrint(): boolean {
    if (status === "authenticated" && user) return true;
    const next = encodeURIComponent(`/books/${bookId}`);
    router.push(`/auth/login?callbackUrl=${next}`);
    return false;
  }

  async function handleBuyPrint() {
    if (!requireLoginForPrint()) return;
    setPrintBusy(true);
    try {
      const url = await createPrintCheckout(bookId, locale);
      window.location.assign(url);
    } catch (e) {
      toast.error(formatApiError(e, tCommerce("checkoutError")));
      setPrintBusy(false);
    }
  }

  const printButton =
    printEnabled && printPrice != null ? (
      <button
        type="button"
        onClick={handleBuyPrint}
        disabled={printBusy}
        className="inline-flex w-full items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-60 min-[1600px]:h-14! min-[1600px]:text-base!"
        style={{
          height: "40px",
          padding: "8px",
          gap: "8px",
          borderRadius: "8px",
          backgroundColor: "var(--tott-card-border)",
          boxShadow: "inset 0px 1px 1px rgba(255, 255, 255, 0.08)",
          color: "var(--tott-home-text-strong)",
          fontFamily: "'Inter', var(--font-sans, sans-serif)",
          fontWeight: 400,
          fontSize: "14px",
          lineHeight: "20px",
          letterSpacing: "-0.005em",
          border: "none",
        }}
      >
        {t("buyPrint")} · {formatPrice(printPrice, currency)}
      </button>
    ) : null;

  // Re-confirm ownership client-side for paid books once auth resolves — the
  // SSR pass may not have carried the user's cookie reliably.
  useEffect(() => {
    let active = true;
    if (isFree || owned) return;
    if (status !== "authenticated" || !user) return;
    checkOwnership(bookId).then((o) => {
      if (active && o) setOwned(true);
    });
    return () => {
      active = false;
    };
  }, [bookId, isFree, owned, status, user]);

  function requireLogin(): boolean {
    if (status === "authenticated" && user) return true;
    const next = encodeURIComponent(`/books/${bookId}`);
    router.push(`/auth/login?callbackUrl=${next}`);
    return false;
  }

  // ── Owned or free: read/download ──
  if (isFree || owned) {
    return (
      <div className="flex w-full flex-col" style={{ gap: "12px" }}>
        <DownloadButton bookId={bookId} label={t("readDownload")} />
        {printButton}
      </div>
    );
  }

  // ── Paid, not owned ──
  async function handleAddToCart() {
    if (!requireLogin()) return;
    try {
      await addToCart.mutateAsync(bookId);
      toast.success(t("addedToCart"));
    } catch (e) {
      toast.error(formatApiError(e, tCommerce("checkoutError")));
    }
  }

  async function handleBuyNow() {
    if (!requireLogin()) return;
    try {
      // Ensure it's in the cart, then check out the whole cart.
      await addToCart.mutateAsync(bookId).catch(() => undefined);
      const url = await checkout.mutateAsync(locale);
      // Breadcrumb so the success page knows which book to confirm.
      window.sessionStorage.setItem("tott:lastCheckoutBookId", bookId);
      window.location.assign(url);
    } catch (e) {
      toast.error(formatApiError(e, tCommerce("checkoutError")));
    }
  }

  const busy = addToCart.isPending || checkout.isPending;
  const priceLabel = formatPrice(price, currency);

  return (
    <div className="flex w-full flex-col" style={{ gap: "12px" }}>
      <button
        type="button"
        onClick={handleBuyNow}
        disabled={busy}
        className="inline-flex w-full items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-60 min-[1600px]:h-14! min-[1600px]:text-base!"
        style={GOLD_BUTTON_STYLE}
      >
        <span aria-hidden className="relative h-6" style={{ width: "28px" }}>
          <Image
            src={BUY_ICON}
            alt=""
            fill
            sizes="28px"
            className="select-none"
            draggable={false}
          />
        </span>
        {priceLabel ? `${t("buyNow")} · ${priceLabel}` : t("buyNow")}
      </button>
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={busy}
        className="inline-flex w-full items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-60 min-[1600px]:h-14! min-[1600px]:text-base!"
        style={{
          height: "40px",
          padding: "8px",
          gap: "8px",
          borderRadius: "8px",
          backgroundColor: "var(--tott-card-border)",
          boxShadow: "inset 0px 1px 1px rgba(255, 255, 255, 0.08)",
          color: "var(--tott-home-text-strong)",
          fontFamily: "'Inter', var(--font-sans, sans-serif)",
          fontWeight: 400,
          fontSize: "14px",
          lineHeight: "20px",
          letterSpacing: "-0.005em",
          border: "none",
        }}
      >
        {t("addToCart")}
      </button>
      {printButton}
    </div>
  );
}

/** Gold "Read / Download" button that fetches a fresh short-lived signed URL. */
function DownloadButton({ bookId, label }: { bookId: string; label: string }) {
  const t = useTranslations("Home.Commerce");
  const router = useRouter();
  const { user, status } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    // The download endpoint requires a session even for free books; redirect
    // guests up front instead of letting the 401 interceptor do it mid-flight.
    if (status !== "authenticated" || !user) {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(`/books/${bookId}`)}`);
      return;
    }
    setLoading(true);
    try {
      const url = await getBookDownloadUrl(bookId);
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        toast.error(t("downloadError"));
      }
    } catch (e) {
      toast.error(formatApiError(e, t("downloadError")));
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      className="inline-flex w-full items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-60 min-[1600px]:h-14! min-[1600px]:text-base!"
      style={GOLD_BUTTON_STYLE}
    >
      <span aria-hidden className="[&>svg]:h-5 [&>svg]:w-5">
        <DownloadIcon />
      </span>
      {label}
    </button>
  );
}

/**
 * Inline "Download PDF" link used in the metadata list. Only rendered for
 * free/owned books; fetches a fresh signed URL on click.
 */
export function BookDownloadLink({
  bookId,
  label,
}: {
  bookId: string;
  label: string;
}) {
  const t = useTranslations("Home.Commerce");
  const router = useRouter();
  const { user, status } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (status !== "authenticated" || !user) {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(`/books/${bookId}`)}`);
      return;
    }
    setLoading(true);
    try {
      const url = await getBookDownloadUrl(bookId);
      if (url) window.open(url, "_blank", "noopener,noreferrer");
      else toast.error(t("downloadError"));
    } catch (e) {
      toast.error(formatApiError(e, t("downloadError")));
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center transition-opacity hover:opacity-90 disabled:opacity-60"
      style={{
        gap: "6px",
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
        color: "var(--tott-dash-gold-label)",
        fontFamily: "'Inter', var(--font-sans, sans-serif)",
        fontWeight: 500,
        fontSize: "12px",
        lineHeight: "16px",
      }}
    >
      <span aria-hidden className="[&>svg]:h-4 [&>svg]:w-4">
        <DownloadIcon />
      </span>
      {label}
    </button>
  );
}

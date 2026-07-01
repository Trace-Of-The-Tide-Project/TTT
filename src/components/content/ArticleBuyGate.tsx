"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { createArticleCheckout } from "@/services/commerce.service";

/** Gate for access_level = 'paid' articles: blurred content + a buy CTA that
 *  redirects to a single-item Stripe Checkout session. */
export default function ArticleBuyGate({
  articleId,
  price,
  currency,
  children,
}: {
  articleId: string;
  price?: number | null;
  currency?: string | null;
  children: React.ReactNode;
}) {
  const t = useTranslations("Content.buyGate");
  const locale = useLocale();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleBuy() {
    setBusy(true);
    setError(null);
    try {
      const url = await createArticleCheckout(articleId, locale);
      window.location.assign(url);
    } catch {
      setError(t("error"));
      setBusy(false);
    }
  }

  const priceLabel =
    price != null ? `${currency ?? "USD"} ${Number(price).toFixed(2)}` : null;

  return (
    <div className="relative">
      <div className="blur-sm pointer-events-none select-none" aria-hidden>
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl bg-[color-mix(in_srgb,var(--tott-home-surface)_80%,transparent)]">
        <p className="font-semibold text-foreground">{t("heading")}</p>
        <p className="px-4 text-center text-sm text-[var(--tott-home-text-muted)]">
          {priceLabel ? t("bodyWithPrice", { price: priceLabel }) : t("body")}
        </p>
        {error ? <p className="text-xs text-red-400">{error}</p> : null}
        <button
          type="button"
          onClick={handleBuy}
          disabled={busy}
          className="rounded-lg bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/80 disabled:opacity-50"
        >
          {busy ? t("redirecting") : t("buy")}
        </button>
      </div>
    </div>
  );
}

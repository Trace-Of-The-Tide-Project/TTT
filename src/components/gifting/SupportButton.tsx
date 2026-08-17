"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChamferedSurface } from "@/components/ui/ChamferedSurface";
import { mutationToast } from "@/hooks/useMutationToast";
import { useCreateGiftCheckout } from "@/hooks/mutations/gifting";

const TAB_CLIP =
  "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)";
const DEFAULT_AMOUNT = 10;
const SLIDER_MAX = 200;

function currencyLabel(locale: string, amount: number): string {
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  });
  return formatter.format(amount);
}

/**
 * FR-OPN-05: voluntary "support this article" gift for commons content
 * (opinion pieces — always free, never gated). Unlike GiftWindowPanel this
 * has no countdown/goal — it's a plain amount + button, same checkout flow.
 */
export function SupportButton({ scopeId }: { scopeId: string }) {
  const t = useTranslations("Content.opinion");
  const locale = useLocale();
  const [amount, setAmount] = useState(DEFAULT_AMOUNT);
  const [busy, setBusy] = useState(false);
  const createGiftCheckout = useCreateGiftCheckout();

  async function handleGift() {
    if (!amount || amount <= 0) return;
    setBusy(true);
    try {
      const url = await mutationToast(
        () =>
          createGiftCheckout.mutateAsync({
            payload: { scope_type: "contribution", scope_id: scopeId, amount },
            locale,
          }),
        { loading: t("supportRedirecting"), success: t("supportRedirecting"), error: t("supportError") },
      );
      window.location.assign(url);
    } catch {
      setBusy(false);
    }
  }

  return (
    <ChamferedSurface
      chamfer={20}
      borderColor="var(--tott-accent-gold)"
      innerFill="var(--tott-elevated)"
      className="mx-auto w-full max-w-sm p-5"
    >
      <p
        className="text-center text-[11px] font-semibold tracking-wide uppercase"
        style={{ color: "var(--tott-accent-gold)" }}
      >
        {t("supportHeading")}
      </p>
      <p className="mt-1 text-center text-xs text-[var(--tott-home-text-muted)]">{t("supportBody")}</p>
      <div className="mt-4 flex flex-col items-center gap-2">
        <p
          className="font-display text-2xl font-semibold [font-variant-numeric:tabular-nums]"
          style={{ color: "var(--tott-accent-gold)" }}
        >
          {currencyLabel(locale, amount)}
        </p>
        <input
          type="range"
          min={1}
          max={SLIDER_MAX}
          step={1}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          aria-label={t("supportAmountLabel")}
          className="w-full"
          style={{ accentColor: "var(--tott-accent-gold)" }}
        />
        <button
          type="button"
          onClick={handleGift}
          disabled={busy || !amount || amount <= 0}
          className="mt-2 w-full px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50"
          style={{ clipPath: TAB_CLIP, backgroundColor: "var(--tott-accent-gold)", color: "#000" }}
        >
          {busy ? t("supportRedirecting") : t("supportCta")}
        </button>
      </div>
    </ChamferedSurface>
  );
}

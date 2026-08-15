"use client";

import { useLocale, useTranslations } from "next-intl";
import { ChamferedPanel } from "@/components/ui/ChamferedPanel";

function formatCurrency(locale: string, currency: string, amount: number): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Gift-pool progress bar: raised_total / value_initial. Fills from the
 * logical start edge so it mirrors correctly under RTL. Tokens only — no
 * hardcoded hex.
 */
export function GiftProgress({
  raisedTotal,
  valueInitial,
  currency,
}: {
  raisedTotal: number;
  valueInitial: number;
  currency: string;
}) {
  const t = useTranslations("Content.giftGate");
  const locale = useLocale();
  const pct = valueInitial > 0 ? Math.min(100, Math.round((raisedTotal / valueInitial) * 100)) : 0;
  const raisedLabel = formatCurrency(locale, currency, raisedTotal);
  const goalLabel = formatCurrency(locale, currency, valueInitial);

  return (
    <ChamferedPanel className="w-full max-w-xs" size={12}>
      <div className="px-3 py-2">
        <div
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-2 w-full overflow-hidden rounded-full"
          style={{ backgroundColor: "var(--tott-well-bg)" }}
        >
          <div
            className="h-full rounded-full transition-[width]"
            style={{
              width: `${pct}%`,
              backgroundColor: "var(--tott-accent-gold)",
              transitionDuration: "var(--tott-motion-duration-page, 400ms)",
            }}
          />
        </div>
        <p className="mt-1.5 text-center text-xs text-[var(--tott-home-text-muted)]">
          {t("giftProgress", { raised: raisedLabel, goal: goalLabel })}
        </p>
      </div>
    </ChamferedPanel>
  );
}

"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChamferedSurface } from "@/components/ui/ChamferedSurface";
import { useCountdown } from "@/hooks/useCountdown";
import { mutationToast } from "@/hooks/useMutationToast";
import {
  useCreateGiftCheckout,
  useSubmitInKindGift,
  useRequestAccess,
} from "@/hooks/mutations/gifting";
import type { GiftScopeType } from "@/services/gifting.service";

type Mode = "gift" | "in_kind" | "request";

const DEFAULT_SLIDER_MAX = 500;
const TAB_CLIP = "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)";

function currencyLabel(locale: string, currency: string, amount: number): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Unified gift-window panel: countdown, progress bar, and the Gift/Offer/
 * Request switcher, all inside one chamfered surface. Replaces the previous
 * separate CommonsCountdown + GiftProgress + GiftGate stack for the
 * GIFT_WINDOW_ACTIVE state specifically.
 */
export function GiftWindowPanel({
  scopeType,
  scopeId,
  commonsAt,
  giftValueInitial,
  giftRaisedTotal,
  giftCurrency,
}: {
  scopeType: GiftScopeType;
  scopeId: string;
  commonsAt: string;
  giftValueInitial?: number | null;
  giftRaisedTotal?: number | null;
  giftCurrency?: string | null;
}) {
  const t = useTranslations("Content.giftGate");
  const locale = useLocale();
  const time = useCountdown(commonsAt);

  const currency = giftCurrency ?? "GBP";
  const raised = giftRaisedTotal ?? 0;
  const goal = giftValueInitial ?? null;
  const pct = goal && goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
  const sliderMax = goal && goal > 0 ? goal : DEFAULT_SLIDER_MAX;

  const [mode, setMode] = useState<Mode>("gift");
  const [amount, setAmount] = useState<number>(
    goal != null ? Math.min(Math.max(1, Math.round(goal)), sliderMax) : Math.round(sliderMax / 2),
  );
  const [inKindText, setInKindText] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<"in_kind" | "request" | null>(null);

  const createGiftCheckout = useCreateGiftCheckout();
  const submitInKind = useSubmitInKindGift();
  const requestAccessMutation = useRequestAccess();

  async function handleGift() {
    if (!amount || amount <= 0) return;
    setBusy(true);
    try {
      const url = await mutationToast(
        () =>
          createGiftCheckout.mutateAsync({
            payload: { scope_type: scopeType, scope_id: scopeId, amount },
            locale,
          }),
        { loading: t("redirecting"), success: t("redirecting"), error: t("error") },
      );
      window.location.assign(url);
    } catch {
      setBusy(false);
    }
  }

  async function handleInKind() {
    if (!inKindText.trim()) return;
    setBusy(true);
    try {
      await mutationToast(
        () =>
          submitInKind.mutateAsync({
            scope_type: scopeType,
            scope_id: scopeId,
            in_kind_description: inKindText.trim(),
          }),
        { loading: t("submitting"), success: t("inKindSubmitted"), error: t("error") },
      );
      setDone("in_kind");
    } finally {
      setBusy(false);
    }
  }

  async function handleRequestAccess() {
    setBusy(true);
    try {
      await mutationToast(
        () =>
          requestAccessMutation.mutateAsync({
            resource_id: scopeId,
            resource_type: scopeType === "platform" ? "contribution" : scopeType,
            note: note.trim() || undefined,
          }),
        { loading: t("submitting"), success: t("requestSubmitted"), error: t("error") },
      );
      setDone("request");
    } finally {
      setBusy(false);
    }
  }

  const tabs: { key: Mode; label: string }[] = [
    { key: "gift", label: t("tabGift") },
    { key: "in_kind", label: t("tabInKind") },
    { key: "request", label: t("tabRequest") },
  ];

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
        {t("giftWindowLabel")}
      </p>

      {!time.done ? (
        <time
          dateTime={commonsAt}
          className="mt-1 block text-center font-display text-lg text-foreground [font-variant-numeric:tabular-nums]"
        >
          {t("giftWindowCountdown", { days: time.days, hours: time.hours, minutes: time.minutes })}
        </time>
      ) : null}

      {goal != null ? (
        <>
          <div
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            className="mt-3 h-1.5 w-full overflow-hidden rounded-full"
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
            {t("giftWindowProgress", {
              raised: currencyLabel(locale, currency, raised),
              goal: currencyLabel(locale, currency, goal),
            })}
          </p>
        </>
      ) : null}

      {done ? (
        <p className="mt-4 text-center text-sm text-[var(--tott-status-emerald)]">
          {done === "in_kind" ? t("inKindSubmitted") : t("requestSubmitted")}
        </p>
      ) : (
        <>
          <div className="mt-4 flex gap-1.5">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setMode(tab.key)}
                className="flex-1 px-2 py-1.5 text-xs font-medium transition-colors"
                style={{
                  clipPath: TAB_CLIP,
                  backgroundColor: mode === tab.key ? "var(--tott-accent-gold)" : "transparent",
                  color: mode === tab.key ? "#000" : "var(--tott-home-text-muted)",
                  border: mode === tab.key ? "none" : "1px solid var(--tott-card-border)",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {mode === "gift" ? (
            <div className="mt-4 flex flex-col items-center gap-2">
              <p
                className="font-display text-2xl font-semibold [font-variant-numeric:tabular-nums]"
                style={{ color: "var(--tott-accent-gold)" }}
              >
                {currencyLabel(locale, currency, amount)}
              </p>
              <input
                type="range"
                min={1}
                max={sliderMax}
                step={1}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                aria-label={t("giftAmountSliderLabel")}
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
                {busy ? t("redirecting") : t("giveGift")}
              </button>
            </div>
          ) : mode === "in_kind" ? (
            <div className="mt-4 flex flex-col gap-2">
              <textarea
                value={inKindText}
                onChange={(e) => setInKindText(e.target.value)}
                placeholder={t("inKindPlaceholder")}
                rows={2}
                className="w-full rounded-md border border-[var(--tott-border)] bg-transparent px-2 py-1 text-sm"
              />
              <button
                type="button"
                onClick={handleInKind}
                disabled={busy || !inKindText.trim()}
                className="w-full px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50"
                style={{ clipPath: TAB_CLIP, backgroundColor: "var(--tott-accent-gold)", color: "#000" }}
              >
                {t("offer")}
              </button>
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-2">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t("requestNotePlaceholder")}
                rows={2}
                className="w-full rounded-md border border-[var(--tott-border)] bg-transparent px-2 py-1 text-sm"
              />
              <button
                type="button"
                onClick={handleRequestAccess}
                disabled={busy}
                className="w-full px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50"
                style={{ clipPath: TAB_CLIP, backgroundColor: "var(--tott-accent-gold)", color: "#000" }}
              >
                {t("requestAccess")}
              </button>
            </div>
          )}
        </>
      )}
    </ChamferedSurface>
  );
}

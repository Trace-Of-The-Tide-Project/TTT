"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { mutationToast } from "@/hooks/useMutationToast";
import { useCreateGiftCheckout, useSubmitInKindGift, useRequestAccess } from "@/hooks/mutations/gifting";
import type { GiftScopeType } from "@/services/gifting.service";

type Mode = "gift" | "in_kind" | "request";

/**
 * Gate for gift-model content (§1.4 — "السعر هدية لا ثمن"): the piece is not
 * sold at a fixed price, it is gifted. Three actions instead of one buy
 * button: an open-amount gift, offering something else (in-kind, pending
 * editor review), or requesting access outright (never refused).
 */
export default function GiftGate({
  scopeType,
  scopeId,
  suggestedAmount,
  currency,
  children,
}: {
  scopeType: GiftScopeType;
  scopeId: string;
  suggestedAmount?: number | null;
  currency?: string | null;
  children: React.ReactNode;
}) {
  const t = useTranslations("Content.giftGate");
  const locale = useLocale();
  const [mode, setMode] = useState<Mode>("gift");
  const [amount, setAmount] = useState<string>(
    suggestedAmount != null ? String(suggestedAmount) : "",
  );
  const [inKindText, setInKindText] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<"in_kind" | "request" | null>(null);

  const createGiftCheckout = useCreateGiftCheckout();
  const submitInKind = useSubmitInKindGift();
  const requestAccessMutation = useRequestAccess();

  async function handleGift() {
    const parsed = Number(amount);
    if (!parsed || parsed <= 0) return;
    setBusy(true);
    try {
      const url = await mutationToast(
        () =>
          createGiftCheckout.mutateAsync({
            payload: { scope_type: scopeType, scope_id: scopeId, amount: parsed },
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

  const priceLabel =
    suggestedAmount != null
      ? `${currency ?? "GBP"} ${Number(suggestedAmount).toFixed(2)}`
      : null;

  return (
    <div className="relative">
      <div className="blur-sm pointer-events-none select-none" aria-hidden>
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl bg-[color-mix(in_srgb,var(--tott-home-surface)_85%,transparent)] p-4">
        <p className="font-semibold text-foreground">{t("heading")}</p>
        <p className="max-w-sm px-4 text-center text-sm text-[var(--tott-home-text-muted)]">
          {priceLabel ? t("bodyWithSuggested", { price: priceLabel }) : t("body")}
        </p>

        {done ? (
          <p className="text-center text-sm text-[var(--tott-status-emerald)]">
            {done === "in_kind" ? t("inKindSubmitted") : t("requestSubmitted")}
          </p>
        ) : (
          <>
            <div className="flex gap-1 rounded-lg bg-[var(--tott-panel-bg)] p-1 text-xs">
              <button
                type="button"
                onClick={() => setMode("gift")}
                className={`rounded-md px-3 py-1.5 ${mode === "gift" ? "bg-foreground text-background" : "text-[var(--tott-home-text-muted)]"}`}
              >
                {t("tabGift")}
              </button>
              <button
                type="button"
                onClick={() => setMode("in_kind")}
                className={`rounded-md px-3 py-1.5 ${mode === "in_kind" ? "bg-foreground text-background" : "text-[var(--tott-home-text-muted)]"}`}
              >
                {t("tabInKind")}
              </button>
              <button
                type="button"
                onClick={() => setMode("request")}
                className={`rounded-md px-3 py-1.5 ${mode === "request" ? "bg-foreground text-background" : "text-[var(--tott-home-text-muted)]"}`}
              >
                {t("tabRequest")}
              </button>
            </div>

            {mode === "gift" ? (
              <div className="flex w-full max-w-xs flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[var(--tott-home-text-muted)]">
                    {currency ?? "GBP"}
                  </span>
                  <input
                    type="number"
                    min={1}
                    step="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-24 rounded-md border border-[var(--tott-border)] bg-transparent px-2 py-1 text-center text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleGift}
                  disabled={busy || !amount || Number(amount) <= 0}
                  className="rounded-lg bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/80 disabled:opacity-50"
                >
                  {busy ? t("redirecting") : t("giveGift")}
                </button>
              </div>
            ) : mode === "in_kind" ? (
              <div className="flex w-full max-w-xs flex-col items-center gap-2">
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
                  className="rounded-lg bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/80 disabled:opacity-50"
                >
                  {t("offer")}
                </button>
              </div>
            ) : (
              <div className="flex w-full max-w-xs flex-col items-center gap-2">
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
                  className="rounded-lg bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/80 disabled:opacity-50"
                >
                  {t("requestAccess")}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

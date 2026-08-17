"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import { ChamferedPanel } from "@/components/ui/ChamferedPanel";
import { formatApiError } from "@/lib/api/error-message";
import {
  useCreateGiftCheckout,
  useSubmitInKindGift,
} from "@/hooks/mutations/gifting";

export function GiftATraceForm() {
  const t = useTranslations("GiftATrace");
  const locale = useLocale();
  const [amount, setAmount] = useState("");
  const [inKindOpen, setInKindOpen] = useState(false);
  const [inKindDescription, setInKindDescription] = useState("");

  const checkout = useCreateGiftCheckout();
  const inKind = useSubmitInKindGift();

  async function submitMonetary(e: React.FormEvent) {
    e.preventDefault();
    const parsed = Number(amount);
    const payload =
      amount.trim() && !Number.isNaN(parsed) && parsed > 0
        ? { scope_type: "platform" as const, amount: parsed }
        : { scope_type: "platform" as const };
    try {
      const url = await toast.promise(
        checkout.mutateAsync({ payload, locale }),
        {
          loading: t("sending"),
          error: (err) => formatApiError(err, t("giftFailed")),
        },
      ).unwrap();
      window.location.href = url;
    } catch {
      // toast already surfaced the error
    }
  }

  async function submitInKind(e: React.FormEvent) {
    e.preventDefault();
    const description = inKindDescription.trim();
    if (!description) return;
    try {
      await toast.promise(
        inKind.mutateAsync({
          scope_type: "platform",
          in_kind_description: description,
        }),
        {
          loading: t("sending"),
          success: t("inKindSent"),
          error: (err) => formatApiError(err, t("giftFailed")),
        },
      ).unwrap();
      setInKindDescription("");
      setInKindOpen(false);
    } catch {
      // toast already surfaced the error
    }
  }

  return (
    <div className="space-y-6">
      <ChamferedPanel className="p-6">
        <form onSubmit={submitMonetary} className="flex flex-col gap-4">
          <label className="text-start text-sm text-[var(--tott-salt)]">
            {t("amountLabel")}
          </label>
          <input
            type="number"
            min={1}
            step="1"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={t("amountPlaceholder")}
            disabled={checkout.isPending}
            className="w-full rounded-md border border-[var(--tott-card-border)] bg-[var(--tott-elevated)] px-3 py-2 text-sm text-[var(--tott-home-text-strong)] outline-none"
          />
          <button
            type="submit"
            disabled={checkout.isPending}
            className="rounded-md bg-[var(--tott-accent-gold)] px-4 py-2 text-sm font-medium text-black disabled:opacity-60"
          >
            {amount.trim() ? t("monetaryCta", { amount }) : t("monetaryCtaEmpty")}
          </button>
        </form>
      </ChamferedPanel>

      <div className="text-start">
        <p className="text-sm text-[var(--tott-salt)]">{t("orInKind")}</p>
        {!inKindOpen && (
          <button
            type="button"
            onClick={() => setInKindOpen(true)}
            className="mt-2 text-sm text-[var(--tott-accent-gold)] underline"
          >
            {t("inKindToggle")}
          </button>
        )}
      </div>

      {inKindOpen && (
        <ChamferedPanel className="p-6">
          <form onSubmit={submitInKind} className="flex flex-col gap-4">
            <label className="text-start text-sm text-[var(--tott-salt)]">
              {t("inKindLabel")}
            </label>
            <textarea
              value={inKindDescription}
              onChange={(e) => setInKindDescription(e.target.value)}
              placeholder={t("inKindPlaceholder")}
              disabled={inKind.isPending}
              rows={4}
              className="w-full rounded-md border border-[var(--tott-card-border)] bg-[var(--tott-elevated)] px-3 py-2 text-sm text-[var(--tott-home-text-strong)] outline-none"
            />
            <p className="text-start text-xs text-[var(--tott-salt)]">{t("inKindNote")}</p>
            <button
              type="submit"
              disabled={inKind.isPending || !inKindDescription.trim()}
              className="self-start rounded-md bg-[var(--tott-elevated)] px-4 py-2 text-sm text-[var(--tott-home-text-warm)] disabled:opacity-60"
            >
              {t("inKindCta")}
            </button>
          </form>
        </ChamferedPanel>
      )}

      <p className="text-start text-sm">
        <Link href="/" className="text-[var(--tott-accent-gold)] underline">
          {t("backHome")}
        </Link>
      </p>
    </div>
  );
}

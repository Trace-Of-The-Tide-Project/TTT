"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { useGiftTicket } from "@/hooks/mutations/sessions";

export function GiftTicketModal({
  sessionId,
  open,
  onClose,
}: {
  sessionId: string;
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("Waqamh");
  const [email, setEmail] = useState("");
  const gift = useGiftTicket(sessionId);

  if (!open || typeof document === "undefined") return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    await gift.mutateAsync(trimmed);
    setEmail("");
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 backdrop-blur-md"
        onClick={onClose}
        aria-label={t("sendGift")}
        style={{ backgroundColor: "color-mix(in srgb, var(--tott-panel-bg) 55%, transparent)" }}
      />
      <form
        onSubmit={submit}
        className="relative mx-4 flex w-full max-w-md flex-col gap-4 p-6"
        style={{
          backgroundColor: "var(--tott-dash-surface)",
          border: "1px solid var(--tott-card-border)",
          borderRadius: "16px",
        }}
      >
        <h2 className="text-start text-lg font-semibold text-[var(--tott-home-text-warm)]">
          {t("giftTicket")}
        </h2>
        <p className="text-start text-sm text-[var(--tott-salt)]">{t("giftTicketDescription")}</p>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("recipientEmail")}
          disabled={gift.isPending}
          className="w-full rounded-md border border-[var(--tott-card-border)] bg-[var(--tott-elevated)] px-3 py-2 text-sm text-[var(--tott-home-text-strong)] outline-none"
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={gift.isPending}
            className="rounded-md bg-[var(--tott-card-border)] px-4 py-2 text-sm text-[var(--tott-home-text-strong)]"
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            disabled={gift.isPending || !email.trim()}
            className="rounded-md bg-[var(--tott-accent-gold)] px-4 py-2 text-sm font-medium text-black disabled:opacity-60"
          >
            {t("sendGift")}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}

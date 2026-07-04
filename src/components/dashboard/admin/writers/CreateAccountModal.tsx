"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { formatApiError } from "@/lib/api/error-message";
import type { WriterProfile } from "@/services/writers.service";
import { writerDisplayName } from "@/services/writers.service";

type Props = {
  writer: WriterProfile;
  busy: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    full_name: string;
    email: string;
    password: string;
  }) => Promise<void>;
};

export function CreateAccountModal({ writer, busy, onClose, onSubmit }: Props) {
  const t = useTranslations("Dashboard.writersManagement.list.account");
  const [fullName, setFullName] = useState(
    writer.pen_name?.trim() || writerDisplayName(writer) || "",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    try {
      await onSubmit({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
      });
    } catch (err) {
      setError(formatApiError(err, t("createFailed")));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-6 shadow-xl"
      >
        <h2 className="text-base font-semibold text-foreground">
          {t("createTitle")}
        </h2>

        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--tott-dash-gold-label)]">
            {t("fullName")}
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={busy}
            className="w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--tott-accent-gold)]/60"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--tott-dash-gold-label)]">
            {t("email")}
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={busy}
            className="w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--tott-accent-gold)]/60"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--tott-dash-gold-label)]">
            {t("tempPassword")}
          </label>
          <input
            type="text"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={busy}
            className="w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--tott-accent-gold)]/60"
          />
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-lg px-4 py-1.5 text-sm text-[var(--tott-muted)] hover:text-foreground disabled:opacity-40"
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg border border-[var(--tott-accent-gold)]/60 bg-[var(--tott-accent-gold)]/10 px-4 py-1.5 text-sm font-medium text-[var(--tott-dash-gold-text)] hover:bg-[var(--tott-accent-gold)]/20 disabled:opacity-40"
          >
            {busy ? t("creating") : t("create")}
          </button>
        </div>
      </form>
    </div>
  );
}

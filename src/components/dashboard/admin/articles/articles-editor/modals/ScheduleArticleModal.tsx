"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { XIcon } from "@/components/ui/icons";

type ScheduleArticleModalProps = {
  open: boolean;
  busy: boolean;
  onClose: () => void;
  onConfirm: (scheduledAtIso: string) => void;
};

function localValueToIso(value: string): string | null {
  if (!value.trim()) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function ScheduleArticleModal({ open, busy, onClose, onConfirm }: ScheduleArticleModalProps) {
  const t = useTranslations("Dashboard.articles.editor.modals.schedule");
  const tModals = useTranslations("Dashboard.articles.editor.modals");
  const [scheduleAt, setScheduleAt] = useState("");
  const [hint, setHint] = useState<string | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    },
    [busy, onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  useEffect(() => {
    if (!open) return;
    setScheduleAt("");
    setHint(null);
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const iso = localValueToIso(scheduleAt);
    if (!iso) {
      setHint(t("hintInvalid"));
      return;
    }
    setHint(null);
    onConfirm(iso);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={() => !busy && onClose()}
        aria-label={tModals("closeDialog")}
      />

      <div
        className="relative mx-4 w-full max-w-md rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-article-title"
      >
        <div className="mb-5 flex items-start justify-between border-b border-[var(--tott-card-border)] pb-4">
          <div>
            <h2 id="schedule-article-title" className="text-lg font-bold text-foreground">
              {t("title")}
            </h2>
            <p className="mt-1 text-sm text-gray-500">{t("subtitle")}</p>
          </div>
          <button
            type="button"
            onClick={() => !busy && onClose()}
            className="shrink-0 rounded-lg p-1 text-gray-400 transition-colors hover:bg-[var(--tott-dash-ghost-hover)] hover:text-foreground disabled:opacity-40"
            aria-label={tModals("close")}
            disabled={busy}
          >
            <XIcon />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1.5 text-sm text-gray-400">
            <span>{t("datetimeLabel")}</span>
            <input
              type="datetime-local"
              value={scheduleAt}
              onChange={(e) => {
                setScheduleAt(e.target.value);
                setHint(null);
              }}
              disabled={busy}
              required
              className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-3 py-2.5 text-sm text-foreground outline-none focus:border-gray-500 disabled:opacity-50"
            />
          </label>
          {hint ? <p className="text-sm text-amber-400">{hint}</p> : null}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={busy}
              onClick={onClose}
              className="rounded-lg border border-[var(--tott-card-border)] bg-transparent px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-[var(--tott-dash-control-bg)] disabled:opacity-50"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg px-4 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: "#C9A96E" }}
            >
              {busy ? t("confirmBusy") : t("confirm")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

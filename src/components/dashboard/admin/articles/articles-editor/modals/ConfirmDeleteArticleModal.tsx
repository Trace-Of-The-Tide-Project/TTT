"use client";

import { useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { XIcon } from "@/components/ui/icons";

type ConfirmDeleteArticleModalProps = {
  open: boolean;
  articleTitle: string;
  busy: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

export function ConfirmDeleteArticleModal({
  open,
  articleTitle,
  busy,
  error,
  onClose,
  onConfirm,
}: ConfirmDeleteArticleModalProps) {
  const t = useTranslations("Dashboard.articles.editor.modals.delete");
  const tModals = useTranslations("Dashboard.articles.editor.modals");
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={() => !busy && onClose()}
        aria-label={tModals("closeDialog")}
      />

      <div
        className="relative mx-4 w-full max-w-md rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] p-6 shadow-xl"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-article-title"
        aria-describedby="delete-article-desc"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id="delete-article-title" className="text-lg font-bold text-foreground">
            {t("title")}
          </h2>
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

        <p id="delete-article-desc" className="text-sm text-gray-400">
          {t("description", { title: articleTitle || "—" })}
        </p>

        {error ? (
          <p className="mt-3 rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="rounded-lg border border-[var(--tott-card-border)] bg-transparent px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-[var(--tott-dash-control-bg)] disabled:opacity-50"
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="rounded-lg border border-red-900/60 bg-red-950/50 px-4 py-2 text-sm font-medium text-red-200 transition-colors hover:bg-red-950/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? t("confirmBusy") : t("confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { XIcon } from "@/components/ui/icons";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  /** Visible label for the confirm button. Default "Confirm". */
  confirmLabel?: string;
  /** Label shown while the action is in flight. Default = `confirmLabel` + "…". */
  confirmBusyLabel?: string;
  /** Cancel button label. Default "Cancel". */
  cancelLabel?: string;
  /** Style the confirm button as destructive (red). Default false. */
  destructive?: boolean;
  /** Disable buttons while the action runs. */
  busy?: boolean;
  /** Optional error to surface below the description. */
  error?: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

/**
 * Themed confirmation dialog. Use as a drop-in replacement for
 * `window.confirm` when you want consistent app styling, focus trapping,
 * and an Escape-to-close interaction.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  confirmBusyLabel,
  cancelLabel = "Cancel",
  destructive,
  busy,
  error,
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, busy, onClose]);

  if (!open || typeof document === "undefined") return null;

  const confirmClasses = destructive
    ? "rounded-lg border border-red-900/60 bg-red-950/50 px-4 py-2 text-sm font-medium text-red-200 transition-colors hover:bg-red-950/80 disabled:cursor-not-allowed disabled:opacity-50"
    : "rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--tott-dash-control-hover)] disabled:cursor-not-allowed disabled:opacity-50";

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-md"
        onClick={() => !busy && onClose()}
        aria-label="Close dialog"
      />

      <div
        className="relative mx-4 w-full max-w-md rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-6 shadow-2xl"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby={description ? "confirm-dialog-desc" : undefined}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id="confirm-dialog-title" className="text-lg font-bold text-foreground">
            {title}
          </h2>
          <button
            type="button"
            onClick={() => !busy && onClose()}
            className="shrink-0 rounded-lg p-1 text-gray-400 transition-colors hover:bg-[var(--tott-dash-ghost-hover)] hover:text-foreground disabled:opacity-40"
            aria-label="Close"
            disabled={busy}
          >
            <XIcon />
          </button>
        </div>

        {description ? (
          <p id="confirm-dialog-desc" className="text-sm text-gray-400">
            {description}
          </p>
        ) : null}

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
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className={confirmClasses}
          >
            {busy ? (confirmBusyLabel ?? `${confirmLabel}…`) : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

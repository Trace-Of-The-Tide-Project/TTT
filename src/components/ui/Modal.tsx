"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { XIcon } from "@/components/ui/icons";

type ModalProps = {
  open: boolean;
  title: string;
  /** Disable close interactions (backdrop / Escape / X) while an action runs. */
  busy?: boolean;
  /** Tailwind max-width class for the panel. Default `max-w-md`. */
  maxWidthClassName?: string;
  onClose: () => void;
  children: ReactNode;
  /** Optional footer (action buttons). Rendered below the body. */
  footer?: ReactNode;
};

/**
 * Themed content modal — a sibling of {@link ConfirmDialog} for richer bodies
 * (forms, detail views). Same portal / backdrop / Escape-to-close behaviour and
 * theme tokens, but the body and footer are caller-supplied.
 */
export function Modal({
  open,
  title,
  busy,
  maxWidthClassName = "max-w-md",
  onClose,
  children,
  footer,
}: ModalProps) {
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

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-md"
        onClick={() => !busy && onClose()}
        aria-label="Close dialog"
      />

      <div
        className={`relative mx-4 flex max-h-[90vh] w-full ${maxWidthClassName} flex-col rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] shadow-2xl`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-modal-title"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--tott-card-border)] px-6 py-4">
          <h2 id="app-modal-title" className="text-lg font-bold text-foreground">
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

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer ? (
          <div className="flex justify-end gap-2 border-t border-[var(--tott-card-border)] px-6 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

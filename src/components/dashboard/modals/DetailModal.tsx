"use client";

import { useEffect, useCallback } from "react";
import { XIcon } from "@/components/ui/icons";

type DetailModalItem = {
  id: string;
  title: string;
  subtitle: string;
  actionLabel?: string;
  actionColor?: string;
  onAction?: () => void;
  actionHref?: string;
  processButtons?: boolean;
};

type Badge = {
  label: string;
  color: string;
};

type DetailModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  badge?: Badge;
  items: DetailModalItem[];
  viewAllLabel?: string;
  viewAllHref?: string;
  onViewAll?: () => void;
};

export function DetailModal({
  open,
  onClose,
  title,
  description,
  badge,
  items,
  viewAllLabel = "View All",
  viewAllHref,
  onViewAll,
}: DetailModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close modal"
      />

      <div className="relative mx-4 w-full max-w-lg rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-6">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between border-b border-[var(--tott-card-border)] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">{title}</h2>
              {badge && (
                <span
                  className="rounded px-2 py-0.5 text-[10px] font-semibold uppercase"
                  style={{ backgroundColor: `${badge.color}20`, color: badge.color }}
                >
                  {badge.label}
                </span>
              )}
            </div>
            {description && (
              <p className="mt-1 text-sm text-[var(--tott-muted)]">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1 text-[var(--tott-muted)] transition-colors hover:bg-[var(--tott-dash-ghost-hover)] hover:text-foreground"
            aria-label="Close"
          >
            <XIcon />
          </button>
        </div>

        {/* Items */}
        <div className="flex max-h-[40vh] flex-col gap-3 overflow-y-auto">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex min-h-[60px] shrink-0 items-center justify-between gap-4 rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-2)] px-5 py-4"
            >
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                <p className="mt-0.5 truncate text-xs text-[var(--tott-muted)]">{item.subtitle}</p>
              </div>
              {item.processButtons ? (
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-icon-bg)] text-[var(--tott-dash-control-fg)] transition-colors hover:border-red-800 hover:text-red-400"
                    aria-label="Reject"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-icon-bg)] text-[var(--tott-dash-control-fg)] transition-colors hover:border-emerald-800 hover:text-emerald-400"
                    aria-label="Approve"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </button>
                </div>
              ) : item.actionHref ? (
                <a
                  href={item.actionHref}
                  className="shrink-0 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-4 py-2 text-xs font-medium text-[var(--tott-dash-control-fg)] transition-colors hover:border-[var(--tott-card-border)]"
                  style={item.actionColor ? { color: item.actionColor } : undefined}
                >
                  {item.actionLabel}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={item.onAction}
                  className="shrink-0 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-4 py-2 text-xs font-medium text-[var(--tott-dash-control-fg)] transition-colors hover:border-[var(--tott-card-border)]"
                  style={item.actionColor ? { color: item.actionColor } : undefined}
                >
                  {item.actionLabel}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* View All */}
        {(viewAllHref || onViewAll) && (
          <div className="mt-4">
            {viewAllHref ? (
              <a
                href={viewAllHref}
                className="block w-full rounded-lg py-3 text-center text-sm font-medium text-[var(--tott-on-accent)] transition-colors hover:opacity-90"
                style={{ backgroundColor: "var(--tott-accent-gold)" }}
              >
                {viewAllLabel}
              </a>
            ) : (
              <button
                type="button"
                onClick={onViewAll}
                className="w-full rounded-lg py-3 text-sm font-medium text-[var(--tott-on-accent)] transition-colors hover:opacity-90"
                style={{ backgroundColor: "var(--tott-accent-gold)" }}
              >
                {viewAllLabel}
              </button>
            )}
          </div>
        )}

        {/* Close button */}
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-6 py-2 text-sm font-medium text-[var(--tott-dash-control-fg)] transition-colors hover:border-[var(--tott-card-border)] hover:text-foreground"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

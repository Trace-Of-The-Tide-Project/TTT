"use client";

import { useEffect, useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { XIcon } from "@/components/ui/icons";

type BroadcastModalProps = {
  open: boolean;
  onClose: () => void;
};

export function BroadcastModal({ open, onClose }: BroadcastModalProps) {
  const t = useTranslations("Dashboard.adminHome.broadcastModal");
  const [audience, setAudience] = useState("All Users");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire to API
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label={t("closeModal")}
      />

      <div className="relative mx-4 w-full max-w-lg rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-6">
        {/* Header */}
        <div className="mb-5 flex items-start justify-between border-b border-[var(--tott-card-border)] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">{t("title")}</h2>
              <span
                className="rounded px-2 py-0.5 text-[10px] font-semibold uppercase"
                style={{ backgroundColor: "color-mix(in srgb, var(--tott-muted) 20%, transparent)", color: "var(--tott-muted)" }}
              >
                info
              </span>
            </div>
            <p className="mt-1 text-sm text-[var(--tott-muted)]">
              {t("description")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1 text-[var(--tott-muted)] transition-colors hover:bg-[var(--tott-dash-ghost-hover)] hover:text-foreground"
            aria-label={t("close")}
          >
            <XIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              {t("audienceLabel")}
            </label>
            <div className="relative">
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full appearance-none rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] py-2.5 pl-5 pr-10 text-sm outline-none transition-colors focus:border-[var(--tott-accent-gold)]"
              style={{ color: "var(--tott-muted)" }}
              >
                <option value="All Users">{t("audience.allUsers")}</option>
              <option value="Authors Only">{t("audience.authorsOnly")}</option>
              <option value="Editors Only">{t("audience.editorsOnly")}</option>
              <option value="Contributors Only">{t("audience.contributorsOnly")}</option>
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--tott-muted)]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              {t("subjectLabel")}
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t("subjectPlaceholder")}
              className="w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-4 py-2.5 text-sm placeholder:text-[var(--tott-muted)] outline-none transition-colors focus:border-[var(--tott-accent-gold)]"
              style={{ color: "var(--tott-muted)" }}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              {t("messageLabel")}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("messagePlaceholder")}
              rows={5}
              className="w-full resize-y rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-4 py-2.5 text-sm placeholder:text-[var(--tott-muted)] outline-none transition-colors focus:border-[var(--tott-accent-gold)]"
              style={{ color: "var(--tott-muted)" }}
            />
          </div>

          <div className="flex items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-6 py-2 text-sm font-medium text-[var(--tott-muted)] transition-colors hover:border-[var(--tott-card-border)] hover:text-foreground"
            >
              {t("close")}
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg px-6 py-2 text-sm font-medium text-[var(--tott-on-accent)] transition-colors hover:opacity-90"
              style={{ backgroundColor: "var(--tott-accent-gold)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              {t("send")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

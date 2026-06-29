"use client";

import { useEffect, useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { XIcon } from "@/components/ui/icons";

type FeatureContentModalProps = {
  open: boolean;
  onClose: () => void;
};

const contentItems = [
  { id: "c1", title: "The Future of Cinema", subtitle: "Article · Published today" },
  { id: "c2", title: "The Future of Cinema", subtitle: "Article · Published today" },
  { id: "c3", title: "The Future of Cinema", subtitle: "Article · Published today" },
];

export function FeatureContentModal({ open, onClose }: FeatureContentModalProps) {
  const t = useTranslations("Dashboard.adminHome.featureModal");
  const [contentType, setContentType] = useState("Article");
  const [search, setSearch] = useState("");

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
        aria-label={t("closeModal")}
      />

      <div className="relative mx-4 w-full max-w-lg rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-6">
        <div className="mb-5 flex items-start justify-between border-b border-[var(--tott-card-border)] pb-5">
          <div>
            <h2 className="text-lg font-bold text-foreground">{t("title")}</h2>
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

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              {t("contentTypeLabel")}
            </label>
            <div className="relative">
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full appearance-none rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] py-2.5 pl-5 pr-10 text-sm outline-none transition-colors focus:border-[var(--tott-accent-gold)]"
                style={{ color: "var(--tott-muted)" }}
              >
                <option value="Article">{t("types.article")}</option>
                <option value="Film">{t("types.film")}</option>
                <option value="Music">{t("types.music")}</option>
                <option value="Podcast">{t("types.podcast")}</option>
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
              {t("searchLabel")}
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-4 py-2.5 text-sm placeholder:text-[var(--tott-muted)] outline-none transition-colors focus:border-[var(--tott-accent-gold)]"
              style={{ color: "var(--tott-muted)" }}
            />
          </div>

          <div className="max-h-[40vh] space-y-3 overflow-y-auto">
            {contentItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-2)] px-5 py-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="mt-0.5 text-xs text-[var(--tott-muted)]">{item.subtitle}</p>
                </div>
                <button
                  type="button"
                  className="flex shrink-0 items-center gap-2 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-4 py-2 text-xs font-medium text-[var(--tott-muted)] transition-colors hover:border-[var(--tott-card-border)] hover:text-foreground"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  {t("feature")}
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-6 py-2 text-sm font-medium text-[var(--tott-dash-control-fg)] transition-colors hover:border-[var(--tott-card-border)] hover:text-foreground"
            >
              {t("close")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

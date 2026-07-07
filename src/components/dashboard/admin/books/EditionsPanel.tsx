"use client";

import { useTranslations } from "next-intl";
import { routing } from "@/i18n/routing";
import type { LanguageTabStatus } from "@/components/dashboard/admin/translations/LanguageFormTabs";
import type { TranslationVersion } from "@/services/translations.service";

type Props = {
  versions: TranslationVersion[];
  primaryLang: string;
  activeLang: string;
  tabStatus: Record<string, LanguageTabStatus>;
  forms: Record<string, unknown>;
  onSelectLang: (loc: string) => void;
  disabled?: boolean;
};

/**
 * Lists every language edition of a book (from the translation group) with
 * PDF-attached status, and offers a one-click way to start a new-language
 * edition — same underlying action as clicking a LanguageFormTabs tab
 * (onSelectLang), just discoverable as a list instead of implicit in a tab
 * strip. See docs/superpowers/plans/2026-07-06-book-editions-panel.md.
 */
export function EditionsPanel({
  versions,
  primaryLang,
  activeLang,
  tabStatus,
  forms,
  onSelectLang,
  disabled,
}: Props) {
  const t = useTranslations("Dashboard.books.form");

  const byLang = new Map(versions.map((v) => [v.language, v]));
  const missingLocales = routing.locales.filter(
    (loc) => !byLang.has(loc) && !forms[loc],
  );

  const rowClass =
    "flex items-center justify-between gap-3 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm";
  const badgeClass = (status: LanguageTabStatus) =>
    [
      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
      status === "primary"
        ? "bg-[var(--tott-accent-gold)]/15 text-[var(--tott-dash-gold-text)]"
        : status === "dirty"
          ? "bg-amber-500/15 text-amber-400"
          : status === "existing"
            ? "bg-green-500/15 text-green-400"
            : "bg-white/5 text-[var(--tott-muted)]",
    ].join(" ");

  return (
    <div className="space-y-2">
      {routing.locales
        .filter((loc) => byLang.has(loc) || forms[loc])
        .map((loc) => {
          const version = byLang.get(loc);
          const status = tabStatus[loc] ?? "empty";
          const hasPdf = version?.has_pdf ?? (loc === activeLang ? undefined : false);
          return (
            <button
              key={loc}
              type="button"
              disabled={disabled}
              onClick={() => onSelectLang(loc)}
              className={`${rowClass} w-full text-left transition-colors hover:border-[var(--tott-accent-gold)]/40 disabled:opacity-60 ${
                loc === activeLang ? "border-[var(--tott-accent-gold)]/60" : ""
              }`}
            >
              <span className="flex min-w-0 flex-1 items-center gap-2">
                <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-[var(--tott-muted)]">
                  {loc}
                </span>
                <span className="truncate text-foreground">
                  {version?.title?.trim() || t("editions.untitled")}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <span
                  className={`text-[10px] font-medium ${hasPdf ? "text-green-400" : "text-[var(--tott-muted)]"}`}
                >
                  {hasPdf ? t("editions.pdfAttached") : t("editions.pdfMissing")}
                </span>
                <span className={badgeClass(loc === primaryLang ? "primary" : status)}>
                  {loc === primaryLang ? t("editions.badgePrimary") : t(`editions.badge.${status}`)}
                </span>
              </span>
            </button>
          );
        })}

      {missingLocales.length > 0 ? (
        <div className="pt-1">
          <label className="mb-1 block text-[10px] font-medium text-[var(--tott-dash-gold-label)]">
            {t("editions.addLabel")}
          </label>
          <div className="flex flex-wrap gap-2">
            {missingLocales.map((loc) => (
              <button
                key={loc}
                type="button"
                disabled={disabled}
                onClick={() => onSelectLang(loc)}
                className="rounded-lg border border-dashed border-[var(--tott-card-border)] px-3 py-1.5 text-xs font-medium text-[var(--tott-muted)] transition-colors hover:border-[var(--tott-accent-gold)]/50 hover:text-foreground disabled:opacity-60"
              >
                + {loc.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

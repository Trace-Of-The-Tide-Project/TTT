"use client";

import { useTranslations as useIntl } from "next-intl";
import { routing } from "@/i18n/routing";

/**
 * In-form language tab strip for multi-language authoring.
 *
 * Pattern (see WriterFormContent for the pilot implementation):
 * - The form keeps `forms: Record<locale, FormState>` + `dirty: Record<locale, boolean>`.
 * - A locale absent from `forms` has never been opened; opening it seeds it —
 *   from the fetched existing version (edit mode) or by cloning the primary tab.
 * - Submit walks the dirty locales sequentially: primary first (POST/PATCH),
 *   then each other dirty locale with `translation_of=<primaryId>`.
 * - Untouched tabs never submit; only the primary tab is required.
 */
export type LanguageTabStatus = "primary" | "existing" | "dirty" | "empty";

type Props = {
  active: string;
  onSelect: (locale: string) => void;
  status: Record<string, LanguageTabStatus>;
  disabled?: boolean;
};

export function LanguageFormTabs({ active, onSelect, status, disabled }: Props) {
  const t = useIntl("Dashboard.translations");

  return (
    <div className="inline-flex shrink-0 gap-1 rounded-lg bg-[var(--tott-elevated)] p-1">
      {routing.locales.map((loc) => {
        const s = status[loc] ?? "empty";
        const isActive = loc === active;
        const base =
          "rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors";
        const tone = isActive
          ? "bg-[var(--tott-dash-surface-inset)] text-foreground shadow-sm"
          : s === "empty"
            ? "text-[var(--tott-muted)] hover:text-foreground"
            : "text-[var(--tott-tab-inactive)] hover:text-foreground";
        const title =
          s === "dirty"
            ? t("tabs.unsaved")
            : s === "existing"
              ? t("openVersion")
              : s === "primary"
                ? t("currentBadge")
                : t("addTranslation");
        const badge = (
          <>
            {loc}
            {s === "dirty" && !isActive ? (
              <span className="ml-0.5 text-[9px] leading-none">•</span>
            ) : null}
            {s === "empty" && !isActive ? (
              <span className="ml-0.5 text-[9px] leading-none text-[var(--tott-muted)]">+</span>
            ) : null}
          </>
        );

        return (
          <button
            key={loc}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(loc)}
            className={`${base} ${tone} disabled:opacity-40`}
            title={title}
          >
            {badge}
          </button>
        );
      })}
    </div>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { routing } from "@/i18n/routing";

/**
 * Per-language name inputs for taxonomy (categories / tags / badges).
 *
 * Renders one field per NON-default locale — the modal's existing single name
 * field stays the canonical (default-locale) value, and these populate the
 * other languages of `name_i18n`. Only mounted when the extended-translations
 * flag is on (the backend `name_i18n` column is still pending — see
 * docs/backend-asks-translations.md).
 */

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  ar: "Arabic",
  es: "Spanish",
  fr: "French",
};

type Props = {
  /** Map of locale → name. */
  values: Record<string, string>;
  onChange: (locale: string, value: string) => void;
  /** Locale whose field mirrors the canonical name (read-only mirror). */
  defaultLocale?: string;
  inputClassName: string;
  labelClassName: string;
};

export function LocaleNameFields({
  values,
  onChange,
  defaultLocale = routing.defaultLocale,
  inputClassName,
  labelClassName,
}: Props) {
  const t = useTranslations("Dashboard.systemSettings.localeFields");
  const otherLocales = routing.locales.filter((loc) => loc !== defaultLocale);

  return (
    <div className="space-y-3 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset,transparent)] p-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--tott-dash-gold-label)]">
        {t("otherLanguages")}
      </p>
      {otherLocales.map((loc) => (
        <div key={loc}>
          <label className={labelClassName}>
            {loc in LANGUAGE_LABELS ? t(`languages.${loc}`) : loc.toUpperCase()}
          </label>
          <input
            type="text"
            dir={loc === "ar" ? "rtl" : "ltr"}
            value={values[loc] ?? ""}
            onChange={(e) => onChange(loc, e.target.value)}
            className={inputClassName}
          />
        </div>
      ))}
      <p className="text-[11px] text-[var(--tott-muted)]">
        {t("fallbackHint")}
      </p>
    </div>
  );
}

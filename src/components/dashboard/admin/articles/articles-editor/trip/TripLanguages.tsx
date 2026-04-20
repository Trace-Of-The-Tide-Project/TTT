"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";

const selectClass =
  "w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground outline-none focus:border-gray-500";

const LANGUAGE_CODES = ["AR", "EN", "HE", "FR", "ES", "DE", "TR"] as const;

type TripLanguagesProps = {
  languages: string[];
  onLanguagesChange: (v: string[]) => void;
};

export function TripLanguages({ languages, onLanguagesChange }: TripLanguagesProps) {
  const t = useTranslations("Dashboard.trips.editor.languages");
  const addLanguage = useCallback(
    (code: string) => {
      if (code && !languages.includes(code)) {
        onLanguagesChange([...languages, code]);
      }
    },
    [languages, onLanguagesChange],
  );

  const removeLanguage = useCallback(
    (code: string) => {
      onLanguagesChange(languages.filter((l) => l !== code));
    },
    [languages, onLanguagesChange],
  );

  const available = LANGUAGE_CODES.filter((code) => !languages.includes(code));

  return (
    <section className="rounded-lg border border-[var(--tott-card-border)] p-4 space-y-4">
      <h3 className="text-sm font-bold text-foreground">{t("heading")}</h3>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-gray-400">
          {t("selectLabel")}
        </label>
        <select
          className={selectClass}
          value=""
          onChange={(e) => {
            if (e.target.value) addLanguage(e.target.value);
          }}
        >
          <option value="">{t("selectPlaceholder")}</option>
          {available.map((code) => (
            <option key={code} value={code}>
              {t(`labels.${code}`)}
            </option>
          ))}
        </select>
      </div>

      {languages.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {languages.map((code) => {
            const label = t(`labels.${code}`);
            return (
              <span
                key={code}
                className="flex items-center gap-1 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-2.5 py-1 text-xs text-foreground"
              >
                {code}
                <button
                  type="button"
                  onClick={() => removeLanguage(code)}
                  className="ml-0.5 text-gray-500 hover:text-foreground"
                  aria-label={t("removeAria", { label })}
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}
    </section>
  );
}

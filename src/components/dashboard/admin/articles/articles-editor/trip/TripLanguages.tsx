"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { ChamferedPanel } from "@/components/ui/ChamferedPanel";

const selectClass =
  "w-full appearance-none rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2.5 pr-9 text-sm text-[var(--tott-muted)] outline-none focus:border-[var(--tott-card-border)]";

const LANGUAGE_CODES = ["AR", "EN", "HE", "FR", "ES", "DE", "TR"] as const;

type TripLanguagesProps = {
  languages: string[];
  onLanguagesChange: (v: string[]) => void;
};

function TranslateIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 8l6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

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

  const placeholderText =
    languages.length > 0
      ? t("nSelected", { count: languages.length })
      : t("selectPlaceholder");

  return (
    <ChamferedPanel className="bg-[var(--tott-dash-input-bg)] p-5">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
        <span className="text-[var(--tott-muted)]">
          <TranslateIcon />
        </span>
        {t("heading")}
      </h3>

      <div className="space-y-3">
        <div className="relative">
          <select
            className={selectClass}
            value=""
            onChange={(e) => {
              if (e.target.value) addLanguage(e.target.value);
            }}
            style={{
              WebkitAppearance: "none",
              MozAppearance: "none",
              appearance: "none",
              backgroundImage: "none",
            }}
          >
            <option value="">{placeholderText}</option>
            {LANGUAGE_CODES.map((code) => {
              const selected = languages.includes(code);
              return (
                <option key={code} value={code} disabled={selected}>
                  {selected ? `✓ ${t(`labels.${code}`)}` : t(`labels.${code}`)}
                </option>
              );
            })}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--tott-muted)]">
            <ChevronDown />
          </span>
        </div>

        {languages.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {languages.map((code) => {
              const label = t(`labels.${code}`);
              return (
                <span
                  key={code}
                  className="inline-flex items-center gap-1.5 rounded-md bg-[var(--tott-dash-control-bg)] px-2.5 py-1 text-xs text-foreground"
                >
                  <span>{label}</span>
                  <button
                    type="button"
                    onClick={() => removeLanguage(code)}
                    className="grid h-3.5 w-3.5 shrink-0 place-items-center text-[var(--tott-muted)] transition-colors hover:text-foreground"
                    aria-label={t("removeAria", { label })}
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      aria-hidden
                    >
                      <line x1="5" y1="5" x2="19" y2="19" />
                      <line x1="19" y1="5" x2="5" y2="19" />
                    </svg>
                  </button>
                </span>
              );
            })}
          </div>
        ) : null}
      </div>
    </ChamferedPanel>
  );
}

"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";

const inputClass =
  "w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground placeholder-gray-500 outline-none focus:border-gray-500";

type TripBasicInfoProps = {
  title: string;
  onTitleChange: (v: string) => void;
  moderatorName: string;
  onModeratorNameChange: (v: string) => void;
  description: string;
  onDescriptionChange: (v: string) => void;
  highlights: string[];
  onHighlightsChange: (v: string[]) => void;
};

export function TripBasicInfo({
  title,
  onTitleChange,
  moderatorName,
  onModeratorNameChange,
  description,
  onDescriptionChange,
  highlights,
  onHighlightsChange,
}: TripBasicInfoProps) {
  const t = useTranslations("Dashboard.trips.editor.basicInfo");
  const addHighlight = useCallback(() => {
    onHighlightsChange([...highlights, ""]);
  }, [highlights, onHighlightsChange]);

  const updateHighlight = useCallback(
    (idx: number, value: string) => {
      onHighlightsChange(highlights.map((h, i) => (i === idx ? value : h)));
    },
    [highlights, onHighlightsChange],
  );

  const removeHighlight = useCallback(
    (idx: number) => {
      onHighlightsChange(highlights.filter((_, i) => i !== idx));
    },
    [highlights, onHighlightsChange],
  );

  return (
    <section className="rounded-lg border border-[var(--tott-card-border)] p-4 space-y-4">
      <h3 className="text-sm font-bold text-foreground">{t("heading")}</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-400">
            {t("tripTitle")}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder={t("tripTitlePlaceholder")}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-400">
            {t("moderatorName")}
          </label>
          <input
            type="text"
            value={moderatorName}
            onChange={(e) => onModeratorNameChange(e.target.value)}
            placeholder={t("moderatorPlaceholder")}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-gray-400">
          {t("description")}
        </label>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder={t("descriptionPlaceholder")}
          rows={4}
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-gray-400">
          {t("highlights")}
        </label>
        <div className="space-y-2">
          {highlights.map((h, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                value={h}
                onChange={(e) => updateHighlight(idx, e.target.value)}
                placeholder={t("highlightPlaceholder", { number: idx + 1 })}
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => removeHighlight(idx)}
                className="shrink-0 text-gray-500 hover:text-foreground"
                aria-label={t("removeHighlightAria", { number: idx + 1 })}
              >
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addHighlight}
          className="mt-2 w-full rounded-lg border border-dashed border-[var(--tott-card-border)] py-2 text-sm text-gray-400 hover:border-gray-400 hover:text-foreground"
        >
          {t("addHighlight")}
        </button>
      </div>
    </section>
  );
}

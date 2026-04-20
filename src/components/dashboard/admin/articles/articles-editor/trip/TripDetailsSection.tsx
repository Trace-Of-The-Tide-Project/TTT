"use client";

import { useTranslations } from "next-intl";
import { isEndDatetimeBeforeStart } from "@/lib/datetime-local";

const inputClass =
  "w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground placeholder-gray-500 outline-none focus:border-gray-500";

const selectClass =
  "w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground outline-none focus:border-gray-500";

const DIFFICULTIES = ["easy", "moderate", "hard", "extreme"] as const;

type TripDetailsSectionProps = {
  startDate: string;
  onStartDateChange: (v: string) => void;
  endDate: string;
  onEndDateChange: (v: string) => void;
  durationHours: number;
  onDurationHoursChange: (v: number) => void;
  difficulty: string;
  onDifficultyChange: (v: string) => void;
  maxParticipants: number;
  onMaxParticipantsChange: (v: number) => void;
  minParticipants: number;
  onMinParticipantsChange: (v: number) => void;
  category: string;
  onCategoryChange: (v: string) => void;
};

function CompassIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

export function TripDetailsSection({
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  durationHours,
  onDurationHoursChange,
  difficulty,
  onDifficultyChange,
  maxParticipants,
  onMaxParticipantsChange,
  minParticipants,
  onMinParticipantsChange,
  category,
  onCategoryChange,
}: TripDetailsSectionProps) {
  const t = useTranslations("Dashboard.trips.editor.details");
  return (
    <section className="rounded-lg border border-[var(--tott-card-border)] p-4 space-y-4">
      <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
        <CompassIcon />
        {t("heading")}
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-400">
            {t("category")} <span className="text-amber-500">{t("categoryRequired")}</span>
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            placeholder={t("categoryPlaceholder")}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-400">
            {t("difficulty")}
          </label>
          <select
            value={difficulty}
            onChange={(e) => onDifficultyChange(e.target.value)}
            className={selectClass}
          >
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {t(`difficulties.${d}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-400">
            {t("startDate")}
          </label>
          <div className="relative">
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className={inputClass + " pl-9"}
            />
            <svg
              width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-400">
            {t("endDate")}
          </label>
          <input
            type="datetime-local"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => {
              const v = e.target.value;
              if (startDate && v && isEndDatetimeBeforeStart(v, startDate)) {
                onEndDateChange(startDate);
                return;
              }
              onEndDateChange(v);
            }}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-400">
            {t("durationHours")}
          </label>
          <input
            type="number"
            min={1}
            value={durationHours}
            onChange={(e) => onDurationHoursChange(Number(e.target.value) || 1)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-400">
            {t("maxParticipants")}
          </label>
          <input
            type="number"
            min={1}
            value={maxParticipants}
            onChange={(e) => onMaxParticipantsChange(Number(e.target.value) || 1)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-400">
            {t("minParticipants")}
          </label>
          <input
            type="number"
            min={0}
            value={minParticipants}
            onChange={(e) => onMinParticipantsChange(Number(e.target.value) || 0)}
            className={inputClass}
          />
        </div>
      </div>
    </section>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { ChamferedPanel } from "@/components/ui/ChamferedPanel";

const inputClass =
  "w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground placeholder:text-[var(--tott-muted)] outline-none focus:border-[var(--tott-card-border)]";

type TripDetailsSectionProps = {
  startLocation: string;
  onStartLocationChange: (v: string) => void;
  endLocation: string;
  onEndLocationChange: (v: string) => void;
  startDate: string;
  onStartDateChange: (v: string) => void;
  durationDays: number;
  onDurationDaysChange: (v: number) => void;
  groupSize: number;
  onGroupSizeChange: (v: number) => void;
  openGroup: boolean;
  onOpenGroupChange: (v: boolean) => void;
};

function LocationPinIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function CalendarGlyph() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

export function TripDetailsSection({
  startLocation,
  onStartLocationChange,
  endLocation,
  onEndLocationChange,
  startDate,
  onStartDateChange,
  durationDays,
  onDurationDaysChange,
  groupSize,
  onGroupSizeChange,
  openGroup,
  onOpenGroupChange,
}: TripDetailsSectionProps) {
  const t = useTranslations("Dashboard.trips.editor.details");

  return (
    <ChamferedPanel className="bg-[var(--tott-dash-input-bg)] p-5">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
        <span className="text-[var(--tott-muted)]">
          <LocationPinIcon />
        </span>
        {t("heading")}
      </h3>

      <div className="space-y-4">
        <p className="text-xs uppercase tracking-wide text-[var(--tott-muted)]">{t("route")}</p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--tott-muted)]">
              {t("startLocation")}
            </label>
            <input
              type="text"
              value={startLocation}
              onChange={(e) => onStartLocationChange(e.target.value)}
              placeholder={t("startLocationPlaceholder")}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--tott-muted)]">
              {t("endLocation")}
            </label>
            <input
              type="text"
              value={endLocation}
              onChange={(e) => onEndLocationChange(e.target.value)}
              placeholder={t("endLocationPlaceholder")}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--tott-muted)]">
              {t("startDate")}
            </label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className={`${inputClass} pl-9`}
              />
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tott-muted)]">
                <CalendarGlyph />
              </span>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--tott-muted)]">
              {t("durationDays")}{" "}
              <span className="text-[var(--tott-muted)]">{t("durationDaysSuffix")}</span>
            </label>
            <input
              type="number"
              min={1}
              value={durationDays}
              onChange={(e) =>
                onDurationDaysChange(Math.max(1, Number(e.target.value) || 1))
              }
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--tott-muted)]">
              {t("groupSize")}
            </label>
            <input
              type="number"
              min={1}
              value={groupSize}
              onChange={(e) =>
                onGroupSizeChange(Math.max(1, Number(e.target.value) || 1))
              }
              className={inputClass}
            />
          </div>
          <div className="flex h-[38px] items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={openGroup}
              onClick={() => onOpenGroupChange(!openGroup)}
              className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                openGroup ? "bg-[var(--tott-accent-gold)]" : "bg-[var(--tott-dash-control-bg)]"
              }`}
            >
              <span
                aria-hidden
                className={`inline-block h-4 w-4 transform rounded-full bg-[var(--tott-dash-surface)] transition-transform ${
                  openGroup ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </button>
            <span className="text-sm text-foreground">{t("openGroup")}</span>
          </div>
        </div>
      </div>
    </ChamferedPanel>
  );
}

"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { ChamferedPanel } from "@/components/ui/ChamferedPanel";
import { RichTextEditor, EditorToolbar, EditorRegistryProvider } from "@/components/ui/rich-text";
import type { TripStop } from "@/services/trips.service";

const LocationMapPicker = dynamic(() => import("./LocationMapPicker"), { ssr: false });

const inputClass =
  "w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground placeholder-gray-500 outline-none focus:border-gray-500";

/** Flat editor shape — easier to bind to inputs than nested TripStop */
export type EditorStop = {
  title: string;
  description: string;
  arrivalTime: string;
  durationMinutes: number;
  locationName: string;
  latitude: string;
  longitude: string;
  address: string;
  /** Optional stop image URL (e.g. after upload) — sent as `image_url` on create */
  imageUrl: string;
};

export function emptyEditorStop(): EditorStop {
  return {
    title: "",
    description: "",
    arrivalTime: "",
    durationMinutes: 30,
    locationName: "",
    latitude: "",
    longitude: "",
    address: "",
    imageUrl: "",
  };
}

export function editorStopsToTripStops(stops: EditorStop[]): TripStop[] {
  return stops.map((s, i) => ({
    stop_order: i + 1,
    title: s.title.trim(),
    description: s.description.trim(),
    arrival_time: s.arrivalTime || null,
    duration_minutes: s.durationMinutes,
    image_url: s.imageUrl.trim() || undefined,
    location: {
      name: s.locationName.trim(),
      latitude: parseFloat(s.latitude) || 0,
      longitude: parseFloat(s.longitude) || 0,
      address: s.address.trim() || undefined,
    },
  }));
}

type StopEntryProps = {
  stop: EditorStop;
  index: number;
  onChange: (patch: Partial<EditorStop>) => void;
  onRemove: () => void;
};

/** Splits an ISO datetime-local value (`YYYY-MM-DDTHH:mm`) into separate date and time parts. */
function splitDateTime(value: string): { date: string; time: string } {
  if (!value) return { date: "", time: "" };
  const [date = "", time = ""] = value.split("T");
  return { date, time };
}

function joinDateTime(date: string, time: string): string {
  if (!date && !time) return "";
  if (!time) return `${date}T00:00`;
  if (!date) return "";
  return `${date}T${time}`;
}

function StopEntry({ stop, index, onChange, onRemove }: StopEntryProps) {
  const t = useTranslations("Dashboard.trips.editor.itinerary");
  const { date, time } = splitDateTime(stop.arrivalTime);

  const stopName = stop.title.trim() || stop.locationName.trim() || t("untitledLocation");

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
      {/* Left: stop fields card — same chamfered shape as the outer panel */}
      <ChamferedPanel className="bg-[var(--tott-dash-input-bg)] p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">{t("dayNumber", { number: index + 1 })}</span>
            <span className="truncate font-semibold text-foreground">{stopName}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={t("duplicateStopAria", { number: index + 1 })}
              className="text-gray-400 transition-colors hover:text-foreground"
            >
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
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
            <button
              type="button"
              onClick={onRemove}
              aria-label={t("removeStopAria", { number: index + 1 })}
              className="text-red-400 transition-colors hover:text-red-300"
            >
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
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        </div>

        <hr className="mb-3 border-[var(--tott-card-border)]" />
        <p className="mb-3 text-sm text-gray-400">{t("route")}</p>

        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              {t("locationName")}
            </label>
            <input
              type="text"
              value={stop.locationName}
              onChange={(e) => onChange({ locationName: e.target.value, title: e.target.value })}
              placeholder={t("locationPlaceholder")}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                {t("dateLabel")}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => onChange({ arrivalTime: joinDateTime(e.target.value, time) })}
                placeholder="dd/mm/yyyy"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                {t("timeLabel")}
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => onChange({ arrivalTime: joinDateTime(date, e.target.value) })}
                  className={`${inputClass} pr-9 [&::-webkit-calendar-picker-indicator]:opacity-0`}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              {t("detailsLabel")}
            </label>
            <div className="overflow-hidden rounded-md border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)]">
              <RichTextEditor
                value={stop.description}
                onChange={(html) => onChange({ description: html })}
                placeholder={t("descriptionPlaceholder")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                {t("latitude")}
              </label>
              <input
                type="number"
                step="any"
                value={stop.latitude}
                onChange={(e) => onChange({ latitude: e.target.value })}
                placeholder="33.33.11"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                {t("longitude")}
              </label>
              <input
                type="number"
                step="any"
                value={stop.longitude}
                onChange={(e) => onChange({ longitude: e.target.value })}
                placeholder="-7.88.88"
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </ChamferedPanel>

      {/* Right: map preview */}
      <div className="h-[260px] overflow-hidden rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] lg:h-auto">
        <LocationMapPicker
          latitude={stop.latitude}
          longitude={stop.longitude}
          searchPlaceholder={t("searchPlaceholder")}
          searchingLabel={t("searching")}
          onLocationSelect={(sel) => {
            const patch: Partial<EditorStop> = {
              latitude: sel.latitude,
              longitude: sel.longitude,
            };
            if (sel.name) {
              patch.locationName = sel.name;
              patch.title = sel.name.split(",")[0]!.trim();
            }
            onChange(patch);
          }}
        />
      </div>
    </div>
  );
}

type ItineraryBuilderProps = {
  stops: EditorStop[];
  onChange: (stops: EditorStop[]) => void;
};

function MapPinIcon() {
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
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function ItineraryBuilder({ stops, onChange }: ItineraryBuilderProps) {
  const t = useTranslations("Dashboard.trips.editor.itinerary");

  const addStop = useCallback(() => {
    onChange([...stops, emptyEditorStop()]);
  }, [stops, onChange]);

  const removeStop = useCallback(
    (idx: number) => {
      onChange(stops.filter((_, i) => i !== idx));
    },
    [stops, onChange]
  );

  const updateStop = useCallback(
    (idx: number, patch: Partial<EditorStop>) => {
      onChange(stops.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
    },
    [stops, onChange]
  );

  return (
    <ChamferedPanel className="bg-[var(--tott-dash-input-bg)] p-5">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
        <span className="text-gray-400">
          <MapPinIcon />
        </span>
        {t("heading")}
      </h3>

      <EditorRegistryProvider>
        <div className="mb-3 rounded-md border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)]">
          <EditorToolbar />
        </div>
        <div className="space-y-4">
          {stops.map((stop, i) => (
            <StopEntry
              key={i}
              stop={stop}
              index={i}
              onChange={(patch) => updateStop(i, patch)}
              onRemove={() => removeStop(i)}
            />
          ))}

          {/* Match the stop-card's column width (not the full outer panel) by
              sitting in the same grid track that StopEntry uses. */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
            <button
              type="button"
              onClick={addStop}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] py-3 text-sm text-gray-300 transition-colors hover:bg-[var(--tott-dash-control-bg)] hover:text-foreground"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              {t("addLocation")}
            </button>
          </div>
        </div>
      </EditorRegistryProvider>
    </ChamferedPanel>
  );
}

"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { GripIcon, TrashIcon } from "../ArticleEditorIcons";
import type { TripStop } from "@/services/trips.service";

const LocationMapPicker = dynamic(() => import("./LocationMapPicker"), { ssr: false });

const inputClass =
  "w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-3 py-2 text-sm text-foreground placeholder-gray-500 outline-none focus:border-gray-500";

const DRAG_MIME = "application/x-tott-itinerary-idx";

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
  expanded: boolean;
  onToggle: () => void;
  onChange: (patch: Partial<EditorStop>) => void;
  onRemove: () => void;
  isDragging: boolean;
  isDragOver: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
};

function StopEntry({
  stop,
  index,
  expanded,
  onToggle,
  onChange,
  onRemove,
  isDragging,
  isDragOver,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: StopEntryProps) {
  const t = useTranslations("Dashboard.trips.editor.itinerary");
  return (
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`rounded-lg border bg-[var(--tott-dash-input-bg)] transition-all ${
        isDragOver
          ? "border-[#C9A96E]"
          : isDragging
            ? "border-dashed border-gray-500 opacity-50"
            : "border-[var(--tott-card-border)]"
      }`}
    >
      <div className="flex items-center gap-2 px-3 py-2">
        <span
          draggable
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          className="cursor-grab text-gray-500 hover:text-gray-300"
        >
          <GripIcon />
        </span>
        <button
          type="button"
          onClick={onToggle}
          className="flex flex-1 items-center gap-2 text-left text-sm text-foreground"
        >
          <span className="font-medium">
            {stop.title.trim() || stop.locationName.trim() || t("stopNumber", { number: index + 1 })}
          </span>
          <svg
            width={12}
            height={12}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className={`ml-auto transition-transform ${expanded ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="text-gray-500 hover:text-red-400"
          aria-label={t("removeStopAria", { number: index + 1 })}
        >
          <TrashIcon />
        </button>
      </div>

      {expanded && (
        <div className="space-y-3 border-t border-[var(--tott-card-border)] px-3 py-3">
          <div className="flex gap-4">
            <div className="min-w-0 flex-1 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">{t("stopTitle")}</label>
                <input
                  type="text"
                  value={stop.title}
                  onChange={(e) => onChange({ title: e.target.value })}
                  placeholder={t("stopTitlePlaceholder")}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">{t("description")}</label>
                <textarea
                  value={stop.description}
                  onChange={(e) => onChange({ description: e.target.value })}
                  placeholder={t("descriptionPlaceholder")}
                  rows={3}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-400">
                    {t("arrivalTime")}
                  </label>
                  <input
                    type="datetime-local"
                    value={stop.arrivalTime}
                    onChange={(e) => onChange({ arrivalTime: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-400">
                    {t("durationMinutes")}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={stop.durationMinutes}
                    onChange={(e) => onChange({ durationMinutes: Number(e.target.value) || 0 })}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="w-52 shrink-0">
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
        </div>
      )}
    </div>
  );
}

type ItineraryBuilderProps = {
  stops: EditorStop[];
  onChange: (stops: EditorStop[]) => void;
};

export function ItineraryBuilder({ stops, onChange }: ItineraryBuilderProps) {
  const t = useTranslations("Dashboard.trips.editor.itinerary");
  const [expandedIdx, setExpandedIdx] = useState<number | null>(stops.length > 0 ? 0 : null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const addStop = useCallback(() => {
    const next = [...stops, emptyEditorStop()];
    onChange(next);
    setExpandedIdx(next.length - 1);
  }, [stops, onChange]);

  const removeStop = useCallback(
    (idx: number) => {
      onChange(stops.filter((_, i) => i !== idx));
      if (expandedIdx === idx) setExpandedIdx(null);
    },
    [stops, onChange, expandedIdx]
  );

  const updateStop = useCallback(
    (idx: number, patch: Partial<EditorStop>) => {
      onChange(stops.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
    },
    [stops, onChange]
  );

  const reorder = useCallback(
    (from: number, to: number) => {
      if (from === to) return;
      const next = [...stops];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item!);
      onChange(next);
      if (expandedIdx === from) setExpandedIdx(to);
    },
    [stops, onChange, expandedIdx]
  );

  const handleDragStart = useCallback(
    (idx: number) => (e: React.DragEvent) => {
      setDraggingIdx(idx);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData(DRAG_MIME, String(idx));
    },
    []
  );

  const handleDragOver = useCallback(
    (idx: number) => (e: React.DragEvent) => {
      if (!e.dataTransfer.types.includes(DRAG_MIME)) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDragOverIdx(idx);
    },
    []
  );

  const handleDrop = useCallback(
    (idx: number) => (e: React.DragEvent) => {
      e.preventDefault();
      const from = Number(e.dataTransfer.getData(DRAG_MIME));
      if (!Number.isNaN(from)) reorder(from, idx);
      setDraggingIdx(null);
      setDragOverIdx(null);
    },
    [reorder]
  );

  const handleDragEnd = useCallback(() => {
    setDraggingIdx(null);
    setDragOverIdx(null);
  }, []);

  return (
    <section className="rounded-lg border border-[var(--tott-card-border)] p-4 space-y-4">
      <h3 className="text-sm font-bold text-foreground">{t("heading")}</h3>

      <div className="space-y-3">
        {stops.map((stop, i) => (
          <StopEntry
            key={i}
            stop={stop}
            index={i}
            expanded={expandedIdx === i}
            onToggle={() => setExpandedIdx(expandedIdx === i ? null : i)}
            onChange={(patch) => updateStop(i, patch)}
            onRemove={() => removeStop(i)}
            isDragging={draggingIdx === i}
            isDragOver={dragOverIdx === i}
            onDragStart={handleDragStart(i)}
            onDragOver={handleDragOver(i)}
            onDrop={handleDrop(i)}
            onDragEnd={handleDragEnd}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={addStop}
        className="w-full rounded-lg border border-dashed border-[var(--tott-card-border)] py-2.5 text-sm text-gray-400 hover:border-gray-400 hover:text-foreground"
      >
        {t("addStop")}
      </button>
    </section>
  );
}

"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo } from "react";
import { XIcon } from "@/components/ui/icons";
import type { EditorStop } from "./ItineraryBuilder";
import {
  parseTripHighlights,
  parseTripLanguages,
  tripDisplayPriceLabel,
  tripMaxPrice,
  tripStopImageUrl,
  type TripStop,
  type TripListItem,
} from "@/services/trips.service";
import { Link } from "@/i18n/navigation";
import type { RouteMapPoint } from "./TripPreviewRouteMap";

const TripPreviewRouteMap = dynamic(() => import("./TripPreviewRouteMap"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] text-xs text-gray-500">
      Loading map…
    </div>
  ),
});

/** Normalised stop shape used only inside this modal. */
type PreviewStop = {
  title: string;
  description: string;
  arrivalTime: string;
  locationName: string;
  latitude: string;
  longitude: string;
  /** When set, timeline shows this image; otherwise no image block */
  imageUrl: string | null;
};

function editorStopToPreview(s: EditorStop): PreviewStop {
  const img = s.imageUrl?.trim() || null;
  return {
    title: s.title,
    description: s.description,
    arrivalTime: s.arrivalTime,
    locationName: s.locationName,
    latitude: s.latitude,
    longitude: s.longitude,
    imageUrl: img,
  };
}

function tripStopToPreview(s: TripStop): PreviewStop {
  return {
    title: s.title,
    description: s.description,
    arrivalTime: s.arrival_time ?? "",
    locationName: s.location.name,
    latitude: String(s.location.latitude),
    longitude: String(s.location.longitude),
    imageUrl: tripStopImageUrl(s),
  };
}

type TripPreviewData = {
  title: string;
  description: string;
  moderatorName: string;
  category: string;
  difficulty: string;
  startDate: string;
  endDate: string;
  durationHours: number;
  maxParticipants: number;
  minParticipants: number;
  price: string;
  currency: string;
  languages: string[];
  highlights: string[];
  stops: EditorStop[];
  /** draft | published etc. — shown as status badge */
  status?: string;
};

type TripPreviewModalProps = {
  open: boolean;
  onClose: () => void;
  data?: TripPreviewData;
  trip?: TripListItem;
};

const ACCENT = "text-[#CBA158]";
const ACCENT_BG = "bg-[#CBA158]";

const LANG_LABELS: Record<string, string> = {
  EN: "English",
  AR: "Arabic",
  FR: "French",
  DE: "German",
  ES: "Spanish",
  IT: "Italian",
  PT: "Portuguese",
  HE: "Hebrew",
};

function formatLangList(langs: string[]): string {
  if (langs.length === 0) return "—";
  return langs.map((l) => LANG_LABELS[l.toUpperCase()] ?? l).join(", ");
}

function formatDateLong(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function formatTime(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function formatStayLabel(startIso: string, endIso: string, durationHours: number): string {
  if (startIso && endIso) {
    const s = new Date(startIso).getTime();
    const e = new Date(endIso).getTime();
    const diff = e - s;
    if (diff > 0) {
      const nights = Math.round(diff / 86_400_000);
      const days = Math.max(1, nights + 1);
      return `${nights} night${nights !== 1 ? "s" : ""}, ${days} day${days !== 1 ? "s" : ""}`;
    }
  }
  if (durationHours > 0) {
    const d = Math.max(1, Math.round(durationHours / 24));
    return `—, ${d} day${d !== 1 ? "s" : ""}`;
  }
  return "—";
}

function formatGroupSize(minP: number, maxP: number): string {
  if (maxP <= 0) return "—";
  if (minP > 0 && minP !== maxP) return `${minP}–${maxP} people`;
  return `Up to ${maxP} people`;
}

function primaryLocationLabel(stops: PreviewStop[], category: string): string {
  const loc = stops.find((s) => s.locationName.trim())?.locationName ?? "";
  const parts = loc.split(",").map((x) => x.trim()).filter(Boolean);
  if (parts.length >= 2) return parts[parts.length - 1]!;
  if (parts.length === 1) return parts[0]!;
  return category.trim() || "—";
}

function buildRouteHeading(stops: PreviewStop[], routeSummary: string | null): string {
  if (routeSummary?.trim()) return routeSummary.trim();
  const names = stops
    .map((s) => s.locationName.trim() || s.title.trim())
    .filter(Boolean);
  if (names.length === 0) return "";
  if (names.length === 1) return names[0]!;
  return `${names[0]} → ${names[names.length - 1]}`;
}

function statusLabel(trip: TripListItem | undefined, dataStatus: string | undefined): string {
  if (trip?.status) {
    const s = trip.status.toLowerCase();
    if (s === "published") return "Published";
    if (s === "draft") return "Draft";
    return trip.status.charAt(0).toUpperCase() + trip.status.slice(1);
  }
  if (dataStatus) {
    return dataStatus.charAt(0).toUpperCase() + dataStatus.slice(1);
  }
  return "Draft";
}

function difficultyLabel(d: string): string {
  if (!d.trim()) return "—";
  return d.charAt(0).toUpperCase() + d.slice(1).toLowerCase();
}

function CalendarSmIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ClockSmIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function MapPinSmIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function GlobeSmIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function PeopleSmIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function SummaryCell({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5 border-r border-[var(--tott-card-border)] px-2 py-1 last:border-r-0 sm:px-3">
      <div className={`${ACCENT}`}>{icon}</div>
      <span className="text-center text-[10px] uppercase tracking-wide text-gray-500">{label}</span>
      <span className="text-center text-xs font-medium text-foreground">{value}</span>
    </div>
  );
}

function StopTimeline({
  stop,
  index,
  total,
}: {
  stop: PreviewStop;
  index: number;
  total: number;
}) {
  const titleRaw = stop.title.trim() || stop.locationName.trim();
  const title =
    index === total - 1 && total > 1 && !stop.title.trim()
      ? "Finish"
      : titleRaw || `Stop ${index + 1}`;

  const lat = parseFloat(stop.latitude);
  const lng = parseFloat(stop.longitude);
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0);

  return (
    <div className="relative flex gap-4">
      <div className="flex w-8 shrink-0 flex-col items-center pt-0.5">
        <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--tott-dash-surface-inset)] text-xs font-semibold text-gray-300">
          {index + 1}
        </div>
      </div>

      <div className="min-w-0 flex-1 pb-10">
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>

        {stop.arrivalTime && (
          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <CalendarSmIcon />
              {formatDateLong(stop.arrivalTime)}
            </span>
            <span className="flex items-center gap-1">
              <ClockSmIcon />
              {formatTime(stop.arrivalTime)}
            </span>
          </div>
        )}

        {stop.description.trim() && (
          <p className="mt-2 text-xs leading-relaxed text-gray-400">{stop.description}</p>
        )}

        {stop.imageUrl?.trim() ? (
          // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin/API image URLs
          <img
            src={stop.imageUrl}
            alt=""
            className="mt-3 aspect-video w-full max-w-md rounded-lg object-cover ring-1 ring-[#333]"
          />
        ) : null}

        {hasCoords && (
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-500">
            <MapPinSmIcon />
            <span>
              Lat: {lat.toFixed(4)}, Lng: {lng.toFixed(4)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function TripPreviewModal({ open, onClose, data, trip }: TripPreviewModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  const resolved = useMemo(() => {
    if (data) {
      return {
        title: data.title,
        description: data.description,
        moderatorName: data.moderatorName,
        category: data.category,
        difficulty: data.difficulty,
        startDate: data.startDate,
        endDate: data.endDate,
        durationHours: data.durationHours,
        maxParticipants: data.maxParticipants,
        minParticipants: data.minParticipants,
        price: data.price,
        currency: data.currency,
        priceCapFromApi: null,
        languages: data.languages,
        highlights: data.highlights,
        stops: data.stops.map(editorStopToPreview),
        routeSummary: null as string | null,
        dataStatus: data.status,
      };
    }
    if (trip) {
      return {
        title: trip.title,
        description: trip.description,
        moderatorName: trip.moderator_name ?? "",
        category: trip.category,
        difficulty: trip.difficulty,
        startDate: trip.start_date,
        endDate: trip.end_date ?? "",
        durationHours: trip.duration_hours,
        maxParticipants: trip.max_participants,
        minParticipants: trip.min_participants ?? 0,
        price: trip.price,
        currency: trip.currency,
        priceCapFromApi: tripMaxPrice(trip),
        languages: parseTripLanguages(trip.languages),
        highlights: parseTripHighlights(trip.highlights),
        stops: (trip.stops ?? []).map(tripStopToPreview),
        routeSummary: trip.route_summary,
        dataStatus: undefined as string | undefined,
      };
    }
    return null;
  }, [data, trip]);

  const namedStops = useMemo(() => {
    if (!resolved) return [];
    return resolved.stops.filter((s) => s.title.trim() || s.locationName.trim());
  }, [resolved]);

  const mapPoints: RouteMapPoint[] = useMemo(
    () =>
      namedStops.map((s, i) => ({
        order: i + 1,
        lat: parseFloat(s.latitude),
        lng: parseFloat(s.longitude),
      })),
    [namedStops],
  );

  if (!open || !resolved) return null;

  const filteredHighlights = resolved.highlights.filter((h) => h.trim());

  const priceNum = parseFloat(resolved.price);
  const priceDisplay =
    priceNum > 0
      ? tripDisplayPriceLabel({
          price: resolved.price,
          max_price: resolved.priceCapFromApi,
          currency: resolved.currency,
        })
      : "Free";

  const routeHeading = buildRouteHeading(resolved.stops, resolved.routeSummary);
  const locationSummary = primaryLocationLabel(resolved.stops, resolved.category);
  const stat = statusLabel(trip, resolved.dataStatus);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close modal"
      />

      <div
        className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="trip-preview-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-[var(--tott-dash-ghost-hover)] hover:text-foreground"
          aria-label="Close"
        >
          <XIcon />
        </button>

        <div className="flex-1 overflow-y-auto px-6 pb-4 pt-6 sm:px-8 sm:pt-8">
          <div className="pr-10">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full ${ACCENT_BG} px-3 py-1 text-xs font-semibold text-black`}
              >
                {priceDisplay}
              </span>
              <span className="rounded-full bg-[var(--tott-dash-surface-inset)] px-3 py-1 text-xs font-medium text-foreground">
                {difficultyLabel(resolved.difficulty)}
              </span>
              <span className="rounded-full bg-[var(--tott-dash-surface-inset)] px-3 py-1 text-xs font-medium text-foreground">{stat}</span>
            </div>

            <h2 id="trip-preview-title" className="text-xl font-bold text-foreground sm:text-2xl">
              {resolved.title.trim() || "Trip Name"}
            </h2>
            {routeHeading && <p className="mt-2 text-sm text-foreground">{routeHeading}</p>}
          </div>

          <div className="mt-6 flex flex-wrap rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] py-4">
            <SummaryCell
              icon={<CalendarSmIcon className={ACCENT} />}
              label="Date"
              value={formatDateLong(resolved.startDate)}
            />
            <SummaryCell
              icon={<ClockSmIcon className={ACCENT} />}
              label="Duration"
              value={formatStayLabel(resolved.startDate, resolved.endDate, resolved.durationHours)}
            />
            <SummaryCell
              icon={<PeopleSmIcon className={ACCENT} />}
              label="Group size"
              value={formatGroupSize(resolved.minParticipants, resolved.maxParticipants)}
            />
            <SummaryCell
              icon={<GlobeSmIcon className={ACCENT} />}
              label="Languages"
              value={formatLangList(resolved.languages)}
            />
            <SummaryCell
              icon={<MapPinSmIcon className={ACCENT} />}
              label="Location"
              value={locationSummary}
            />
          </div>

          {resolved.description.trim() && (
            <div className="mt-8">
              <h3 className={`mb-2 text-sm font-semibold ${ACCENT}`}>Trip Description</h3>
              <p className="text-sm leading-relaxed text-gray-300">{resolved.description}</p>
            </div>
          )}

          {filteredHighlights.length > 0 && (
            <div className="mt-8">
              <h3 className={`mb-4 text-sm font-semibold ${ACCENT}`}>Trip highlights</h3>
              <div className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
                {filteredHighlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--tott-dash-surface-inset)]">
                      <CheckIcon />
                    </span>
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {namedStops.length > 0 && (
            <div className="mt-12 border-t border-[var(--tott-card-border)] pt-8">
              <h3 className={`mb-6 text-sm font-semibold ${ACCENT}`}>Trip Timeline &amp; Route Map</h3>
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_400px]">
                <div className="relative min-w-0 pl-0">
                  {namedStops.length > 1 && (
                    <div
                      className="pointer-events-none absolute bottom-10 left-4 top-5 w-0 border-l-2 border-dashed border-gray-600"
                      aria-hidden
                    />
                  )}
                  {namedStops.map((stop, i) => (
                    <StopTimeline key={i} stop={stop} index={i} total={namedStops.length} />
                  ))}
                </div>
                <div className="min-h-[320px] lg:min-h-[480px] lg:sticky lg:top-2 lg:self-start">
                  <TripPreviewRouteMap points={mapPoints} className="h-full" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-[var(--tott-card-border)] px-6 py-4 sm:px-8">
          {trip?.id ? (
            <Link
              href={`/trip/${trip.id}`}
              onClick={onClose}
              className={`rounded-lg ${ACCENT_BG} px-8 py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90`}
            >
              Join
            </Link>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[var(--tott-dash-surface-inset)] px-8 py-2.5 text-sm font-medium text-gray-200 transition-colors hover:bg-[var(--tott-dash-control-hover)] hover:text-foreground"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

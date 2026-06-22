"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { XIcon } from "@/components/ui/icons";
import {
  parseTripHighlights,
  parseTripLanguages,
  tripDisplayPriceLabel,
  tripMaxPrice,
  type TripListItem,
} from "@/services/trips.service";
import type { RouteMapPoint } from "./TripPreviewRouteMap";
import {
  editorStopToPreview,
  tripStopToPreview,
  formatLangList,
  formatDateLong,
  formatTime,
  formatStayLabel,
  formatGroupSize,
  buildRouteHeading,
  statusLabel,
  difficultyLabel,
  type PreviewStop,
} from "./TripPreviewFormatters";
import {
  CalendarIcon,
  ClockIcon,
  PinIcon,
  GlobeIcon,
  PeopleIcon,
  MapPinIcon,
  CheckIcon,
} from "./TripPreviewIcons";
import type { EditorStop } from "./ItineraryBuilder";

const TripPreviewRouteMap = dynamic(() => import("./TripPreviewRouteMap"), {
  ssr: false,
  loading: () => (
    <div
      className="flex h-full min-h-[200px] items-center justify-center rounded-2xl border text-[10px]"
      style={{
        borderColor: "var(--tott-card-border)",
        background: "var(--tott-well-bg)",
        color: "var(--tott-muted)",
      }}
    >
      …
    </div>
  ),
});

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
  status?: string;
};

type TripPreviewModalProps = {
  open: boolean;
  onClose: () => void;
  data?: TripPreviewData;
  trip?: TripListItem;
};

const OCTAGON_CLIP =
  "polygon(18px 0%, calc(100% - 18px) 0%, 100% 18px, 100% calc(100% - 18px), calc(100% - 18px) 100%, 18px 100%, 0% calc(100% - 18px), 0% 18px)";

const ROUNDED_HEX_PATH =
  "M67.3261 1.23859C71.2762 -0.413618 75.7238 -0.41362 79.6739 1.23859L137.174 25.2888C143.126 27.7782 147 33.5983 147 40.0496V95.2629C147 101.714 143.126 107.534 137.174 110.024L79.6739 134.074C75.7238 135.726 71.2762 135.726 67.3261 134.074L9.82607 110.024C3.87441 107.534 0 101.714 0 95.2629V40.0496C0 33.5983 3.87441 27.7782 9.82606 25.2888L67.3261 1.23859Z";

const HEX_PLACEHOLDER_SRC = "/images/gallery-empty-hex.svg";

function SectionHeading({ children, className = "" }: { children: string; className?: string }) {
  const [firstWord, ...rest] = children.split(" ");
  return (
    <h3 className={`text-[14px] font-semibold ${className}`}>
      <span style={{ color: "var(--tott-dash-gold-label)" }}>{firstWord}</span>
      {rest.length > 0 && (
        <span style={{ color: "var(--foreground)" }}> {rest.join(" ")}</span>
      )}
    </h3>
  );
}

function HexThumb({ src }: { src?: string | null }) {
  const reactId = useId();
  const safe = reactId.replace(/[:]/g, "");
  const clipId = `hex-clip-${safe}`;
  const sheenId = `hex-sheen-${safe}`;
  const imageHref = src ?? HEX_PLACEHOLDER_SRC;

  return (
    <svg
      viewBox="0 0 147 136"
      className="block h-auto w-full"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden={!src}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={ROUNDED_HEX_PATH} />
        </clipPath>
        <linearGradient id={sheenId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--tott-home-hex-sheen)" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path d={ROUNDED_HEX_PATH} fill="var(--tott-home-hex-peek)" />
      <image
        href={imageHref}
        x={0}
        y={0}
        width={147}
        height={136}
        preserveAspectRatio="xMidYMid slice"
        clipPath={`url(#${clipId})`}
      />
      <path d={ROUNDED_HEX_PATH} fill={`url(#${sheenId})`} />
      <path
        d={ROUNDED_HEX_PATH}
        fill="none"
        stroke="var(--tott-home-hex-stroke)"
        strokeWidth={1}
      />
    </svg>
  );
}

function NumberBadge({ n }: { n: number }) {
  return (
    <div
      className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
      style={{ background: "var(--tott-elevated)", color: "var(--foreground)" }}
    >
      {n}
    </div>
  );
}

function PillTab({ active = false, children }: { active?: boolean; children: React.ReactNode }) {
  if (active) {
    return (
      <span
        className="inline-flex h-6 items-center justify-center rounded-full px-2.5 text-[11px] font-semibold"
        style={{ background: "var(--tott-accent-gold)", color: "var(--tott-auth-btn-text)" }}
      >
        {children}
      </span>
    );
  }
  return (
    <span
      className="inline-flex h-6 items-center justify-center rounded-full px-2.5 text-[11px] font-medium"
      style={{ background: "var(--tott-dash-control-bg)", color: "var(--tott-dash-control-fg)" }}
    >
      {children}
    </span>
  );
}

function StatCell({
  icon,
  label,
  value,
  showDivider,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  showDivider?: boolean;
}) {
  return (
    <div className="relative flex min-w-0 flex-1 flex-col items-center gap-2 px-2 py-1">
      {showDivider && (
        <span
          aria-hidden
          className="absolute start-0 top-1/2 hidden h-10 w-px -translate-y-1/2 sm:block"
          style={{ background: "var(--tott-dash-divider)" }}
        />
      )}
      <div style={{ color: "var(--foreground)" }}>{icon}</div>
      <span
        className="text-center text-[10px] font-medium uppercase tracking-wide"
        style={{ color: "var(--tott-muted)" }}
      >
        {label}
      </span>
      <span
        className="text-center text-[12px] font-medium leading-tight"
        style={{ color: "var(--foreground)" }}
      >
        {value}
      </span>
    </div>
  );
}

function StopRow({ stop, index, isFinish }: { stop: PreviewStop; index: number; isFinish: boolean }) {
  const titleRaw = stop.title.trim() || stop.locationName.trim();
  const title = isFinish && !stop.title.trim() ? "Finish" : titleRaw || `Stop ${index + 1}`;
  const lat = parseFloat(stop.latitude);
  const lng = parseFloat(stop.longitude);
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0);

  return (
    <div className="relative flex gap-4">
      <NumberBadge n={index + 1} />
      <div className="min-w-0 flex-1 pb-8">
        <h4 className="text-[15px] font-semibold leading-tight" style={{ color: "var(--foreground)" }}>
          {title}
        </h4>
        {stop.arrivalTime && (
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px]" style={{ color: "var(--tott-muted)" }}>
            <span className="flex items-center gap-1.5">
              <CalendarIcon size={14} />
              {formatDateLong(stop.arrivalTime)}
            </span>
            <span className="flex items-center gap-1.5">
              <ClockIcon size={14} />
              {formatTime(stop.arrivalTime)}
            </span>
          </div>
        )}
        {!isFinish && (
          <>
            {stop.description.trim() && (
              <p className="mt-3 text-[12px] leading-relaxed" style={{ color: "var(--tott-dash-control-fg)" }}>
                {stop.description}
              </p>
            )}
            <div
              className="mt-3 overflow-hidden rounded-2xl border"
              style={{ borderColor: "var(--tott-card-border)", background: "var(--tott-well-bg)" }}
            >
              {stop.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin/API URL
                <img src={stop.imageUrl} alt="" className="aspect-[16/8] w-full object-cover" />
              ) : (
                <div className="aspect-[16/8] w-full" />
              )}
            </div>
            {hasCoords && (
              <div className="mt-2 flex items-center gap-1.5 text-[11px]" style={{ color: "var(--tott-dash-gold-label)" }}>
                <PinIcon size={12} />
                <span>Lat: {lat.toFixed(4)}, Lng: {lng.toFixed(4)}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function TripPreviewModal({ open, onClose, data, trip }: TripPreviewModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); },
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
    () => namedStops.map((s, i) => ({ order: i + 1, lat: parseFloat(s.latitude), lng: parseFloat(s.longitude) })),
    [namedStops],
  );

  const galleryImages: string[] = useMemo(() => {
    if (!resolved) return [];
    const seen = new Set<string>();
    const out: string[] = [];
    for (const s of resolved.stops) {
      const u = s.imageUrl?.trim();
      if (!u || seen.has(u)) continue;
      seen.add(u);
      out.push(u);
      if (out.length >= 4) break;
    }
    return out;
  }, [resolved]);

  if (!open || !resolved || !mounted) return null;

  const filteredHighlights = resolved.highlights.filter((h) => h.trim());
  const priceNum = parseFloat(resolved.price);
  const priceDisplay =
    priceNum > 0
      ? tripDisplayPriceLabel({ price: resolved.price, max_price: resolved.priceCapFromApi, currency: resolved.currency })
      : "Free";
  const routeHeading = buildRouteHeading(resolved.stops, resolved.routeSummary);
  const stat = statusLabel(trip?.status, resolved.dataStatus);
  const locationLabel = (() => {
    const first = resolved.stops.find((s) => s.locationName.trim())?.locationName ?? "";
    const parts = first.split(",").map((x) => x.trim()).filter(Boolean);
    return parts[parts.length - 1] || resolved.category || "—";
  })();

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4">
      <button type="button" className="absolute inset-0 bg-black/45 backdrop-blur-md" onClick={onClose} aria-label="Close modal" />

      <div
        className="relative flex max-h-[94vh] w-full max-w-[757px] flex-col overflow-hidden rounded-[20px] border shadow-2xl"
        style={{ background: "var(--tott-dash-surface)", borderColor: "var(--tott-card-border)", color: "var(--foreground)" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="trip-preview-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute end-4 top-4 z-10 rounded-md p-1.5 transition-colors sm:end-5 sm:top-5"
          style={{ color: "var(--tott-muted)" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--tott-elevated)"; e.currentTarget.style.color = "var(--foreground)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--tott-muted)"; }}
          aria-label="Close"
        >
          <XIcon />
        </button>

        <div className="flex-1 overflow-y-auto">
          <div className="relative border-b px-4 pb-5 pt-5 sm:px-7" style={{ borderColor: "var(--tott-card-border)" }}>
            <div className="flex flex-wrap items-center gap-1.5 pe-10">
              <PillTab active>{priceDisplay}</PillTab>
              <PillTab>{difficultyLabel(resolved.difficulty)}</PillTab>
              <PillTab>{stat}</PillTab>
            </div>
            <h2
              id="trip-preview-title"
              className="mt-4 text-[18px] font-bold leading-tight sm:text-[20px]"
              style={{ color: "var(--foreground)" }}
            >
              {resolved.title.trim() || "Trip Name"}
            </h2>
            {routeHeading && (
              <p className="mt-1.5 text-[13px]" style={{ color: "var(--tott-dash-control-fg)" }}>
                {routeHeading}
              </p>
            )}
          </div>

          <div className="px-4 pb-6 pt-6 sm:px-7">
            <div className="relative">
              <div aria-hidden className="absolute inset-0" style={{ background: "var(--tott-card-border)", clipPath: OCTAGON_CLIP }} />
              <div aria-hidden className="absolute inset-px" style={{ background: "var(--tott-dash-surface-inset)", clipPath: OCTAGON_CLIP }} />
              <div className="relative grid grid-cols-2 gap-y-4 px-4 py-4 sm:flex sm:gap-y-0 sm:px-6">
                <StatCell icon={<CalendarIcon />} label="Date" value={formatDateLong(resolved.startDate)} />
                <StatCell icon={<ClockIcon />} label="Duration" value={formatStayLabel(resolved.startDate, resolved.endDate, resolved.durationHours)} showDivider />
                <StatCell icon={<PeopleIcon />} label="Group size" value={formatGroupSize(resolved.minParticipants, resolved.maxParticipants)} showDivider />
                <StatCell icon={<GlobeIcon />} label="Languages" value={formatLangList(resolved.languages)} showDivider />
                <StatCell icon={<MapPinIcon />} label="Location" value={locationLabel} showDivider />
              </div>
            </div>

            {resolved.description.trim() && (
              <section className="mt-8">
                <SectionHeading className="mb-2.5">Trip Description</SectionHeading>
                <p className="text-[13px] leading-[1.7]" style={{ color: "var(--tott-dash-control-fg)" }}>
                  {resolved.description}
                </p>
              </section>
            )}

            {filteredHighlights.length > 0 && (
              <section className="mt-8">
                <SectionHeading className="mb-3">Trip highlights</SectionHeading>
                <div className="grid grid-cols-1 gap-x-10 gap-y-3 sm:grid-cols-2">
                  {filteredHighlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-[13px]" style={{ color: "var(--tott-dash-control-fg)" }}>
                      <span className="mt-px shrink-0" style={{ color: "var(--tott-dash-gold-label)" }}>
                        <CheckIcon size={18} />
                      </span>
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="mt-8">
              <SectionHeading className="mb-4">Traveller&apos;s Gallery</SectionHeading>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[0, 1, 2, 3].map((i) => <HexThumb key={i} src={galleryImages[i]} />)}
              </div>
            </section>

            {namedStops.length > 0 && (
              <section className="mt-9">
                <SectionHeading className="mb-5">Trip Timeline &amp; Route Map</SectionHeading>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_240px]">
                  <div className="relative min-w-0">
                    {namedStops.length > 1 && (
                      <span
                        aria-hidden
                        className="pointer-events-none absolute bottom-10 top-10 start-5"
                        style={{ width: 0, borderInlineStart: "1.5px dashed var(--tott-card-border)" }}
                      />
                    )}
                    {namedStops.map((stop, i) => (
                      <StopRow key={i} stop={stop} index={i} isFinish={i === namedStops.length - 1 && namedStops.length > 1} />
                    ))}
                  </div>
                  <div
                    className="h-[300px] overflow-hidden rounded-2xl border lg:sticky lg:top-2 lg:h-[420px] lg:self-start"
                    style={{ borderColor: "var(--tott-card-border)" }}
                  >
                    <TripPreviewRouteMap points={mapPoints} className="h-full" />
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>

        <div
          className="flex shrink-0 flex-wrap items-center justify-end gap-3 border-t px-4 py-4 sm:px-7"
          style={{ borderColor: "var(--tott-card-border)" }}
        >
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 min-w-[78px] items-center justify-center rounded-lg px-4 text-[13px] font-medium transition-colors"
            style={{ background: "var(--tott-dash-control-bg)", color: "var(--tott-dash-control-fg)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--tott-dash-control-hover)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--tott-dash-control-bg)"; }}
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

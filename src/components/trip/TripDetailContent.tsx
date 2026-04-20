"use client";

import dynamic from "next/dynamic";
import { Link } from "@/i18n/navigation";
import { useEffect, useMemo, useState } from "react";
import { ShareYourStory } from "@/components/contribute/ShareYourStory";
import { TripHero } from "@/components/trip/TripHero";
import { TripDetailsBar, DEFAULT_TRIP_ICONS } from "@/components/trip/TripDetailsBar";
import { TripBookingForm } from "@/components/trip/TripBookingForm";
import { TripHighlights } from "@/components/trip/TripHighlights";
import { TripTimeline } from "@/components/trip/TripTimeline";
import { resolveTripCoverImage } from "@/lib/trip-cover-image";
import { theme } from "@/lib/theme";
import {
  getTripById,
  parseTripHighlights,
  parseTripLanguages,
  tripBookingFormFields,
  tripDisplayPriceLabel,
  tripStopImageUrl,
  type TripListItem,
  type TripStop,
} from "@/services/trips.service";

const TripPreviewRouteMap = dynamic(
  () => import("@/components/dashboard/admin/articles/articles-editor/trip/TripPreviewRouteMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-80 items-center justify-center rounded-xl border border-gray-700/30 text-sm text-gray-500">
        Loading map…
      </div>
    ),
  },
);

const FALLBACK_HERO = "/images/trip.png";

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

function formatTimeShort(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function formatStayLabel(startIso: string, endIso: string | null, durationHours: number): string {
  if (startIso && endIso) {
    const diff = new Date(endIso).getTime() - new Date(startIso).getTime();
    if (diff > 0) {
      const nights = Math.round(diff / 86_400_000);
      const days = Math.max(1, nights + 1);
      return `${nights} night${nights !== 1 ? "s" : ""}, ${days} day${days !== 1 ? "s" : ""}`;
    }
  }
  if (durationHours >= 24) {
    const d = Math.round(durationHours / 24);
    return `${d} day${d !== 1 ? "s" : ""}`;
  }
  if (durationHours > 0) return `${durationHours} hour${durationHours !== 1 ? "s" : ""}`;
  return "—";
}

function primaryLocationFromStops(stops: TripStop[] | undefined, category: string): string {
  const ordered = [...(stops ?? [])].sort((a, b) => a.stop_order - b.stop_order);
  const loc = ordered.find((s) => s.location?.name?.trim())?.location.name ?? "";
  const parts = loc.split(",").map((x) => x.trim()).filter(Boolean);
  if (parts.length >= 2) return parts[parts.length - 1]!;
  if (parts.length === 1) return parts[0]!;
  return category.trim() || "—";
}

function routeFromTo(trip: TripListItem): { from: string; to: string } {
  const r = trip.route_summary?.trim();
  if (r && r.includes("→")) {
    const [a, b] = r.split("→").map((s) => s.trim());
    return { from: a || "—", to: b || "—" };
  }
  const ordered = [...(trip.stops ?? [])].sort((a, b) => a.stop_order - b.stop_order);
  const names = ordered.map((s) => s.location?.name?.trim() || s.title?.trim()).filter(Boolean);
  if (names.length >= 2) return { from: names[0]!, to: names[names.length - 1]! };
  if (names.length === 1) return { from: names[0]!, to: names[0]! };
  return { from: r || "—", to: "—" };
}

function orderedStops(trip: TripListItem): TripStop[] {
  return [...(trip.stops ?? [])].sort((a, b) => a.stop_order - b.stop_order);
}

function stopsToTimelineEntries(stops: TripStop[]) {
  return stops.map((s) => ({
    title: s.title?.trim() || s.location.name || "Stop",
    date: s.arrival_time ? formatDateLong(s.arrival_time) : "—",
    time: s.arrival_time ? formatTimeShort(s.arrival_time) : "—",
    description: s.description?.trim() || "",
    location:
      s.location.latitude !== 0 || s.location.longitude !== 0
        ? `Lat: ${Number(s.location.latitude).toFixed(4)}, Lng: ${Number(s.location.longitude).toFixed(4)}`
        : s.location.name || undefined,
    imageUrl: tripStopImageUrl(s),
  }));
}

type TripDetailContentProps = {
  tripId: string;
};

export function TripDetailContent({ tripId }: TripDetailContentProps) {
  const [trip, setTrip] = useState<TripListItem | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    getTripById(tripId).then((t) => {
      if (!cancelled) setTrip(t);
    });
    return () => {
      cancelled = true;
    };
  }, [tripId]);

  const highlights = useMemo(() => {
    if (!trip) return [];
    return parseTripHighlights(trip.highlights);
  }, [trip]);

  const languages = useMemo(() => {
    if (!trip) return [];
    return parseTripLanguages(trip.languages);
  }, [trip]);

  const stops = useMemo(() => (trip ? orderedStops(trip) : []), [trip]);
  const timelineEntries = useMemo(() => stopsToTimelineEntries(stops), [stops]);

  const mapPoints = useMemo(
    () =>
      stops
        .filter((s) => s.location.name?.trim() || s.title?.trim())
        .map((s, i) => ({
          order: i + 1,
          lat: s.location.latitude,
          lng: s.location.longitude,
        })),
    [stops],
  );

  if (!tripId.trim()) {
    return (
      <div
        className="flex min-h-[50vh] items-center justify-center text-gray-400"
        style={{ backgroundColor: theme.pageBackground }}
      >
        Invalid trip link.
      </div>
    );
  }

  if (trip === undefined) {
    return (
      <div
        className="flex min-h-[50vh] items-center justify-center text-gray-400"
        style={{ backgroundColor: theme.pageBackground }}
      >
        Loading trip…
      </div>
    );
  }

  if (trip === null) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center" style={{ backgroundColor: theme.pageBackground }}>
        <h1 className="text-xl font-semibold text-foreground">Trip not found</h1>
        <p className="mt-2 text-sm text-gray-400">This trip may have been removed or the link is incorrect.</p>
        <Link href="/trip" className="mt-8 inline-block text-sm font-medium text-[#CBA158] hover:underline">
          View sample trip
        </Link>
      </div>
    );
  }

  const { from, to } = routeFromTo(trip);
  const heroImage = resolveTripCoverImage(trip.cover_image, FALLBACK_HERO);
  const detailItems = [
    {
      icon: DEFAULT_TRIP_ICONS.calendar,
      label: "Date",
      value: formatDateLong(trip.start_date),
    },
    {
      icon: DEFAULT_TRIP_ICONS.clock,
      label: "Duration",
      value: formatStayLabel(trip.start_date, trip.end_date, trip.duration_hours),
    },
    {
      icon: DEFAULT_TRIP_ICONS.group,
      label: "Group size",
      value: trip.max_participants > 0 ? `Up to ${trip.max_participants} people` : "—",
    },
    {
      icon: DEFAULT_TRIP_ICONS.language,
      label: "Languages",
      value: formatLangList(languages),
    },
    {
      icon: DEFAULT_TRIP_ICONS.location,
      label: "Location",
      value: primaryLocationFromStops(trip.stops, trip.category),
    },
  ];

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: theme.pageBackground }}>
      <TripHero
        image={heroImage}
        title={trip.title.trim() || "Trip"}
        price={tripDisplayPriceLabel(trip)}
        difficulty={
          trip.difficulty
            ? trip.difficulty.charAt(0).toUpperCase() + trip.difficulty.slice(1).toLowerCase()
            : "—"
        }
        from={from}
        to={to}
      />
      <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10 sm:py-14">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-8">
          <div className="flex min-w-0 flex-1 flex-col gap-10">
            <TripDetailsBar items={detailItems} />
            <div>
              <h2 className="mb-4 text-lg font-semibold text-foreground">About this trip</h2>
              <p className="text-sm leading-relaxed text-gray-400">
                {trip.description.trim() || "No description provided."}
              </p>
            </div>
            {highlights.length > 0 ? <TripHighlights highlights={highlights} /> : null}
            {stops.length > 0 ? (
              <TripTimeline
                entries={timelineEntries}
                mapSlot={<TripPreviewRouteMap points={mapPoints} className="min-h-[320px]" />}
              />
            ) : null}
          </div>
          <div className="w-full shrink-0 lg:sticky lg:top-6 lg:w-80">
            <TripBookingForm
              minPrice={trip.price}
              currency={trip.currency}
              fields={tripBookingFormFields(trip)}
            />
          </div>
        </div>
      </div>
      <ShareYourStory />
    </div>
  );
}

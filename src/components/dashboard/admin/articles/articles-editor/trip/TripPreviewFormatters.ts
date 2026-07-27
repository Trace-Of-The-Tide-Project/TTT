import type { EditorStop } from "./ItineraryBuilder";
import {
  parseTripHighlights,
  parseTripLanguages,
  tripMaxPrice,
  tripStopImageUrl,
  type TripListItem,
  type TripStop,
} from "@/services/trips.service";

export type PreviewStop = {
  title: string;
  description: string;
  arrivalTime: string;
  locationName: string;
  latitude: string;
  longitude: string;
  imageUrl: string | null;
};

export function editorStopToPreview(s: EditorStop): PreviewStop {
  return {
    title: s.title,
    description: s.description,
    arrivalTime: s.arrivalTime,
    locationName: s.locationName,
    latitude: s.latitude,
    longitude: s.longitude,
    imageUrl: s.imageUrl?.trim() || null,
  };
}

export type ResolvedTripPreview = {
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
  priceCapFromApi: string | null;
  languages: string[];
  highlights: string[];
  stops: PreviewStop[];
  routeSummary: string | null;
  /** Status straight off the trip record — takes precedence over dataStatus. */
  tripStatus?: string;
  dataStatus?: string;
};

/** Maps a full API trip record into the shared preview shape (archive list + preview page). */
export function resolveFromTrip(trip: TripListItem): ResolvedTripPreview {
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
    tripStatus: trip.status,
    dataStatus: undefined,
  };
}

export function tripStopToPreview(s: TripStop): PreviewStop {
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

export function formatLangList(langs: string[]): string {
  if (langs.length === 0) return "—";
  return langs.map((l) => LANG_LABELS[l.toUpperCase()] ?? l).join(", ");
}

export function formatDateLong(iso: string, locale?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });
}

export function formatTime(iso: string, locale?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
}

export function formatStayLabel(startIso: string, endIso: string, durationHours: number): string {
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

export function formatGroupSize(minP: number, maxP: number): string {
  if (maxP <= 0) return "—";
  if (minP > 0 && minP !== maxP) return `${minP}-${maxP} people`;
  return `${maxP} people`;
}

export function buildRouteHeading(stops: PreviewStop[], routeSummary: string | null): string {
  if (routeSummary?.trim()) return routeSummary.trim();
  const names = stops
    .map((s) => s.locationName.trim() || s.title.trim())
    .filter(Boolean);
  if (names.length === 0) return "";
  if (names.length === 1) return names[0]!;
  return `${names[0]} → ${names[names.length - 1]}`;
}

export function statusLabel(
  tripStatus: string | undefined,
  dataStatus: string | undefined,
  labels?: { published: string; draft: string },
): string {
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  if (tripStatus) {
    const s = tripStatus.toLowerCase();
    if (s === "published") return labels?.published ?? "Published";
    if (s === "draft") return labels?.draft ?? "Draft";
    return cap(tripStatus);
  }
  if (dataStatus) return cap(dataStatus);
  return labels?.draft ?? "Draft";
}

export function difficultyLabel(d: string): string {
  if (!d.trim()) return "—";
  return d.charAt(0).toUpperCase() + d.slice(1).toLowerCase();
}

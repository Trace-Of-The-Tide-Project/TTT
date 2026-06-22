import type { EditorStop } from "./ItineraryBuilder";
import { tripStopImageUrl, type TripStop } from "@/services/trips.service";

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

export function formatDateLong(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export function formatTime(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
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
  dataStatus: string | undefined
): string {
  if (tripStatus) {
    const s = tripStatus.toLowerCase();
    if (s === "published") return "Published";
    if (s === "draft") return "Draft";
    return tripStatus.charAt(0).toUpperCase() + tripStatus.slice(1);
  }
  if (dataStatus) {
    return dataStatus.charAt(0).toUpperCase() + dataStatus.slice(1);
  }
  return "Draft";
}

export function difficultyLabel(d: string): string {
  if (!d.trim()) return "—";
  return d.charAt(0).toUpperCase() + d.slice(1).toLowerCase();
}

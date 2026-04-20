import { api } from "./api";
import type { ApplicationFormField } from "./open-calls.service";

/** Default “Join this adventure” fields (same idea as static TripBookingForm). */
export const DEFAULT_TRIP_BOOKING_FORM_FIELDS: ApplicationFormField[] = [
  { name: "full_name", type: "text", required: true },
  { name: "email", type: "email", required: true },
  { name: "message", type: "textarea", required: false },
];

export type TripStopLocation = {
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  address?: string;
};

export type TripStop = {
  stop_order: number;
  title: string;
  description: string;
  arrival_time?: string | null;
  duration_minutes?: number;
  /** Primary field for stop photo from API */
  image_url?: string | null;
  /** Some responses use `image` instead */
  image?: string | null;
  location: TripStopLocation;
};

/** Non-empty image URL for a stop, if the API provided one. */
export function tripStopImageUrl(stop: TripStop): string | null {
  const u = stop.image_url?.trim() || stop.image?.trim();
  return u || null;
}

export type CreateTripPayload = {
  title: string;
  description: string;
  cover_image?: string;
  category: string;
  route_summary?: string;
  start_date: string;
  end_date?: string;
  /** Minimum contribution; same field the API already expects. */
  price: string;
  currency: string;
  max_participants: number;
  min_participants?: number;
  status: "draft" | "published";
  difficulty: string;
  duration_hours: number;
  tags?: string[];
  languages?: string[];
  highlights?: string[];
  moderator_name?: string;
  stops: TripStop[];
};

export type TripListItem = {
  id: string;
  title: string;
  description: string;
  cover_image: string | null;
  category: string;
  route_summary: string | null;
  start_date: string;
  end_date: string | null;
  price: string;
  /** Optional; some APIs may send camelCase `maxPrice`. */
  max_price?: string | null;
  maxPrice?: string | null;
  currency: string;
  max_participants: number;
  min_participants?: number;
  status: string;
  difficulty: string;
  duration_hours: number;
  tags: string | null;
  /** Offered languages (codes or labels), separate from tags */
  languages?: string[] | string | null;
  /** JSON string, comma-separated string, or string[] depending on API */
  highlights?: string[] | string | null;
  moderator_name: string | null;
  created_by: string;
  createdAt: string;
  updatedAt: string;
  creator?: { id: string; username: string; full_name: string };
  stops?: TripStop[];
};

/** Tags from API: JSON array or comma-separated string. */
export function parseTripTags(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((t: unknown): t is string => typeof t === "string" && Boolean(t.trim()))
      : [];
  } catch {
    return raw.split(",").map((t) => t.trim()).filter(Boolean);
  }
}

/** Trip `languages` field: string[], JSON string, or comma-separated string. */
export function parseTripLanguages(raw: string | string[] | null | undefined): string[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    return raw.filter((l): l is string => typeof l === "string" && Boolean(l.trim())).map((l) => l.trim());
  }
  return parseTripTags(raw);
}

/** Highlights: array, JSON string, or comma-separated text. */
export function parseTripHighlights(raw: string | string[] | null | undefined): string[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    return raw.filter((h): h is string => typeof h === "string" && Boolean(h.trim()));
  }
  const s = raw.trim();
  if (!s) return [];
  try {
    const parsed = JSON.parse(s) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((h): h is string => typeof h === "string" && Boolean(h.trim()));
    }
  } catch {
    /* not JSON */
  }
  return s.split(",").map((t) => t.trim()).filter(Boolean);
}

/** Resolved maximum trip price for UI (supports snake_case or camelCase from API). */
export function tripMaxPrice(trip: TripListItem): string | null {
  const raw = trip.max_price ?? trip.maxPrice;
  if (raw == null) return null;
  const s = String(raw).trim();
  return s || null;
}

/** Compact amount for range ends and sliders (e.g. `$600` or `600 EUR`). */
export function formatTripPriceAmount(value: number, currency: string): string {
  const cur = (currency || "USD").toUpperCase();
  const n = Math.round(value * 100) / 100;
  const s = Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, "");
  return cur === "USD" ? `$${s}` : `${s} ${cur}`;
}

/** Hero / summary line: legacy capped range, “from” minimum, fixed single, or Free. */
export function tripDisplayPriceLabel(
  trip: Pick<TripListItem, "price" | "currency"> & { max_price?: string | null; maxPrice?: string | null },
): string {
  const min = parseFloat(trip.price);
  const maxStr = trip.max_price ?? trip.maxPrice;
  const max = maxStr != null && String(maxStr).trim() !== "" ? parseFloat(String(maxStr)) : NaN;
  const cur = (trip.currency || "USD").toUpperCase();
  if (!Number.isFinite(min) || min <= 0) return "Free";
  if (Number.isFinite(max) && max > min) {
    return `${formatTripPriceAmount(min, trip.currency || "USD")} – ${formatTripPriceAmount(max, trip.currency || "USD")}`;
  }
  return `From ${formatTripPriceAmount(min, trip.currency || "USD")}`;
}

/** True when the join form should show the pay-from-minimum slider (paid trip). */
export function tripHasMinimumContribution(price: string): boolean {
  const min = parseFloat(price);
  return Number.isFinite(min) && min > 0;
}

/**
 * Soft upper bound for the join-form slider only (not stored). Lets the control extend
 * “upward” without a configured maximum.
 */
export function sliderUiMaxForMinPrice(min: number): number {
  if (!Number.isFinite(min) || min <= 0) return 0;
  return Math.max(Math.round(min * 25), Math.round(min + 8000), 3000);
}

/** Default join form for trip pages (trips API does not expose stored form fields). */
export function tripBookingFormFields(_trip: TripListItem): ApplicationFormField[] {
  return DEFAULT_TRIP_BOOKING_FORM_FIELDS.map((f) => JSON.parse(JSON.stringify(f)));
}

export async function getTripById(id: string): Promise<TripListItem | null> {
  try {
    const { data } = await api.get<unknown>(`/trips/${encodeURIComponent(id)}`);
    if (data && typeof data === "object" && "data" in data) {
      const inner = (data as { data: unknown }).data;
      if (inner && typeof inner === "object") return inner as TripListItem;
    }
    if (data && typeof data === "object") return data as TripListItem;
    return null;
  } catch {
    return null;
  }
}

export async function createTrip(payload: CreateTripPayload): Promise<unknown> {
  const { data } = await api.post<unknown>("/trips", payload);
  return data;
}

export async function getTrips(): Promise<TripListItem[]> {
  const { data } = await api.get<TripListItem[] | { data: TripListItem[] }>("/trips");
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && "data" in data && Array.isArray(data.data))
    return data.data;
  return [];
}

export async function deleteTrip(id: string): Promise<void> {
  await api.delete(`/trips/${encodeURIComponent(id)}`);
}

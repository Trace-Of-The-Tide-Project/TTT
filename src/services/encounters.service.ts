import { api } from "./api";
import { serverGet } from "@/lib/api/isomorphic-fetch";

export type EncounterListItem = {
  id: string;
  title: string;
  about?: string | null;
  type?: string | null;
  date?: string | null;
  hero_image?: string | null;
  status?: "draft" | "published" | null;
};

export type EncounterScheduleItem = {
  id?: string;
  stop_order?: number | null;
  title?: string | null;
  description?: string | null;
  arrival_time?: string | null;
  duration_minutes?: number | null;
  lat?: number | string | null;
  lng?: number | string | null;
};

/** Full encounter detail (`GET /encounters/{id}`). */
export type EncounterDetail = EncounterListItem & {
  location?: string | null;
  chips?: string[] | null;
  duration?: string | null;
  group_size?: string | null;
  languages?: string | null;
  highlights?: string[] | null;
  tip_price?: string | null;
  /** Per-stop schedule rows, if the encounter has them. */
  schedule?: EncounterScheduleItem[] | null;
  /** Alternative key some servers emit. */
  stops?: EncounterScheduleItem[] | null;
};

export type BookEncounterPayload = {
  name: string;
  email: string;
  message?: string;
};

export type BookEncounterResponse = {
  id?: string;
  status?: string;
  message?: string;
};

type Envelope<T> = { data?: T[] };

export async function listEncountersServer(opts?: {
  limit?: number;
  page?: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<EncounterListItem[]> {
  const raw = await serverGet<
    Envelope<EncounterListItem> | EncounterListItem[]
  >("/encounters", opts);
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  return raw.data ?? [];
}

/** Unwraps the `{ status, results, data }` envelope the backend wraps
 * single records in. Tolerates a bare record too. */
function unwrapOne(raw: unknown): EncounterDetail | null {
  if (!raw || typeof raw !== "object") return null;
  if ("data" in (raw as object)) {
    return ((raw as { data?: EncounterDetail }).data ?? null);
  }
  return raw as EncounterDetail;
}

export async function getEncounterServer(
  id: string,
): Promise<EncounterDetail | null> {
  return unwrapOne(await serverGet<unknown>(`/encounters/${id}`));
}

/** POST /encounters/{id}/book — public, guest-allowed. */
export async function bookEncounter(
  id: string,
  payload: BookEncounterPayload,
): Promise<BookEncounterResponse> {
  const { data } = await api.post<BookEncounterResponse>(
    `/encounters/${id}/book`,
    payload,
  );
  return data ?? {};
}

// ─── Admin: encounter bookings ──────────────────────────────────────
// The backend does NOT currently expose any way to list bookings or
// change their status. Both `getEncounter` and `listEncountersServer`
// return only the schedule. The two functions below target the
// *expected* endpoint shape the backend dev needs to add:
//   GET   /encounter-bookings              → list all bookings
//   PATCH /encounter-bookings/{id}         → { status: approved|rejected }
// They 404 today; the UI catches the error and surfaces it as a toast.

export type EncounterBooking = {
  id: string;
  encounter_id?: string | null;
  name: string;
  email: string;
  message?: string | null;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  /** Attached client-side from the parent encounter for display. */
  encounter_title?: string;
};

export type EncounterBookingStatus = "approved" | "rejected" | "pending";

export async function listAllEncounterBookings(): Promise<EncounterBooking[]> {
  const { data } = await api.get<unknown>("/encounter-bookings");
  const raw =
    data && typeof data === "object" && "data" in (data as object)
      ? (data as { data?: unknown }).data
      : data;
  return Array.isArray(raw) ? (raw as EncounterBooking[]) : [];
}

export async function updateEncounterBookingStatus(
  id: string,
  status: EncounterBookingStatus,
): Promise<void> {
  await api.patch(`/encounter-bookings/${encodeURIComponent(id)}`, { status });
}

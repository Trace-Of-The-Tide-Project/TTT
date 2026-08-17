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
  order?: number | null;
  title?: string | null;
  start_date?: string | null;
  start_time?: string | null;
  body?: string | null;
  lat?: number | string | null;
  lng?: number | string | null;
  // Trip-like shape the public detail page renders (kept for parity).
  stop_order?: number | null;
  description?: string | null;
  arrival_time?: string | null;
  duration_minutes?: number | null;
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
// Backend ships GET /encounters/bookings + PATCH /encounters/
// bookings/{id} with {status}.

export type EncounterBooking = {
  id: string;
  encounter_id?: string | null;
  name: string;
  email: string;
  message?: string | null;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  /** May be included by the backend list response; otherwise the
   *  UI shows the encounter id. */
  encounter_title?: string;
};

export type EncounterBookingStatus = "approved" | "rejected" | "pending";

/** GET /encounters/bookings — admin/editor. */
export async function listAllEncounterBookings(): Promise<EncounterBooking[]> {
  const { data } = await api.get<unknown>("/encounters/bookings");
  const raw =
    data && typeof data === "object" && "data" in (data as object)
      ? (data as { data?: unknown }).data
      : data;
  return Array.isArray(raw) ? (raw as EncounterBooking[]) : [];
}

/** PATCH /encounters/bookings/{id} — admin/editor. */
export async function updateEncounterBookingStatus(
  id: string,
  status: EncounterBookingStatus,
): Promise<void> {
  await api.patch(`/encounters/bookings/${encodeURIComponent(id)}`, { status });
}

// ─── Admin: encounter CRUD + schedule ────────────────────────────

export type EncounterScheduleInput = {
  order?: number;
  title?: string | null;
  start_date?: string | null;
  start_time?: string | null;
  body?: string | null;
  lat?: number | null;
  lng?: number | null;
};

/** Admin create/update payload — all CreateEncounterDto fields. */
export type EncounterInput = {
  title: string;
  location?: string | null;
  hero_image?: string | null;
  chips?: string[] | null;
  date?: string | null;
  duration?: string | null;
  group_size?: string | null;
  languages?: string | null;
  about?: string | null;
  highlights?: string[] | null;
  tip_price?: string | null;
  type?: string | null;
  status?: "draft" | "published" | null;
  schedule?: EncounterScheduleInput[] | null;
};

/** Full admin list item (incl. drafts). */
export type EncounterAdmin = EncounterListItem & {
  location?: string | null;
  chips?: string[] | null;
  duration?: string | null;
  group_size?: string | null;
  languages?: string | null;
  highlights?: string[] | null;
  tip_price?: string | null;
  schedule?: EncounterScheduleItem[] | null;
};

function unwrapEncounter(raw: unknown): EncounterAdmin | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const d = ("data" in o ? o.data : o) as Record<string, unknown> | undefined;
  if (!d || typeof d.id !== "string" || typeof d.title !== "string") return null;
  return d as unknown as EncounterAdmin;
}

export type GetEncountersAdminParams = {
  limit?: number;
  page?: number;
  search?: string;
};

/** GET /encounters/admin — includes drafts (admin/editor). */
export async function listEncountersAdmin(opts?: GetEncountersAdminParams): Promise<EncounterAdmin[]> {
  const { data } = await api.get<unknown>("/encounters/admin", { params: opts });
  const body = data && typeof data === "object" && "data" in (data as object)
    ? (data as { data?: unknown }).data
    : data;
  return Array.isArray(body) ? (body as EncounterAdmin[]) : [];
}

/** GET /encounters/:id — includes schedule (admin/editor). */
export async function getEncounterAdmin(id: string): Promise<EncounterAdmin | null> {
  const { data } = await api.get<unknown>(`/encounters/${encodeURIComponent(id)}`);
  return unwrapEncounter(data);
}

/** POST /encounters — create (admin/editor). */
export async function createEncounter(payload: EncounterInput): Promise<EncounterAdmin | null> {
  const { data } = await api.post<unknown>("/encounters", payload);
  return unwrapEncounter(data);
}

/** PATCH /encounters/:id — update (admin/editor). */
export async function updateEncounter(
  id: string,
  payload: Partial<EncounterInput>,
): Promise<EncounterAdmin | null> {
  const { data } = await api.patch<unknown>(`/encounters/${encodeURIComponent(id)}`, payload);
  return unwrapEncounter(data);
}

/** DELETE /encounters/:id — admin only. */
export async function deleteEncounter(id: string): Promise<void> {
  await api.delete(`/encounters/${encodeURIComponent(id)}`);
}

/** POST /encounters/:id/schedule — add a schedule stop. */
export async function addScheduleStop(
  id: string,
  payload: EncounterScheduleInput,
): Promise<EncounterScheduleItem | null> {
  const { data } = await api.post<unknown>(`/encounters/${encodeURIComponent(id)}/schedule`, payload);
  return unwrapScheduleItem(data);
}

/** PATCH /encounters/:id/schedule/:stopId — update a schedule stop. */
export async function updateScheduleStop(
  id: string,
  stopId: string,
  payload: Partial<EncounterScheduleInput>,
): Promise<EncounterScheduleItem | null> {
  const { data } = await api.patch<unknown>(
    `/encounters/${encodeURIComponent(id)}/schedule/${encodeURIComponent(stopId)}`,
    payload,
  );
  return unwrapScheduleItem(data);
}

/** DELETE /encounters/:id/schedule/:stopId — remove a schedule stop. */
export async function deleteScheduleStop(id: string, stopId: string): Promise<void> {
  await api.delete(
    `/encounters/${encodeURIComponent(id)}/schedule/${encodeURIComponent(stopId)}`,
  );
}

/** PATCH /encounters/:id/schedule/reorder — set stop order by id array. */
export async function reorderSchedule(
  id: string,
  stopIds: string[],
): Promise<EncounterScheduleItem[]> {
  const { data } = await api.patch<unknown>(
    `/encounters/${encodeURIComponent(id)}/schedule/reorder`,
    { stopIds },
  );
  const body = data && typeof data === "object" && "data" in (data as object)
    ? (data as { data?: unknown }).data
    : data;
  return Array.isArray(body) ? (body as EncounterScheduleItem[]) : [];
}

function unwrapScheduleItem(raw: unknown): EncounterScheduleItem | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const d = ("data" in o ? o.data : o) as Record<string, unknown> | undefined;
  return d ? (d as unknown as EncounterScheduleItem) : null;
}

import { api } from "./api";
import { serverGet } from "@/lib/api/isomorphic-fetch";

/** A workshop summary as returned by `GET /workshops` list. */
export type WorkshopListItem = {
  id: string;
  title: string;
  body?: string | null;
  duration_label?: string | null;
  format_label?: string | null;
  status?: "draft" | "published" | null;
};

/** Full workshop detail (`GET /workshops/{id}`). */
export type WorkshopDetail = WorkshopListItem & {
  description?: string | null;
  what_youll_do?: string[] | null;
  what_youll_gain?: string[] | null;
};

export type ApplyToWorkshopPayload = {
  name: string;
  email: string;
  experience_level?: string;
};

export type ApplyToWorkshopResponse = {
  id?: string;
  status?: string;
  message?: string;
};

type Envelope<T> = { data?: T[] };

/** Unwraps the `{ status, results, data }` envelope the backend wraps
 * single records in. Tolerates a bare record too. */
function unwrapOne(raw: unknown): WorkshopDetail | null {
  if (!raw || typeof raw !== "object") return null;
  if ("data" in (raw as object)) {
    return ((raw as { data?: WorkshopDetail }).data ?? null);
  }
  return raw as WorkshopDetail;
}

/** Server-side fetch — used in page.tsx server components. */
export async function listWorkshopsServer(opts?: {
  limit?: number;
  page?: number;
  search?: string;
}): Promise<WorkshopListItem[]> {
  const raw = await serverGet<Envelope<WorkshopListItem> | WorkshopListItem[]>(
    "/workshops",
    opts,
  );
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  return raw.data ?? [];
}

/** Server-side detail fetch — used by the modal pre-fetch if SSR'd. */
export async function getWorkshopServer(
  id: string,
): Promise<WorkshopDetail | null> {
  return unwrapOne(await serverGet<unknown>(`/workshops/${id}`));
}

/** Client-side detail fetch — used when the Workshop Detail modal opens. */
export async function getWorkshop(id: string): Promise<WorkshopDetail> {
  const { data } = await api.get<unknown>(`/workshops/${id}`);
  return (unwrapOne(data) ?? ({} as WorkshopDetail));
}

/** POST /workshops/{id}/apply — public, guest-allowed. */
export async function applyToWorkshop(
  id: string,
  payload: ApplyToWorkshopPayload,
): Promise<ApplyToWorkshopResponse> {
  const { data } = await api.post<ApplyToWorkshopResponse>(
    `/workshops/${id}/apply`,
    payload,
  );
  return data ?? {};
}

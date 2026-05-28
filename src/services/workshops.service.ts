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

/** A single application to a workshop (embedded in `GET /workshops/{id}`). */
export type WorkshopApplication = {
  id: string;
  workshop_id?: string | null;
  name: string;
  email: string;
  experience_level?: string | null;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  /** Attached client-side from the parent workshop for display. */
  workshop_title?: string;
};

/** Full workshop detail (`GET /workshops/{id}`). */
export type WorkshopDetail = WorkshopListItem & {
  description?: string | null;
  what_youll_do?: string[] | null;
  what_youll_gain?: string[] | null;
  /** Applications are embedded in the detail response. */
  applications?: WorkshopApplication[] | null;
};

export type WorkshopApplicationStatus = "approved" | "rejected" | "pending";

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

// ─── Admin: workshop applications ───────────────────────────────────
// The backend currently exposes applications only nested inside
// `GET /workshops/{id}`. There's no dedicated list endpoint and no
// approve/reject route, so for now the admin screen aggregates the
// nested arrays from `/workshops/admin` (drafts included). The
// `updateWorkshopApplicationStatus` helper below targets the *expected*
// endpoint name (`PATCH /workshop-applications/{id}`) so once the
// backend adds it, no UI changes are needed.

export async function listAllWorkshopsForAdmin(): Promise<WorkshopDetail[]> {
  const { data } = await api.get<unknown>("/workshops/admin");
  const raw = data && typeof data === "object" && "data" in (data as object)
    ? (data as { data?: unknown }).data
    : data;
  return Array.isArray(raw) ? (raw as WorkshopDetail[]) : [];
}

/**
 * Fetch every workshop's detail in parallel and flatten the embedded
 * `applications` arrays. Each entry is augmented with `workshop_title`
 * so the admin list can show which workshop the applicant chose.
 */
export async function listAllWorkshopApplications(): Promise<
  WorkshopApplication[]
> {
  const workshops = await listAllWorkshopsForAdmin();
  const details = await Promise.all(
    workshops.map((w) =>
      getWorkshop(w.id).catch(() => null as WorkshopDetail | null),
    ),
  );
  const out: WorkshopApplication[] = [];
  for (const w of details) {
    if (!w?.applications) continue;
    for (const a of w.applications) {
      out.push({ ...a, workshop_id: a.workshop_id ?? w.id, workshop_title: w.title });
    }
  }
  // Newest first.
  out.sort(
    (a, b) =>
      new Date(b.createdAt ?? 0).getTime() -
      new Date(a.createdAt ?? 0).getTime(),
  );
  return out;
}

/**
 * Set a workshop-application status. Targets the expected backend
 * endpoint `PATCH /workshop-applications/{id}` with `{status}`. Until
 * the backend ships that route this throws (caught by the mutation,
 * surfaced as a toast) — see the project doc for the exact request
 * the backend dev needs to implement.
 */
export async function updateWorkshopApplicationStatus(
  id: string,
  status: WorkshopApplicationStatus,
): Promise<void> {
  await api.patch(`/workshop-applications/${encodeURIComponent(id)}`, {
    status,
  });
}

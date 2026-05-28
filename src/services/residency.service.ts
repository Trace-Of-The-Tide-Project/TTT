import { api } from "./api";

export type ApplyForResidencyPayload = {
  name: string;
  email: string;
  why_join?: string;
  working_on?: string;
};

export type ApplyForResidencyResponse = {
  id?: string;
  status?: string;
  message?: string;
};

/** POST /residency/apply — public, guest-allowed. */
export async function applyForResidency(
  payload: ApplyForResidencyPayload,
): Promise<ApplyForResidencyResponse> {
  const { data } = await api.post<ApplyForResidencyResponse>(
    "/residency/apply",
    payload,
  );
  return data ?? {};
}

// ─── Admin review (Writing Room residency applications) ─────────────

export type ResidencyApplication = {
  id: string;
  name: string;
  email: string;
  why_join?: string | null;
  working_on?: string | null;
  /** "pending" | "approved" | "rejected" (backend uses a free string). */
  status: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ResidencyApplicationStatus = "approved" | "rejected" | "pending";

function unwrapList(raw: unknown): ResidencyApplication[] {
  if (!raw || typeof raw !== "object") return [];
  const o = raw as Record<string, unknown>;
  if (Array.isArray(o.data)) return o.data as ResidencyApplication[];
  if (Array.isArray(raw)) return raw as unknown as ResidencyApplication[];
  return [];
}

/** GET /residency/applications — list all applications (admin/editor). */
export async function getResidencyApplications(): Promise<
  ResidencyApplication[]
> {
  const { data } = await api.get<unknown>("/residency/applications");
  return unwrapList(data);
}

/** PATCH /residency/applications/:id — set application status. */
export async function updateResidencyApplicationStatus(
  id: string,
  status: ResidencyApplicationStatus,
): Promise<void> {
  await api.patch(`/residency/applications/${encodeURIComponent(id)}`, {
    status,
  });
}

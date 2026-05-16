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

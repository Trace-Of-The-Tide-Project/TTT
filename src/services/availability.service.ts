import { api } from "./api";

export type AvailabilityStatus = "available" | "busy" | "away";

export interface AvailabilityData {
  status: AvailabilityStatus;
  message: string;
}

export interface UpdateAvailabilityInput {
  status?: AvailabilityStatus;
  message?: string;
}

const STATUSES: readonly AvailabilityStatus[] = ["available", "busy", "away"];

function coerceStatus(v: unknown): AvailabilityStatus {
  return typeof v === "string" && (STATUSES as readonly string[]).includes(v)
    ? (v as AvailabilityStatus)
    : "available";
}

function normalize(raw: unknown): AvailabilityData {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    status: coerceStatus(o.status),
    message: typeof o.message === "string" ? o.message : o.message == null ? "" : String(o.message),
  };
}

/** GET /author/settings/availability — caller-scoped; defaults applied server-side. */
export async function getAvailability(): Promise<AvailabilityData> {
  const { data } = await api.get<unknown>("/author/settings/availability");
  return normalize(data);
}

/** PATCH /author/settings/availability — partial update; empty message clears it. */
export async function updateAvailability(
  input: UpdateAvailabilityInput,
): Promise<AvailabilityData> {
  const { data } = await api.patch<unknown>("/author/settings/availability", input);
  return normalize(data);
}

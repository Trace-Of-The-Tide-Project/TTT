import { api } from "./api";

export type ProfileVisibility = "public" | "followers_only" | "private";

export interface PrivacyData {
  profile_visibility: ProfileVisibility;
  show_email: boolean;
  show_activity: boolean;
  allow_follows: boolean;
}

export interface UpdatePrivacyInput {
  profile_visibility?: ProfileVisibility;
  show_email?: boolean;
  show_activity?: boolean;
  allow_follows?: boolean;
}

const VISIBILITIES: readonly ProfileVisibility[] = ["public", "followers_only", "private"];

function coerceVisibility(v: unknown): ProfileVisibility {
  return typeof v === "string" && (VISIBILITIES as readonly string[]).includes(v)
    ? (v as ProfileVisibility)
    : "public";
}

function normalize(raw: unknown): PrivacyData {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    profile_visibility: coerceVisibility(o.profile_visibility),
    show_email: Boolean(o.show_email),
    show_activity: Boolean(o.show_activity),
    allow_follows: Boolean(o.allow_follows),
  };
}

/** GET /author/settings/privacy — caller-scoped; defaults applied server-side. */
export async function getPrivacy(): Promise<PrivacyData> {
  const { data } = await api.get<unknown>("/author/settings/privacy");
  return normalize(data);
}

/** PATCH /author/settings/privacy — partial update. */
export async function updatePrivacy(input: UpdatePrivacyInput): Promise<PrivacyData> {
  const { data } = await api.patch<unknown>("/author/settings/privacy", input);
  return normalize(data);
}

import { api } from "./api";
import { uploadArticleAssetPath } from "./uploads.service";

/** The four known social presets plus a free-form "other" and a list of extras.
 * Persisted as a JSON string in the `social_links` TEXT column. */
export interface ProfileSocialLinks {
  facebook: string;
  twitter: string;
  instagram: string;
  linkedin: string;
  other: string;
  extra: string[];
}

export interface ProfileData {
  id: string;
  username: string;
  full_name: string;
  email: string;
  /** Stable relative GCS path (sent back on save). */
  avatar: string | null;
  /** Signed, time-limited URL for display only — never persist this. */
  avatar_url: string | null;
  display_name: string;
  company: string;
  job_title: string;
  personal_link: string;
  location: string;
  about: string;
  social_links: ProfileSocialLinks;
}

export interface UpdateProfileInput {
  full_name?: string;
  email?: string;
  avatar?: string;
  company?: string;
  job_title?: string;
  personal_link?: string;
  location?: string;
  about?: string;
  /** JSON string of {@link ProfileSocialLinks}. */
  social_links?: string;
}

const EMPTY_SOCIAL: ProfileSocialLinks = {
  facebook: "",
  twitter: "",
  instagram: "",
  linkedin: "",
  other: "",
  extra: [],
};

function str(v: unknown): string {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

/** Parse the stored social_links JSON defensively — legacy rows may be empty,
 * malformed, or differently shaped. Always returns a full object. */
export function parseSocialLinks(raw: unknown): ProfileSocialLinks {
  if (!raw) return { ...EMPTY_SOCIAL };
  let obj: Record<string, unknown> | null = null;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") obj = parsed as Record<string, unknown>;
    } catch {
      obj = null;
    }
  } else if (typeof raw === "object") {
    obj = raw as Record<string, unknown>;
  }
  if (!obj) return { ...EMPTY_SOCIAL };
  const extraRaw = obj.extra;
  const extra = Array.isArray(extraRaw)
    ? extraRaw.filter((x): x is string => typeof x === "string")
    : [];
  return {
    facebook: str(obj.facebook),
    twitter: str(obj.twitter),
    instagram: str(obj.instagram),
    linkedin: str(obj.linkedin),
    other: str(obj.other),
    extra,
  };
}

function normalizeProfile(raw: unknown): ProfileData {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const p = (o.profile && typeof o.profile === "object"
    ? o.profile
    : {}) as Record<string, unknown>;
  return {
    id: str(o.id),
    username: str(o.username),
    full_name: str(o.full_name),
    email: str(o.email),
    avatar: typeof p.avatar === "string" && p.avatar ? p.avatar : null,
    avatar_url: typeof p.avatar_url === "string" && p.avatar_url ? p.avatar_url : null,
    display_name: str(p.display_name),
    company: str(p.company),
    job_title: str(p.job_title),
    personal_link: str(p.personal_link),
    location: str(p.location),
    about: str(p.about),
    social_links: parseSocialLinks(p.social_links),
  };
}

/** GET /author/settings/profile — the caller's profile (caller-scoped server-side). */
export async function getProfile(): Promise<ProfileData> {
  const { data } = await api.get<unknown>("/author/settings/profile");
  return normalizeProfile(data);
}

/** PATCH /author/settings/profile — update the caller's profile. */
export async function updateProfile(input: UpdateProfileInput): Promise<ProfileData> {
  const { data } = await api.patch<unknown>("/author/settings/profile", input);
  return normalizeProfile(data);
}

/** Upload an avatar via POST /upload and return its STABLE relative path.
 * We persist the path (not the signed URL, which expires) and let the backend
 * sign it on read. */
export async function uploadAvatar(file: File): Promise<string> {
  return uploadArticleAssetPath(file);
}

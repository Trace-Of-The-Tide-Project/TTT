import { api } from "./api";
import { serverGet } from "@/lib/api/isomorphic-fetch";
import { resolveArticleMediaSrc } from "@/lib/content/article-media-url";

/**
 * Writer profile — surface for the "Follow our Writers" row. The
 * backend exposes both `GET /writers` (full list) and
 * `GET /writers/featured` (the homepage strip). We type the union
 * leniently because OpenAPI doesn't declare the response shape.
 */
export type WriterSocialLinks = {
  website?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
} & Record<string, string | undefined>;

export type WriterProfile = {
  id: string;
  user_id?: string | null;
  /** Legacy fields kept for the magazine homepage strip. */
  display_name?: string | null;
  bio?: string | null;
  avatar?: string | null;
  cover_image?: string | null;
  edition?: string | null;
  /** Full profile fields (writer_profiles table). */
  pen_name?: string | null;
  headline?: string | null;
  bio_long?: string | null;
  avatar_url?: string | null;
  featured?: boolean;
  social_links?: WriterSocialLinks | null;
  creator_kind?: string | null;
  location?: string | null;
  themes?: string[] | null;
  quote?: string | null;
  collaborations?: string | null;
  recognition?: string | null;
  /** Backend DECIMAL — may arrive as a numeric string; coerce with Number()
   * before sending back via WriterProfilePayload. */
  monthly_goal?: number | string | null;
  createdAt?: string;
  updatedAt?: string;
  /** When the backend joins the user record onto the writer profile
   * it commonly nests under `user`. */
  user?: {
    id: string;
    username?: string | null;
    full_name?: string | null;
    profile?: {
      avatar?: string | null;
      display_name?: string | null;
      social_links?: string | null;
    } | null;
  } | null;
};

function unwrapList(raw: unknown): WriterProfile[] {
  if (!raw || typeof raw !== "object") return [];
  const o = raw as Record<string, unknown>;
  if (Array.isArray(o.data)) return o.data as WriterProfile[];
  if (Array.isArray(o)) return o as unknown as WriterProfile[];
  return [];
}

export type GetWritersParams = {
  search?: string;
  page?: number;
  limit?: number;
};

export async function getFeaturedWriters(): Promise<WriterProfile[]> {
  if (typeof window === "undefined") {
    return unwrapList(await serverGet<unknown>("/writers/featured"));
  }
  try {
    const { data } = await api.get<unknown>("/writers/featured");
    return unwrapList(data);
  } catch {
    return [];
  }
}

export async function getWriters(
  params?: GetWritersParams,
): Promise<WriterProfile[]> {
  if (typeof window === "undefined") {
    return unwrapList(await serverGet<unknown>("/writers", params));
  }
  try {
    const { data } = await api.get<unknown>("/writers", { params });
    return unwrapList(data);
  } catch {
    return [];
  }
}

function unwrapOne(raw: unknown): WriterProfile | null {
  if (!raw || typeof raw !== "object") return null;
  if ("data" in (raw as object)) {
    const inner = (raw as { data?: unknown }).data;
    if (inner && typeof inner === "object" && "id" in (inner as object)) {
      return inner as WriterProfile;
    }
    return null;
  }
  if ("id" in (raw as object)) return raw as WriterProfile;
  return null;
}

/** GET /writers/{id} — public. Works server- or client-side. Returns
 * null on 404 / error. */
export async function getWriter(id: string): Promise<WriterProfile | null> {
  if (typeof window === "undefined") {
    return unwrapOne(await serverGet<unknown>(`/writers/${encodeURIComponent(id)}`));
  }
  try {
    const { data } = await api.get<unknown>(`/writers/${encodeURIComponent(id)}`);
    return unwrapOne(data);
  } catch {
    return null;
  }
}

/**
 * Full public profile payload returned by `GET /writers/{id}/profile-full`.
 * Unlike the raw `GET /writers/{id}` row, this composes the About fields,
 * social links, themes, and follower/work counts the artist screen renders.
 * The backend always returns objects/arrays for `social_links`/`themes`
 * (never null), but we type leniently and normalize on read anyway.
 */
export type WriterProfileFull = {
  id: string;
  user_id: string | null;
  pen_name?: string | null;
  /** Backend-resolved heading: pen_name → user.full_name → username. */
  display_name?: string | null;
  headline?: string | null;
  bio_long?: string | null;
  avatar_url?: string | null;
  joined_at?: string | null;
  location?: string | null;
  email?: string | null;
  external_link?: string | null;
  social_links?: WriterSocialLinks | null;
  themes?: string[] | null;
  based_in?: string | null;
  collaborations?: string | null;
  recognition?: string | null;
  quote?: string | null;
  follower_count?: number | null;
  following_count?: number | null;
  work_count?: number | null;
  creator_kind?: string | null;
};

function unwrapProfileFull(raw: unknown): WriterProfileFull | null {
  if (!raw || typeof raw !== "object") return null;
  const inner =
    "data" in (raw as object)
      ? (raw as { data?: unknown }).data
      : raw;
  if (!inner || typeof inner !== "object" || !("id" in (inner as object))) {
    return null;
  }
  return inner as WriterProfileFull;
}

/** GET /writers/{id}/profile-full — public. Works server- or client-side.
 * Returns the composed About + stats payload, or null on 404 / error. */
export async function getWriterProfileFull(
  id: string,
): Promise<WriterProfileFull | null> {
  const path = `/writers/${encodeURIComponent(id)}/profile-full`;
  if (typeof window === "undefined") {
    return unwrapProfileFull(await serverGet<unknown>(path));
  }
  try {
    const { data } = await api.get<unknown>(path);
    return unwrapProfileFull(data);
  } catch {
    return null;
  }
}

/** Pick the best display name from the writer record (falls back
 * through profile.display_name → user.full_name → username). */
export function writerDisplayName(w: WriterProfile): string {
  return (
    w.display_name?.trim() ||
    w.user?.profile?.display_name?.trim() ||
    w.user?.full_name?.trim() ||
    w.user?.username?.trim() ||
    ""
  );
}

/** Pick the avatar (writer.avatar_url → writer.avatar → user.profile.avatar)
 * and resolve relative storage keys (e.g. `images/…`) to displayable URLs.
 * Absolute URLs pass through unchanged. */
export function writerAvatar(w: WriterProfile): string | null {
  const raw =
    w.avatar_url?.trim() ||
    w.avatar?.trim() ||
    w.user?.profile?.avatar?.trim() ||
    null;
  return raw ? resolveArticleMediaSrc(raw) : null;
}

// ─── Admin CRUD ──────────────────────────────────────────────

export type WriterProfilePayload = {
  /** Required on create (admin picks the user); never sent on update. */
  user_id?: string;
  pen_name?: string | null;
  headline?: string | null;
  bio_long?: string | null;
  avatar_url?: string | null;
  featured?: boolean;
  social_links?: WriterSocialLinks | null;
  creator_kind?: string | null;
  location?: string | null;
  themes?: string[] | null;
  quote?: string | null;
  collaborations?: string | null;
  recognition?: string | null;
  monthly_goal?: number | null;
};

export type WritersListMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type WritersAdminResult = {
  writers: WriterProfile[];
  meta: WritersListMeta;
};

function parseWritersMeta(
  raw: unknown,
  count: number,
  params?: GetWritersParams,
): WritersListMeta {
  const fallback: WritersListMeta = {
    total: count,
    page: params?.page ?? 1,
    limit: params?.limit ?? Math.max(count, 1),
    totalPages: 1,
  };
  if (!raw || typeof raw !== "object") return fallback;
  const m = (raw as { meta?: unknown }).meta;
  if (!m || typeof m !== "object") return fallback;
  const o = m as Record<string, unknown>;
  const num = (v: unknown, d: number) =>
    typeof v === "number" && Number.isFinite(v) ? v : d;
  return {
    total: num(o.total, fallback.total),
    page: num(o.page, fallback.page),
    limit: num(o.limit, fallback.limit),
    totalPages: Math.max(1, num(o.totalPages, fallback.totalPages)),
  };
}

/** GET /writers with pagination meta — for the admin list (client-only).
 * Unlike the public reads above, errors propagate so the admin UI can
 * render a retry banner — do not add a silent catch. */
export async function getWritersAdmin(
  params?: GetWritersParams,
): Promise<WritersAdminResult> {
  const { data } = await api.get<unknown>("/writers", { params });
  const writers = unwrapList(data);
  return { writers, meta: parseWritersMeta(data, writers.length, params) };
}

/** POST /writers — requires JWT + admin/editor role. */
export async function createWriterProfile(
  payload: WriterProfilePayload,
): Promise<WriterProfile> {
  const { data } = await api.post<unknown>("/writers", payload);
  const item = unwrapOne(data);
  if (!item) throw new Error("Invalid response from create writer profile");
  return item;
}

/** PATCH /writers/:id */
export async function updateWriterProfile(
  id: string,
  payload: Partial<WriterProfilePayload>,
): Promise<WriterProfile> {
  const { data } = await api.patch<unknown>(
    `/writers/${encodeURIComponent(id)}`,
    payload,
  );
  const item = unwrapOne(data);
  if (!item) throw new Error("Invalid response from update writer profile");
  return item;
}

/** DELETE /writers/:id — admin only. */
export async function deleteWriterProfile(id: string): Promise<void> {
  await api.delete(`/writers/${encodeURIComponent(id)}`);
}

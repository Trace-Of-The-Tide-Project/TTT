import { api } from "./api";
import { serverGet } from "@/lib/api/isomorphic-fetch";

/**
 * Writer profile — surface for the "Follow our Writers" row. The
 * backend exposes both `GET /writers` (full list) and
 * `GET /writers/featured` (the homepage strip). We type the union
 * leniently because OpenAPI doesn't declare the response shape.
 */
export type WriterProfile = {
  id: string;
  user_id?: string | null;
  display_name?: string | null;
  bio?: string | null;
  avatar?: string | null;
  cover_image?: string | null;
  edition?: string | null;
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

/** Pick the avatar (writer.avatar → user.profile.avatar). */
export function writerAvatar(w: WriterProfile): string | null {
  return (
    w.avatar?.trim() ||
    w.user?.profile?.avatar?.trim() ||
    null
  );
}

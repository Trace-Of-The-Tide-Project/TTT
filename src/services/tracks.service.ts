import { api } from "./api";
import { serverGet } from "@/lib/api/isomorphic-fetch";

export type TrackEntityType = "article" | "book" | "magazine_issue";

export type Track = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  language?: string | null;
  translation_group_id?: string | null;
  is_published?: boolean;
  position?: number | null;
};

/** POST/PATCH /tracks body. `language` + `translation_of` link a new-language
 *  version into a translation group (create-only). */
export type TrackInput = {
  title: string;
  slug: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  language?: string | null;
  is_published?: boolean;
  position?: number | null;
  translation_of?: string | null;
};

export type TrackItem = {
  entity_type: TrackEntityType;
  id: string;
  title: string | null;
  slug: string | null;
  cover: string | null;
  published_at: string | null;
  position: number | null;
};

export type SetTrackItemInput = {
  entity_type: TrackEntityType;
  entity_id: string;
  position?: number;
};

function unwrapData<T>(raw: unknown): T | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  return ("data" in o ? (o.data as T) : (o as T)) ?? null;
}

function unwrapTracksList(raw: unknown): Track[] {
  const d = unwrapData<unknown>(raw);
  if (!Array.isArray(d)) return [];
  return d.filter(
    (row): row is Track =>
      row != null &&
      typeof row === "object" &&
      typeof (row as Track).id === "string" &&
      typeof (row as Track).title === "string",
  );
}

function unwrapTrack(raw: unknown): Track | null {
  const row = unwrapData<Record<string, unknown>>(raw);
  if (!row || typeof row.id !== "string" || typeof row.title !== "string") return null;
  return row as unknown as Track;
}

function unwrapTrackItems(raw: unknown): TrackItem[] {
  const d = unwrapData<unknown>(raw);
  if (!Array.isArray(d)) return [];
  return d.filter(
    (row): row is TrackItem =>
      row != null && typeof row === "object" && typeof (row as TrackItem).id === "string",
  );
}

export type GetTracksParams = {
  page?: number;
  limit?: number;
  search?: string;
};

/** GET /tracks — public list. */
export async function getTracks(params?: GetTracksParams): Promise<Track[]> {
  const data = await serverGet<unknown>("/tracks", params as Record<string, string>);
  return unwrapTracksList(data);
}

/** GET /tracks/:slug — public detail by slug. Returns null when missing/unpublished. */
export async function getTrackBySlug(slug: string, language?: string): Promise<Track | null> {
  const data = await serverGet<unknown>(`/tracks/${encodeURIComponent(slug)}`, { language });
  return unwrapTrack(data);
}

/** GET /tracks/:id/items — resolved, ordered, published-only items. */
export async function getTrackItems(trackId: string): Promise<TrackItem[]> {
  const data = await serverGet<unknown>(`/tracks/${encodeURIComponent(trackId)}/items`);
  return unwrapTrackItems(data);
}

/** GET /tracks/for/:entity_type/:entity_id — reverse lookup for badges. */
export async function getTracksForEntity(
  entityType: TrackEntityType,
  entityId: string,
): Promise<Track[]> {
  try {
    const data = await serverGet<unknown>(
      `/tracks/for/${encodeURIComponent(entityType)}/${encodeURIComponent(entityId)}`,
    );
    return unwrapTracksList(data);
  } catch {
    return [];
  }
}

// ── Admin (client-side, authenticated via the proxy) ───────────────

/** Admin list — includes unpublished tracks. */
export async function listTracksAdmin(params?: GetTracksParams): Promise<Track[]> {
  const { data } = await api.get<unknown>("/tracks", { params });
  return unwrapTracksList(data);
}

/** Admin — fetch a single track by id, unpublished included. */
export async function getTrackByIdAdmin(id: string): Promise<Track | null> {
  try {
    const { data } = await api.get<unknown>(`/tracks/${encodeURIComponent(id)}/admin`);
    return unwrapTrack(data);
  } catch {
    return null;
  }
}

/** Admin — create a track. POST /tracks */
export async function createTrack(payload: TrackInput): Promise<Track | null> {
  const { data } = await api.post<unknown>("/tracks", payload);
  return unwrapTrack(data);
}

/** Admin — update a track. PATCH /tracks/:id (never moves language). */
export async function updateTrack(
  id: string,
  payload: Partial<Omit<TrackInput, "language" | "translation_of">>,
): Promise<Track | null> {
  const { data } = await api.patch<unknown>(`/tracks/${encodeURIComponent(id)}`, payload);
  return unwrapTrack(data);
}

/** Admin — delete a track. DELETE /tracks/:id */
export async function deleteTrack(id: string): Promise<void> {
  await api.delete(`/tracks/${encodeURIComponent(id)}`);
}

/** Admin — replace a track's whole ordered item list. PUT /tracks/:id/items */
export async function setTrackItems(
  trackId: string,
  items: SetTrackItemInput[],
): Promise<TrackItem[]> {
  const { data } = await api.put<unknown>(`/tracks/${encodeURIComponent(trackId)}/items`, {
    items,
  });
  return unwrapTrackItems(data);
}

/** Admin — set which tracks an entity belongs to. PUT /tracks/for/:type/:id */
export async function setTracksForEntity(
  entityType: TrackEntityType,
  entityId: string,
  trackIds: string[],
): Promise<Track[]> {
  const { data } = await api.put<unknown>(
    `/tracks/for/${encodeURIComponent(entityType)}/${encodeURIComponent(entityId)}`,
    { track_ids: trackIds },
  );
  return unwrapTracksList(data);
}

/** Admin — all language versions of a track. GET /tracks/:id/translations */
export type TrackVersion = { id: string; language: string; title?: string | null };

export async function getTrackTranslations(id: string): Promise<TrackVersion[]> {
  try {
    const { data: raw } = await api.get<unknown>(
      `/tracks/${encodeURIComponent(id)}/translations`,
    );
    const body =
      raw && typeof raw === "object" && "data" in raw ? (raw as { data?: unknown }).data : raw;
    const o = (body ?? {}) as Record<string, unknown>;
    const versions = (o.versions ?? o.translations ?? []) as unknown;
    if (!Array.isArray(versions)) return [];
    return versions.filter(
      (v): v is TrackVersion =>
        v != null &&
        typeof v === "object" &&
        typeof (v as TrackVersion).id === "string" &&
        typeof (v as TrackVersion).language === "string",
    );
  } catch {
    return [];
  }
}

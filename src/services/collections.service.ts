import { api } from "./api";
import { serverGet } from "@/lib/api/isomorphic-fetch";

export type CollectionItem = {
  id: string;
  name: string;
  description?: string | null;
  cover_image?: string | null;
  language?: string | null;
  translation_group_id?: string | null;
};

export type CollectionDetail = {
  id: string;
  name: string;
  description?: string | null;
  cover_image?: string | null;
  language?: string | null;
  translation_group_id?: string | null;
  creator?: { id: string; username?: string; full_name?: string | null } | null;
  created_date?: string | null;
};

/** POST/PATCH /collections body. `language` + `translation_of` link a
 *  new-language version into a translation group (create-only). */
export type CollectionInput = {
  name: string;
  description?: string | null;
  cover_image?: string | null;
  /** Version language (en|ar|es|fr); defaults to `en` on the backend. */
  language?: string | null;
  /** Id of the source collection this is a translation of (create-only). */
  translation_of?: string | null;
};

export type CollectionsListMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

function unwrapCollectionsData(raw: unknown): CollectionItem[] {
  if (!raw || typeof raw !== "object") return [];
  const o = raw as Record<string, unknown>;
  const d = o.data;
  if (!Array.isArray(d)) return [];
  return d.filter(
    (row): row is CollectionItem =>
      row != null &&
      typeof row === "object" &&
      typeof (row as CollectionItem).id === "string" &&
      typeof (row as CollectionItem).name === "string",
  );
}

export type GetCollectionsParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: string;
  /** Filter to a single language version (en|ar|es|fr). */
  language?: string;
};

/** GET /collections — public list (paginated). */
export async function getCollections(params?: GetCollectionsParams): Promise<CollectionItem[]> {
  const data = await serverGet<unknown>("/collections", params as Record<string, string>);
  return unwrapCollectionsData(data);
}

function unwrapCollectionDetail(raw: unknown): CollectionDetail | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const row =
    o.data && typeof o.data === "object" ? (o.data as Record<string, unknown>) : o;
  if (typeof row.id !== "string" || typeof row.name !== "string") return null;
  return row as unknown as CollectionDetail;
}

/** GET /collections/:id — single collection (public). Returns null when missing. */
export async function getCollectionById(id: string): Promise<CollectionDetail | null> {
  const data = await serverGet<unknown>(`/collections/${encodeURIComponent(id)}`);
  return unwrapCollectionDetail(data);
}

export type CollectionVersion = {
  id: string;
  language: string;
  title?: string | null;
};

/** GET /collections/:id/translations — every version in the group (any id in
 *  the group resolves the whole set). Server-safe. Empty array on failure. */
export async function getCollectionTranslations(
  id: string,
): Promise<CollectionVersion[]> {
  try {
    const raw = await serverGet<unknown>(
      `/collections/${encodeURIComponent(id)}/translations`,
    );
    const body =
      raw && typeof raw === "object" && "data" in raw
        ? (raw as { data?: unknown }).data
        : raw;
    const o = (body ?? {}) as Record<string, unknown>;
    const versions = (o.versions ?? o.translations ?? []) as unknown;
    if (!Array.isArray(versions)) return [];
    return versions.filter(
      (v): v is CollectionVersion =>
        v != null &&
        typeof v === "object" &&
        typeof (v as CollectionVersion).id === "string" &&
        typeof (v as CollectionVersion).language === "string",
    );
  } catch {
    return [];
  }
}

// ── Admin (client-side, authenticated via the proxy) ───────────────

/** Admin list — includes language + translation_group_id per item. */
export async function listCollectionsAdmin(
  params?: GetCollectionsParams,
): Promise<CollectionItem[]> {
  const { data } = await api.get<unknown>("/collections", { params });
  return unwrapCollectionsData(data);
}

/** Admin — fetch a single collection by id (client). */
export async function getCollectionByIdAdmin(
  id: string,
): Promise<CollectionDetail | null> {
  try {
    const { data } = await api.get<unknown>(
      `/collections/${encodeURIComponent(id)}`,
    );
    return unwrapCollectionDetail(data);
  } catch {
    return null;
  }
}

/** Admin — create a collection. POST /collections */
export async function createCollection(
  payload: CollectionInput,
): Promise<CollectionDetail | null> {
  const { data } = await api.post<unknown>("/collections", payload);
  return unwrapCollectionDetail(data);
}

/** Admin — update a collection. PATCH /collections/:id (never moves language). */
export async function updateCollection(
  id: string,
  payload: Partial<Omit<CollectionInput, "language" | "translation_of">>,
): Promise<CollectionDetail | null> {
  const { data } = await api.patch<unknown>(
    `/collections/${encodeURIComponent(id)}`,
    payload,
  );
  return unwrapCollectionDetail(data);
}

/** Admin — delete a collection. DELETE /collections/:id */
export async function deleteCollection(id: string): Promise<void> {
  await api.delete(`/collections/${encodeURIComponent(id)}`);
}

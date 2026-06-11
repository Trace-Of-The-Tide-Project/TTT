import { serverGet } from "@/lib/api/isomorphic-fetch";

export type CollectionItem = {
  id: string;
  name: string;
  description?: string | null;
  cover_image?: string | null;
};

export type CollectionDetail = {
  id: string;
  name: string;
  description?: string | null;
  cover_image?: string | null;
  language?: string | null;
  creator?: { id: string; username?: string; full_name?: string | null } | null;
  created_date?: string | null;
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

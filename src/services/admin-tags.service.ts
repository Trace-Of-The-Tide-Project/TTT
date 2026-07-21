import { api } from "./api";

export type AdminTagItem = {
  id: string;
  name: string;
};

export type Tag = {
  id: string;
  name: string;
  description?: string | null;
  name_i18n?: Record<string, string> | null;
};

export type TagInput = {
  name: string;
  description?: string | null;
  name_i18n?: Record<string, string> | null;
};

function unwrapTagsList(raw: unknown): AdminTagItem[] {
  if (raw && typeof raw === "object" && "data" in raw) {
    const d = (raw as { data: unknown }).data;
    if (Array.isArray(d)) return unwrapTagsList(d);
  }
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (row): row is AdminTagItem =>
      row != null &&
      typeof row === "object" &&
      typeof (row as AdminTagItem).id === "string" &&
      typeof (row as AdminTagItem).name === "string"
  );
}

function unwrapTag(raw: unknown): Tag | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const row = o.data && typeof o.data === "object" ? (o.data as Record<string, unknown>) : o;
  if (typeof row.id !== "string" || typeof row.name !== "string") return null;
  return row as unknown as Tag;
}

/** GET /admin/system-settings/tags — Bearer (admin). Returns `[{ id, name }, …]`. */
export async function getAdminTags(): Promise<AdminTagItem[]> {
  const { data } = await api.get<unknown>("/tags");
  return unwrapTagsList(data);
}

export type ListTagsParams = {
  page?: number;
  limit?: number;
  search?: string;
};

/** Admin — full tag list with description/name_i18n. GET /tags */
export async function listTags(params?: ListTagsParams): Promise<Tag[]> {
  const { data } = await api.get<unknown>("/tags", { params });
  const raw =
    data && typeof data === "object" && "data" in data
      ? (data as { data: unknown }).data
      : data;
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (row): row is Tag =>
      row != null && typeof row === "object" && typeof (row as Tag).id === "string",
  );
}

/** Admin — create a tag. POST /tags */
export async function createTag(payload: TagInput): Promise<Tag | null> {
  const { data } = await api.post<unknown>("/tags", payload);
  return unwrapTag(data);
}

/** Admin — update a tag. PATCH /tags/:id */
export async function updateTag(id: string, payload: Partial<TagInput>): Promise<Tag | null> {
  const { data } = await api.patch<unknown>(`/tags/${encodeURIComponent(id)}`, payload);
  return unwrapTag(data);
}

/** Admin — delete a tag. DELETE /tags/:id */
export async function deleteTag(id: string): Promise<void> {
  await api.delete(`/tags/${encodeURIComponent(id)}`);
}

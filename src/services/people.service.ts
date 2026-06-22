import { api } from "./api";

export type PersonProfile = {
  id: string;
  full_name: string;
  biography?: string | null;
  portrait?: string | null;
  birth_date?: string | null;
  death_date?: string | null;
  createdAt?: string;
  updatedAt?: string;
  biographicalCards?: Array<{ id: string; summary?: string | null; image?: string | null }> | null;
};

export type PersonProfilePayload = {
  full_name: string;
  biography?: string | null;
  portrait?: string | null;
  birth_date?: string | null;
  death_date?: string | null;
};

export type PeopleListMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PeopleAdminResult = {
  people: PersonProfile[];
  meta: PeopleListMeta;
};

export type GetPeopleParams = {
  search?: string;
  page?: number;
  limit?: number;
};

function unwrapList(raw: unknown): PersonProfile[] {
  if (!raw || typeof raw !== "object") return [];
  const o = raw as Record<string, unknown>;
  if (Array.isArray(o.data)) return o.data as PersonProfile[];
  if (Array.isArray(o.rows)) return o.rows as PersonProfile[];
  if (Array.isArray(o)) return o as unknown as PersonProfile[];
  return [];
}

function unwrapOne(raw: unknown): PersonProfile | null {
  if (!raw || typeof raw !== "object") return null;
  if ("data" in (raw as object)) {
    const inner = (raw as { data?: unknown }).data;
    if (inner && typeof inner === "object" && "id" in (inner as object)) {
      return inner as PersonProfile;
    }
    return null;
  }
  if ("id" in (raw as object)) return raw as PersonProfile;
  return null;
}

function parseMeta(raw: unknown, count: number, params?: GetPeopleParams): PeopleListMeta {
  const fallback: PeopleListMeta = {
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

export async function getPeopleAdmin(params?: GetPeopleParams): Promise<PeopleAdminResult> {
  const { data } = await api.get<unknown>("/people", { params });
  const people = unwrapList(data);
  return { people, meta: parseMeta(data, people.length, params) };
}

export async function getPerson(id: string): Promise<PersonProfile | null> {
  try {
    const { data } = await api.get<unknown>(`/people/${encodeURIComponent(id)}`);
    return unwrapOne(data);
  } catch {
    return null;
  }
}

export async function createPerson(payload: PersonProfilePayload): Promise<PersonProfile> {
  const { data } = await api.post<unknown>("/people", payload);
  const item = unwrapOne(data);
  if (!item) throw new Error("Invalid response from create person");
  return item;
}

export async function updatePerson(
  id: string,
  payload: Partial<PersonProfilePayload>,
): Promise<PersonProfile> {
  const { data } = await api.patch<unknown>(`/people/${encodeURIComponent(id)}`, payload);
  const item = unwrapOne(data);
  if (!item) throw new Error("Invalid response from update person");
  return item;
}

export async function deletePerson(id: string): Promise<void> {
  await api.delete(`/people/${encodeURIComponent(id)}`);
}

/** Best portrait: direct portrait field → first biographical card image. */
export function personPortrait(p: PersonProfile): string | null {
  if (p.portrait?.trim()) return p.portrait.trim();
  const card = p.biographicalCards?.[0];
  return card?.image?.trim() ?? null;
}

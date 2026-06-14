import { api } from "./api";
import { serverGet } from "@/lib/api/isomorphic-fetch";

/**
 * Magazine entity — the masthead/publication record. The backend's
 * Swagger spec doesn't declare response schemas, so this type
 * captures the fields observed on the live `GET /magazines` endpoint
 * plus the ones we read in the magazine page (manifesto copy etc.).
 *
 * All fields are optional except `id`/`title`/`slug` because the
 * backend may seed records with only the minimum.
 */
export type Magazine = {
  id: string;
  /** Backend stores the title under `name`; `title` may also be present
   * as an alias. Read both defensively. */
  name?: string | null;
  title: string;
  slug: string;
  description?: string | null;
  cover_image?: string | null;
  status?: string;
  /** Manifesto-style copy lives under `meta` in most NestJS CMS
   * setups; we read it defensively. */
  meta?: Record<string, unknown> | null;
  /** Optional founder quote / hero / mission fields the backend may
   * surface directly on the entity. */
  hero_title?: string | null;
  hero_subtitle?: string | null;
  philosophy_quote?: string | null;
  vision_body?: string | null;
  mission_body?: string | null;
  founder_quote?: string | null;
  founder_name?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type MagazineListMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type MagazineListResponse = {
  status: number;
  results: number;
  data: Magazine[];
  meta?: MagazineListMeta;
};

export type GetMagazinesParams = {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
};

function unwrapList(raw: unknown): Magazine[] {
  if (!raw || typeof raw !== "object") return [];
  const o = raw as Record<string, unknown>;
  if (Array.isArray(o.data)) return o.data as Magazine[];
  if (Array.isArray(o)) return o as unknown as Magazine[];
  return [];
}

/** Public — list magazines. Server- or client-safe. */
export async function getMagazines(
  params?: GetMagazinesParams,
): Promise<Magazine[]> {
  if (typeof window === "undefined") {
    const raw = await serverGet<unknown>("/magazines", params);
    return unwrapList(raw);
  }
  try {
    const { data } = await api.get<unknown>("/magazines", { params });
    return unwrapList(data);
  } catch {
    return [];
  }
}

function unwrapOne(raw: unknown): Magazine | null {
  if (!raw || typeof raw !== "object") return null;
  if ("data" in (raw as object)) {
    return (raw as { data?: Magazine }).data ?? null;
  }
  return raw as Magazine;
}

/**
 * Create payload. The backend's Swagger spec doesn't declare a request
 * schema for `POST /magazines`; `title` is the only field the UI
 * requires (the backend auto-generates `slug`).
 */
export type MagazineInput = {
  /** The backend's NOT NULL column is `name`; `title` is a read-side
   * alias. We send both so create works and reads stay populated. */
  name: string;
  title?: string;
  slug?: string;
  description?: string | null;
  cover_image?: string | null;
  status?: string | null;
};

/** Admin — create a magazine. POST /magazines */
export async function createMagazine(
  payload: MagazineInput,
): Promise<Magazine | null> {
  const { data } = await api.post<unknown>("/magazines", payload);
  return unwrapOne(data);
}

/** Public — fetch a magazine by slug. Returns null when missing. */
export async function getMagazineBySlug(
  slug: string,
): Promise<Magazine | null> {
  if (typeof window === "undefined") {
    const raw = await serverGet<unknown>(
      `/magazines/slug/${encodeURIComponent(slug)}`,
    );
    if (!raw) return null;
    if (typeof raw === "object" && raw !== null && "data" in raw) {
      const r = raw as Record<string, unknown>;
      return (r.data ?? null) as Magazine | null;
    }
    return raw as Magazine;
  }
  try {
    const { data } = await api.get<unknown>(
      `/magazines/slug/${encodeURIComponent(slug)}`,
    );
    if (data && typeof data === "object" && "data" in (data as object)) {
      return ((data as { data?: Magazine }).data ?? null);
    }
    return data as Magazine;
  } catch {
    return null;
  }
}

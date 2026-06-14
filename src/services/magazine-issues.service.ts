import { api } from "./api";
import { serverGet } from "@/lib/api/isomorphic-fetch";

/**
 * Magazine issue / spread / collection record. Field set kept tight
 * to what the magazine "Issues" pane actually renders.
 */
export type MagazineIssue = {
  id: string;
  title: string;
  slug: string;
  /** Issue kind — drives the filter chips on the Issues pane.
   * Observed values from the backend so far: "article", "essay",
   * "collection", "slides". The chips also include "all" which is
   * client-side only. */
  kind?: string | null;
  status?: string | null;
  language?: string | null;
  cover_image?: string | null;
  excerpt?: string | null;
  description?: string | null;
  reading_time?: number | null;
  page_count?: number | null;
  edition?: string | null;
  edition_number?: number | null;
  category?: string | null;
  magazine_id?: string | null;
  published_at?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type GetMagazineIssuesParams = {
  kind?: string;
  status?: string;
  magazine_id?: string;
  search?: string;
  page?: number;
  limit?: number;
};

function unwrapList(raw: unknown): MagazineIssue[] {
  if (!raw || typeof raw !== "object") return [];
  const o = raw as Record<string, unknown>;
  if (Array.isArray(o.data)) return o.data as MagazineIssue[];
  if (Array.isArray(o)) return o as unknown as MagazineIssue[];
  return [];
}

export async function getMagazineIssues(
  params?: GetMagazineIssuesParams,
): Promise<MagazineIssue[]> {
  if (typeof window === "undefined") {
    const raw = await serverGet<unknown>("/magazine-issues", params);
    return unwrapList(raw);
  }
  try {
    const { data } = await api.get<unknown>("/magazine-issues", { params });
    return unwrapList(data);
  } catch {
    return [];
  }
}

/**
 * Create / update payload. The backend's Swagger spec does not declare
 * a request schema for `POST /magazine-issues`, so we send the same
 * snake_case fields the read model exposes; unknown fields are ignored
 * server-side. `title` is the only hard requirement.
 */
export type MagazineIssueInput = {
  title: string;
  slug?: string;
  kind?: string | null;
  status?: string | null;
  /** Language/translation-group tag — enum en|ar|es|fr on the backend. */
  language?: string | null;
  cover_image?: string | null;
  excerpt?: string | null;
  description?: string | null;
  page_count?: number | null;
  /** Display label exposed on read (e.g. "12"). */
  edition?: string | null;
  /** Numeric edition — REQUIRED by the create/update DTO (the column is
   * `edition_number`, an integer; `edition` is a read-side alias). */
  edition_number?: number | null;
  category?: string | null;
  /** REQUIRED by the create DTO — the parent magazine the issue belongs to. */
  magazine_id?: string | null;
  published_at?: string | null;
};

function unwrapOne(raw: unknown): MagazineIssue | null {
  if (!raw || typeof raw !== "object") return null;
  if ("data" in (raw as object)) {
    return (raw as { data?: MagazineIssue }).data ?? null;
  }
  return raw as MagazineIssue;
}

/** Admin — fetch a single issue by id. */
export async function getMagazineIssue(
  id: string,
): Promise<MagazineIssue | null> {
  try {
    const { data } = await api.get<unknown>(
      `/magazine-issues/${encodeURIComponent(id)}`,
    );
    return unwrapOne(data);
  } catch {
    return null;
  }
}

/** Admin — create an issue. POST /magazine-issues */
export async function createMagazineIssue(
  payload: MagazineIssueInput,
): Promise<MagazineIssue | null> {
  const { data } = await api.post<unknown>("/magazine-issues", payload);
  return unwrapOne(data);
}

/** Admin — update an issue. PATCH /magazine-issues/{id} */
export async function updateMagazineIssue(
  id: string,
  payload: Partial<MagazineIssueInput>,
): Promise<MagazineIssue | null> {
  const { data } = await api.patch<unknown>(
    `/magazine-issues/${encodeURIComponent(id)}`,
    payload,
  );
  return unwrapOne(data);
}

/** Admin — delete an issue. DELETE /magazine-issues/{id} */
export async function deleteMagazineIssue(id: string): Promise<void> {
  await api.delete(`/magazine-issues/${encodeURIComponent(id)}`);
}

export async function getMagazineIssueBySlug(
  slug: string,
): Promise<MagazineIssue | null> {
  if (typeof window === "undefined") {
    const raw = await serverGet<unknown>(
      `/magazine-issues/slug/${encodeURIComponent(slug)}`,
    );
    if (!raw) return null;
    if (typeof raw === "object" && "data" in (raw as object)) {
      return (raw as { data?: MagazineIssue }).data ?? null;
    }
    return raw as MagazineIssue;
  }
  try {
    const { data } = await api.get<unknown>(
      `/magazine-issues/slug/${encodeURIComponent(slug)}`,
    );
    if (data && typeof data === "object" && "data" in (data as object)) {
      return (data as { data?: MagazineIssue }).data ?? null;
    }
    return data as MagazineIssue;
  } catch {
    return null;
  }
}

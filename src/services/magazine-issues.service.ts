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
  cover_image?: string | null;
  excerpt?: string | null;
  description?: string | null;
  reading_time?: number | null;
  page_count?: number | null;
  edition?: string | null;
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

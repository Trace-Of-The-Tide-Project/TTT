import { isAxiosError } from "axios";
import { api } from "./api";
import { serverGet } from "@/lib/api/isomorphic-fetch";

export interface MediaAssetUsage {
  id: string;
  entity_type: string;
  entity_id: string;
  field: string;
}

export interface MediaAsset {
  id: string;
  storage_key: string;
  file_name: string;
  folder_id: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  /** null = not probed yet; -1 = probe failed (not a retryable image) */
  width: number | null;
  height: number | null;
  uploaded_by: string | null;
  createdAt: string;
  updatedAt: string;
  usages: MediaAssetUsage[];
  url: string | null;
}

export interface MediaFolder {
  id: string;
  name: string;
  parent_id: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MediaAssetListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface MediaAssetFilters {
  page?: number;
  limit?: number;
  search?: string;
  folder_id?: string;
  usage_entity_type?: string;
  unused?: boolean;
  images_only?: boolean;
  scope?: "main" | "magazine";
  date_from?: string;
  date_to?: string;
}

export interface ScanResult {
  objects_listed: number;
  assets_created: number;
  usages_indexed: number;
  dimensions_probed: number;
}

/**
 * Thrown by deleteMediaAsset on 409 — the asset is referenced elsewhere.
 * `usages` are human-readable "entity_type.field (entity_id)" lines (the
 * backend encodes them into the error `message` array; see
 * media-library.service.ts on the backend for why — the shared
 * AllExceptionsFilter only forwards `message`/`error`, not sibling fields).
 */
export class MediaAssetInUseError extends Error {
  usages: string[];
  constructor(lines: string[]) {
    super(lines[0] ?? "Asset is in use");
    this.name = "MediaAssetInUseError";
    this.usages = lines.slice(1);
  }
}

/** Backend envelope is always `{ status, results, data, meta? }` on success
 * (see backend ResponseInterceptor) — the shared `api` axios instance never
 * unwraps this, so every call site must reach into `.data.data`. */
function unwrapData<T>(raw: unknown): T {
  const o = raw as { data?: T } | null | undefined;
  return (o?.data ?? (raw as T)) as T;
}

function unwrapMeta(raw: unknown): MediaAssetListMeta {
  const o = raw as { meta?: MediaAssetListMeta } | null | undefined;
  return (
    o?.meta ?? { page: 1, limit: 24, total: 0, totalPages: 1 }
  );
}

function filtersToParams(filters: MediaAssetFilters): Record<string, string> {
  const params: Record<string, string> = {};
  if (filters.page) params.page = String(filters.page);
  if (filters.limit) params.limit = String(filters.limit);
  if (filters.search?.trim()) params.search = filters.search.trim();
  if (filters.folder_id) params.folder_id = filters.folder_id;
  if (filters.usage_entity_type) params.usage_entity_type = filters.usage_entity_type;
  if (filters.unused) params.unused = "true";
  if (filters.images_only) params.images_only = "true";
  if (filters.scope) params.scope = filters.scope;
  if (filters.date_from) params.date_from = filters.date_from;
  if (filters.date_to) params.date_to = filters.date_to;
  return params;
}

// ── Assets ──

export async function getMediaAssets(
  filters: MediaAssetFilters = {},
): Promise<{ assets: MediaAsset[]; meta: MediaAssetListMeta }> {
  const { data } = await api.get<unknown>("/media-library/assets", {
    params: filtersToParams(filters),
  });
  return { assets: unwrapData<MediaAsset[]>(data), meta: unwrapMeta(data) };
}

export async function getMediaAsset(id: string): Promise<MediaAsset> {
  const { data } = await api.get<unknown>(`/media-library/assets/${id}`);
  return unwrapData<MediaAsset>(data);
}

export async function updateMediaAsset(
  id: string,
  patch: { file_name?: string; folder_id?: string | null },
): Promise<MediaAsset> {
  const { data } = await api.patch<unknown>(`/media-library/assets/${id}`, patch);
  return unwrapData<MediaAsset>(data);
}

export async function deleteMediaAsset(id: string, force = false): Promise<void> {
  try {
    await api.delete(`/media-library/assets/${id}`, {
      params: force ? { force: "true" } : undefined,
    });
  } catch (e) {
    if (isAxiosError(e) && e.response?.status === 409) {
      const msg = e.response.data?.message;
      const lines = Array.isArray(msg)
        ? (msg as unknown[]).map(String)
        : typeof msg === "string"
          ? [msg]
          : ["Asset is in use"];
      throw new MediaAssetInUseError(lines);
    }
    throw e;
  }
}

export async function getMediaDownloadUrl(id: string): Promise<string> {
  const { data } = await api.get<unknown>(`/media-library/assets/${id}/download-url`);
  return unwrapData<{ url: string }>(data).url;
}

export async function uploadToMediaLibrary(
  file: File,
  folderId?: string,
  onProgress?: (percent: number) => void,
): Promise<MediaAsset> {
  const formData = new FormData();
  formData.append("file", file);
  if (folderId) formData.append("folder_id", folderId);

  const { data } = await api.post<unknown>("/media-library/upload", formData, {
    timeout: 600_000,
    transformRequest: [
      (body, headers) => {
        if (body instanceof FormData) delete headers["Content-Type"];
        return body;
      },
    ],
    onUploadProgress: onProgress
      ? (evt) => {
          if (evt.total) onProgress(Math.round((evt.loaded / evt.total) * 100));
        }
      : undefined,
  });
  return unwrapData<MediaAsset>(data);
}

export async function runMediaScan(): Promise<ScanResult> {
  const { data } = await api.post<unknown>("/media-library/scan");
  return unwrapData<ScanResult>(data);
}

// ── Bulk operations ──

export interface BulkDeleteResult {
  deleted: string[];
  blocked: { id: string; file_name: string; usages: string[] }[];
}

export async function bulkMoveMediaAssets(
  assetIds: string[],
  folderId: string | null,
): Promise<void> {
  await api.post("/media-library/assets/move", {
    asset_ids: assetIds,
    folder_id: folderId,
  });
}

export async function bulkDeleteMediaAssets(
  assetIds: string[],
  force = false,
): Promise<BulkDeleteResult> {
  const { data } = await api.post<unknown>("/media-library/assets/bulk-delete", {
    asset_ids: assetIds,
    force,
  });
  return unwrapData<BulkDeleteResult>(data);
}

/** Extracts a filename from a Content-Disposition header, falling back to a stamped default. */
function filenameFromContentDisposition(header: string | undefined): string {
  const match = header?.match(/filename="?([^";]+)"?/i);
  if (match?.[1]) return match[1];
  const d = new Date();
  const stamp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return `media-${stamp}.zip`;
}

/** Streams a zip of the given assets (backend caps at 50) and triggers a browser download. */
export async function downloadMediaAssetsZip(assetIds: string[]): Promise<void> {
  const res = await api.post("/media-library/assets/download-zip", { asset_ids: assetIds }, {
    responseType: "blob",
    timeout: 600_000,
  });
  const filename = filenameFromContentDisposition(res.headers?.["content-disposition"]);
  const url = URL.createObjectURL(res.data as Blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Own-domain share link — resolved by app/api/media/[id]/route.ts, which
 * redirects to a freshly signed URL. Never construct a GCS URL directly. */
export function getMediaShareLink(id: string): string {
  return `${window.location.origin}/api/media/${id}`;
}

export async function copyMediaShareLink(id: string): Promise<void> {
  await navigator.clipboard.writeText(getMediaShareLink(id));
}

// ── Folders ──

export async function getMediaFolders(): Promise<MediaFolder[]> {
  const { data } = await api.get<unknown>("/media-library/folders");
  return unwrapData<MediaFolder[]>(data);
}

export async function createMediaFolder(input: {
  name: string;
  parent_id?: string;
}): Promise<MediaFolder> {
  const { data } = await api.post<unknown>("/media-library/folders", input);
  return unwrapData<MediaFolder>(data);
}

export async function updateMediaFolder(
  id: string,
  patch: { name?: string; parent_id?: string | null },
): Promise<MediaFolder> {
  const { data } = await api.patch<unknown>(`/media-library/folders/${id}`, patch);
  return unwrapData<MediaFolder>(data);
}

export async function deleteMediaFolder(id: string): Promise<void> {
  await api.delete(`/media-library/folders/${id}`);
}

// ── Page heroes ──

export interface PageHero {
  id: string;
  label: string;
  storageKey: string;
  url: string | null;
}

function unwrapUrlField(raw: unknown): string | null {
  const o = raw as { data?: { url?: unknown } } | null | undefined;
  const url = o?.data?.url;
  return typeof url === "string" && url ? url : null;
}

/**
 * GET /public/media/page-hero/:pageId/url — public, no auth. SSR- and
 * client-safe. Returns null when the page has no override set (caller
 * falls back to that page's existing hero behavior).
 */
export async function getPageHero(pageId: string): Promise<string | null> {
  if (typeof window === "undefined") {
    return unwrapUrlField(await serverGet<unknown>(`/public/media/page-hero/${pageId}/url`));
  }
  try {
    const { data } = await api.get<unknown>(`/public/media/page-hero/${pageId}/url`);
    return unwrapUrlField(data);
  } catch {
    return null;
  }
}

/** Admin: every manageable page with its current override, if any. */
export async function getAdminPageHeroes(): Promise<PageHero[]> {
  const { data } = await api.get<unknown>("/media-library/page-heroes");
  return unwrapData<PageHero[]>(data);
}

/** `storageKey: ""` clears the override. */
export async function updatePageHero(pageId: string, storageKey: string): Promise<void> {
  await api.patch(`/media-library/page-heroes/${pageId}`, { storage_key: storageKey });
}

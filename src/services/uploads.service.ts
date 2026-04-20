import { api } from "./api";

/**
 * Picks the best URL/path from POST /upload responses.
 * Prefer a full `https` URL (e.g. signed GCS) over a relative `path` so `<video>` / `<img>` can load without API auth.
 */
function payloadInnerRecord(data: Record<string, unknown>): Record<string, unknown> | null {
  const inner = data.data;
  return inner != null && typeof inner === "object" && !Array.isArray(inner)
    ? (inner as Record<string, unknown>)
    : null;
}

/** Strip `?…` / `#…` from http(s) URLs so they are safe as multipart filenames / storage refs. */
function stripUrlQueryAndHashForStorageRef(ref: string): string {
  const t = ref.trim();
  if (!/^https?:\/\//i.test(t)) return t;
  let out = t;
  const hash = out.indexOf("#");
  if (hash !== -1) out = out.slice(0, hash);
  const q = out.indexOf("?");
  if (q !== -1) out = out.slice(0, q);
  return out;
}

function pickPathOrUrlFromPayload(data: unknown): string | null {
  if (typeof data === "string" && data.trim()) return data.trim();
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  const inner = payloadInnerRecord(o);

  const urlInner = inner && typeof inner.url === "string" ? inner.url.trim() : "";
  const pathInner = inner && typeof inner.path === "string" ? inner.path.trim() : "";
  const urlRoot = typeof o.url === "string" ? o.url.trim() : "";
  const pathRoot = typeof o.path === "string" ? o.path.trim() : "";

  if (/^https?:\/\//i.test(urlInner)) return urlInner;
  if (/^https?:\/\//i.test(urlRoot)) return urlRoot;
  if (urlInner) return urlInner;
  if (urlRoot) return urlRoot;
  if (pathInner) return pathInner;
  if (pathRoot) return pathRoot;
  return null;
}

function mimeFromUploadPayloadInner(inner: Record<string, unknown> | null | undefined): string | undefined {
  if (!inner) return undefined;
  const raw = inner.mimeType ?? inner.mime_type;
  return typeof raw === "string" && raw.trim() ? raw.trim() : undefined;
}

/**
 * Storage key for POST /contributions multipart `files` parts: prefer relative `path`
 * over presigned `url` so filenames do not contain `?…` (often rejected as "invalid query").
 */
function pickStorageReferenceForContribution(data: unknown): string | null {
  if (typeof data === "string" && data.trim()) {
    return stripUrlQueryAndHashForStorageRef(data.trim());
  }
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  const inner = payloadInnerRecord(o);

  const pathInner = inner && typeof inner.path === "string" ? inner.path.trim() : "";
  const pathRoot = typeof o.path === "string" ? o.path.trim() : "";
  if (pathInner) return pathInner;
  if (pathRoot) return pathRoot;

  const urlInner = inner && typeof inner.url === "string" ? inner.url.trim() : "";
  const urlRoot = typeof o.url === "string" ? o.url.trim() : "";
  if (urlInner) return stripUrlQueryAndHashForStorageRef(urlInner);
  if (urlRoot) return stripUrlQueryAndHashForStorageRef(urlRoot);
  return null;
}

export type ContributionUploadAsset = {
  /** Relative object key from the API, e.g. `images/1776541676653-522000269.png` — used as the multipart `files` filename. */
  storageKey: string;
  /** Present on envelopes like `{ data: { path, url, mimeType, size } }`; prefer over `File.type` for the part. */
  mimeType?: string;
};

function parseContributionUploadResponse(data: unknown): ContributionUploadAsset | null {
  const storageKey = pickStorageReferenceForContribution(data);
  if (!storageKey) return null;
  if (!data || typeof data !== "object") return { storageKey };
  const inner = payloadInnerRecord(data as Record<string, unknown>);
  const mimeType = mimeFromUploadPayloadInner(inner);
  return mimeType ? { storageKey, mimeType } : { storageKey };
}

/** Single POST /upload used by article editor and contribution form (same multipart field as articles). */
async function postUploadFile(file: File): Promise<unknown> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post<unknown>("/upload", formData, {
    transformRequest: [
      (body, headers) => {
        if (body instanceof FormData) {
          delete headers["Content-Type"];
        }
        return body;
      },
    ],
  });

  return data;
}

/**
 * POST /upload — multipart file upload.
 * Backend may return `{ status, data: { path, url } }` (prefer signed `url`), a plain path/URL string, or `{ path }` / `{ url }`.
 * Same response handling as article image blocks (signed URL preferred for display).
 */
export async function uploadArticleAsset(file: File): Promise<string> {
  const data = await postUploadFile(file);
  const loc = pickPathOrUrlFromPayload(data);
  if (loc) return loc;
  throw new Error("Upload response did not include a path or URL.");
}

/** Same as {@link uploadArticleAsset}; prefer this name when the file is not article-specific. */
export const uploadFileToUrl = uploadArticleAsset;

/**
 * Same POST /upload as {@link uploadArticleAsset}; returns the **storage key** (`data.path`) for
 * contribution multipart `files` filenames (not the signed URL — avoids backend "invalid query"),
 * plus optional `mimeType` from the envelope. Display URLs match articles via signed `url` when present.
 */
export async function uploadFileForContribution(file: File): Promise<ContributionUploadAsset> {
  const data = await postUploadFile(file);
  const parsed = parseContributionUploadResponse(data);
  if (parsed) return parsed;
  throw new Error("Upload response did not include a path or URL.");
}

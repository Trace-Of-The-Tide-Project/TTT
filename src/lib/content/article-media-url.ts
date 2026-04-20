import { isUsableImageSrc } from "@/lib/content/content-image-src";

const DEFAULT_API_BASE = "https://backend-phd7.onrender.com";

/**
 * Default GCS bucket for object keys under `images/…` (POST /upload) and `contributions/…`
 * (persisted on contribution records — backend often copies/renames from `images/` into this prefix).
 * Override via `NEXT_PUBLIC_STORAGE_PUBLIC_BASE_URL`.
 */
const DEFAULT_STORAGE_PUBLIC_BASE = "https://storage.googleapis.com/traceofthetide-uploads";

export function getArticleApiBaseUrl(): string {
  const raw =
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_BASE_URL
      ? process.env.NEXT_PUBLIC_API_BASE_URL
      : DEFAULT_API_BASE;
  return raw.replace(/\/+$/, "");
}

function joinStoragePublicUrl(base: string, relativePath: string): string {
  const b = base.replace(/\/+$/, "");
  const rel = relativePath.replace(/^\/+/, "");
  const encoded = rel
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
  return `${b}/${encoded}`;
}

function resolveBucketStoragePublicUrl(relativeKey: string): string {
  const rel = relativeKey.replace(/^\/+/, "");
  const fromEnv =
    typeof process !== "undefined" ? process.env.NEXT_PUBLIC_STORAGE_PUBLIC_BASE_URL?.trim() : "";
  if (fromEnv) {
    return joinStoragePublicUrl(fromEnv, rel);
  }
  return joinStoragePublicUrl(DEFAULT_STORAGE_PUBLIC_BASE, rel);
}

/**
 * API media refs: full URLs, site paths, `uploads/…`, `videos/…`, `audio/…`, `images/…`, `contributions/…` (no scheme).
 */
export function isUsableArticleMediaRef(raw: string | null | undefined): raw is string {
  if (isUsableImageSrc(raw)) return true;
  const s = String(raw ?? "").trim();
  if (!s || s.includes("..")) return false;
  if (/^(uploads|videos|audio|images|contributions)\//i.test(s) && /^[\w./-]+$/i.test(s)) return true;
  return false;
}

/**
 * Absolute URL for `<video>` / `<audio>` / `<img>`:
 * - Full `https://` refs (e.g. signed GCS URLs from the editor) are returned as-is.
 * - `images/…` (upload) and `contributions/…` (saved on contributions) use the same bucket / env base.
 * - `uploads/…`, `videos/…`, `audio/…` (and leading `/` forms) use the API host.
 */
export function resolveArticleMediaSrc(ref: string): string {
  const s = ref.trim();
  if (!s) return s;
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith("//")) {
    try {
      return new URL(`https:${s}`).href;
    } catch {
      return s;
    }
  }

  const rel = s.replace(/^\/+/, "");
  if (/^(images|contributions)\//i.test(rel)) {
    return resolveBucketStoragePublicUrl(rel);
  }

  if (s.startsWith("/") && !/^\/(uploads|videos|audio)\//i.test(s)) {
    return s;
  }
  const base = getArticleApiBaseUrl();
  const path = s.startsWith("/") ? s : `/${s}`;
  return `${base}${path}`;
}
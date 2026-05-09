/**
 * Isomorphic GET helper for read-only API calls that need to work in
 * both server components (no axios `/api/proxy` shortcut available)
 * and client components (where the axios `api` instance handles
 * cookie-backed auth via the Next.js proxy route).
 *
 * On the server we hit the backend directly with `fetch`. On the
 * client, hooks should keep using the axios `api` instance from
 * `@/services/api` so they get auth refresh + 401 redirect handling.
 */
import { DEFAULT_PUBLIC_API_BASE_URL } from "@/lib/public-api-base-url";

const BACKEND_BASE = (
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  DEFAULT_PUBLIC_API_BASE_URL
).replace(/\/+$/, "");

export type QueryValue = string | number | boolean | undefined | null;

function buildUrl(path: string, params?: Record<string, QueryValue>): string {
  const url = `${BACKEND_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  if (!params) return url;
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    qs.set(k, String(v));
  }
  const s = qs.toString();
  return s ? `${url}?${s}` : url;
}

/**
 * Server-side GET that returns parsed JSON, or `null` on any failure
 * (network, non-OK status, parse error). Read-only — no auth header
 * sent. Use only for endpoints documented as public in the OpenAPI
 * spec.
 *
 * Errors are swallowed by design: the magazine page renders
 * gracefully with empty sections when the backend is down or returns
 * unexpected shapes, instead of throwing inside an RSC.
 */
export async function serverGet<T>(
  path: string,
  params?: Record<string, QueryValue>,
): Promise<T | null> {
  try {
    const res = await fetch(buildUrl(path, params), {
      headers: { Accept: "application/json" },
      // No caching — magazine page is highly dynamic (article counts,
      // issues, writers can change at any time).
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

import { NextResponse } from "next/server";
import { DEFAULT_PUBLIC_API_BASE_URL } from "@/lib/public-api-base-url";

const BACKEND_URL = (
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  DEFAULT_PUBLIC_API_BASE_URL
).replace(/\/+$/, "");

const REQUEST_TIMEOUT_MS = 15_000;

export type BackendResponse =
  | { ok: true; status: number; json: unknown; raw: string }
  | { ok: false; status: number; reason: "non-json" | "network"; message: string };

export function getBackendBaseUrl(): string {
  return BACKEND_URL;
}

function safeParseJson(text: string): { ok: true; data: unknown } | { ok: false } {
  const trimmed = text.trim();
  if (!trimmed) return { ok: true, data: {} };
  try {
    return { ok: true, data: JSON.parse(trimmed) as unknown };
  } catch {
    return { ok: false };
  }
}

export type BackendCall = {
  path: string;
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  timeoutMs?: number;
};

/**
 * Calls the backend, returning a typed result. Always-handled cases:
 * - non-200 with JSON body: returns ok:true with the JSON for proxy passthrough
 * - non-JSON body (HTML error page, gateway): returns ok:false / reason "non-json"
 * - network/timeout: returns ok:false / reason "network"
 */
export async function callBackend({
  path,
  method = "GET",
  body,
  headers,
  timeoutMs = REQUEST_TIMEOUT_MS,
}: BackendCall): Promise<BackendResponse> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);

  try {
    const init: RequestInit = {
      method,
      headers: {
        Accept: "application/json",
        ...(body !== undefined && body !== null
          ? { "Content-Type": "application/json" }
          : null),
        ...headers,
      },
      signal: ac.signal,
    };
    if (body !== undefined && body !== null) {
      init.body = typeof body === "string" ? body : JSON.stringify(body);
    }

    const url = path.startsWith("http") ? path : `${BACKEND_URL}${path.startsWith("/") ? path : `/${path}`}`;
    const res = await fetch(url, init);
    const text = await res.text();
    const parsed = safeParseJson(text);
    if (!parsed.ok) {
      return {
        ok: false,
        status: res.status,
        reason: "non-json",
        message:
          "The authentication server returned an unexpected response. Please try again later.",
      };
    }
    return { ok: true, status: res.status, json: parsed.data, raw: text };
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("Backend proxy error:", err);
    }
    return {
      ok: false,
      status: 502,
      reason: "network",
      message: "Unable to reach the server.",
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Standard JSON error response for proxy routes when the backend can't be reached
 * or returns a non-JSON body.
 */
export function backendErrorResponse(result: Extract<BackendResponse, { ok: false }>): NextResponse {
  return NextResponse.json(
    { message: result.message },
    { status: result.reason === "non-json" && result.status >= 400 ? result.status : 502 },
  );
}

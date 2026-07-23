import axios, { isAxiosError } from "axios";
import { emitAuthStateChanged } from "@/lib/auth/auth-events";

/**
 * All API traffic is funnelled through Next.js's `/api/proxy/...` catch-all so the
 * httpOnly access cookie can be read server-side and forwarded as `Authorization: Bearer`.
 * The browser never sees the JWT, removing the XSS-exfil surface that localStorage had.
 */
export const api = axios.create({
  baseURL: "/api/proxy",
  withCredentials: true,
  timeout: 20_000,
  headers: {
    "Content-Type": "application/json",
  },
});

type RefreshOutcome = "refreshed" | "invalid" | "transient";

let refreshInFlight: Promise<RefreshOutcome> | null = null;

async function attemptRefresh(): Promise<RefreshOutcome> {
  if (typeof window === "undefined") return "transient";
  if (!refreshInFlight) {
    refreshInFlight = fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    })
      .then((res): RefreshOutcome => {
        if (res.ok) return "refreshed";
        // 503 = backend unreachable/timed out — not proof the session is
        // dead. Only a genuine 401 means the refresh token itself is invalid.
        return res.status === 503 ? "transient" : "invalid";
      })
      .catch((): RefreshOutcome => "transient")
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (typeof window === "undefined" || !isAxiosError(error)) {
      return Promise.reject(error);
    }
    const original = error.config as
      | (typeof error.config & { _authRetry?: boolean })
      | undefined;
    const status = error.response?.status;

    if (status === 401 && original && !original._authRetry) {
      original._authRetry = true;
      const outcome = await attemptRefresh();
      if (outcome === "refreshed") {
        return api.request(original);
      }
      if (outcome === "invalid") {
        // The session is genuinely dead (/api/auth/refresh already cleared the
        // cookies). Announce it so AuthProvider re-resolves to
        // "unauthenticated" — DO NOT redirect. This site is built for guests:
        // a dead session on a public page must degrade to the guest view, not
        // throw a visitor off the magazine onto a login screen. Protected
        // surfaces send guests to login themselves via DashboardAuthGate.
        emitAuthStateChanged();
      }
      // "transient" (backend unreachable/timed out): don't log the user out
      // over a network blip — just let this request fail and try again later.
    }

    return Promise.reject(error);
  },
);

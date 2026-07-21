import axios, { isAxiosError } from "axios";
import { routing } from "@/i18n/routing";
import {
  getLeadingLocaleFromPath,
  stripLocalePrefixesFromPath,
} from "@/lib/i18n/strip-locale-from-path";

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

let redirectingToLogin = false;

function redirectToLogin(): void {
  if (redirectingToLogin || typeof window === "undefined") return;
  redirectingToLogin = true;
  const pathname = window.location.pathname;
  const locale = getLeadingLocaleFromPath(pathname) ?? routing.defaultLocale;
  const path = stripLocalePrefixesFromPath(`${pathname}${window.location.search}`);
  const next = encodeURIComponent(path);
  window.location.assign(`/${locale}/auth/login?callbackUrl=${next}`);
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
        redirectToLogin();
      }
      // "transient" (backend unreachable/timed out): don't log the user out
      // over a network blip — just let this request fail and try again later.
    }

    return Promise.reject(error);
  },
);

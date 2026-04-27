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

let refreshInFlight: Promise<boolean> | null = null;

async function attemptRefresh(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!refreshInFlight) {
    refreshInFlight = fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.ok)
      .catch(() => false)
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
      const refreshed = await attemptRefresh();
      if (refreshed) {
        return api.request(original);
      }
      redirectToLogin();
    }

    return Promise.reject(error);
  },
);

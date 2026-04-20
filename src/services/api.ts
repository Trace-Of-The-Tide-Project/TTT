import axios, { isAxiosError } from "axios";
import {
  AUTH_TOKEN_KEY,
  clearAuthStorageSync,
} from "@/lib/auth/storage-keys";
import { routing } from "@/i18n/routing";
import {
  getLeadingLocaleFromPath,
  stripLocalePrefixesFromPath,
} from "@/lib/i18n/strip-locale-from-path";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://backend-phd7.onrender.com";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token =
      localStorage.getItem("access_token") ?? sessionStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (typeof window === "undefined" || !isAxiosError(error)) {
      return Promise.reject(error);
    }
    const status = error.response?.status;
    const hadToken = Boolean(
      localStorage.getItem(AUTH_TOKEN_KEY) ?? sessionStorage.getItem(AUTH_TOKEN_KEY),
    );
    if (status === 401 && hadToken) {
      clearAuthStorageSync();
      const pathname = window.location.pathname;
      const locale = getLeadingLocaleFromPath(pathname) ?? routing.defaultLocale;
      const path = stripLocalePrefixesFromPath(`${pathname}${window.location.search}`);
      const next = encodeURIComponent(path);
      window.location.assign(`/${locale}/auth/login?callbackUrl=${next}`);
    }
    return Promise.reject(error);
  },
);

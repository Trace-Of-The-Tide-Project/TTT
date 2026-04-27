import type { CookieOptions } from "./types";

export const ACCESS_TOKEN_COOKIE = "tot_access_token";
export const REFRESH_TOKEN_COOKIE = "tot_refresh_token";
export const AUTH_USER_COOKIE = "tot_user";

const ONE_DAY_SECONDS = 60 * 60 * 24;
const THIRTY_DAYS_SECONDS = ONE_DAY_SECONDS * 30;

const isProd = process.env.NODE_ENV === "production";

const baseOptions: Omit<CookieOptions, "maxAge"> = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax",
  path: "/",
};

export const ACCESS_COOKIE_OPTIONS: CookieOptions = {
  ...baseOptions,
  maxAge: ONE_DAY_SECONDS,
};

export const REFRESH_COOKIE_OPTIONS: CookieOptions = {
  ...baseOptions,
  maxAge: THIRTY_DAYS_SECONDS,
};

/**
 * `auth_user` mirrors the JWT subject for fast SSR/CSR reads. Marked httpOnly to keep
 * the principal off `document.cookie` (clients fetch `/api/auth/me` for the same data).
 */
export const USER_COOKIE_OPTIONS: CookieOptions = {
  ...baseOptions,
  maxAge: THIRTY_DAYS_SECONDS,
};

export const CLEAR_COOKIE_OPTIONS: CookieOptions = {
  ...baseOptions,
  maxAge: 0,
};

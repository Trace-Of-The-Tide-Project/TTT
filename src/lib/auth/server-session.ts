import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import type { AuthUser } from "@/types/auth.types";
import {
  ACCESS_COOKIE_OPTIONS,
  ACCESS_TOKEN_COOKIE,
  AUTH_USER_COOKIE,
  CLEAR_COOKIE_OPTIONS,
  REFRESH_COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE,
  USER_COOKIE_OPTIONS,
} from "./cookie-config";
import type { SessionTokens } from "./types";

export async function readAccessToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export async function readRefreshToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(REFRESH_TOKEN_COOKIE)?.value ?? null;
}

export async function readSessionUser(): Promise<AuthUser | null> {
  const store = await cookies();
  const raw = store.get(AUTH_USER_COOKIE)?.value;
  if (!raw) return null;
  try {
    const decoded = decodeURIComponent(raw);
    const parsed = JSON.parse(decoded) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const u = parsed as Record<string, unknown>;
    if (typeof u.id !== "string" || typeof u.username !== "string" || typeof u.email !== "string") {
      return null;
    }
    return {
      id: u.id,
      username: u.username,
      full_name: typeof u.full_name === "string" ? u.full_name : undefined,
      email: u.email,
      roles: Array.isArray(u.roles) ? u.roles.filter((r): r is string => typeof r === "string") : undefined,
    };
  } catch {
    return null;
  }
}

function serializeUser(user: AuthUser): string {
  return encodeURIComponent(
    JSON.stringify({
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      email: user.email,
      roles: user.roles,
    }),
  );
}

export function writeSessionCookies(
  response: NextResponse,
  tokens: SessionTokens,
  user: AuthUser,
): void {
  response.cookies.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, ACCESS_COOKIE_OPTIONS);
  if (tokens.refreshToken) {
    response.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, REFRESH_COOKIE_OPTIONS);
  }
  response.cookies.set(AUTH_USER_COOKIE, serializeUser(user), USER_COOKIE_OPTIONS);
}

export function clearSessionCookies(response: NextResponse): void {
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", CLEAR_COOKIE_OPTIONS);
  response.cookies.set(REFRESH_TOKEN_COOKIE, "", CLEAR_COOKIE_OPTIONS);
  response.cookies.set(AUTH_USER_COOKIE, "", CLEAR_COOKIE_OPTIONS);
}

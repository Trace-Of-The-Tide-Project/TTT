import type { AuthUser } from "@/types/auth.types";
import type { SessionTokens } from "./types";

/**
 * Backend may wrap auth payloads in `{ data: ... }` and use either snake_case (`access_token`)
 * or camelCase (`accessToken`). This normalizer is pure: it inspects the body and returns
 * tokens + user when present. Storage is the caller's responsibility.
 */
export type NormalizedAuthResponse = {
  tokens: SessionTokens | null;
  user: AuthUser | null;
};

export function normalizeAuthBody(raw: unknown): NormalizedAuthResponse {
  if (!raw || typeof raw !== "object") return { tokens: null, user: null };

  const top = raw as Record<string, unknown>;
  const inner = isRecord(top.data) ? top.data : top;

  const accessToken = pickString(inner, "access_token", "accessToken") ??
    pickString(top, "access_token", "accessToken");
  const refreshToken = pickString(inner, "refresh_token", "refreshToken") ??
    pickString(top, "refresh_token", "refreshToken");

  const userField = pickRecord(inner, "user") ?? pickRecord(top, "user");
  const user = userField ? normalizeUser(userField) : null;

  const tokens: SessionTokens | null = accessToken
    ? { accessToken, refreshToken: refreshToken ?? undefined }
    : null;

  return { tokens, user };
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return Boolean(v && typeof v === "object" && !Array.isArray(v));
}

function pickString(obj: Record<string, unknown>, ...keys: string[]): string | null {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.length > 0) return v;
  }
  return null;
}

function pickRecord(obj: Record<string, unknown>, key: string): Record<string, unknown> | null {
  const v = obj[key];
  return isRecord(v) ? v : null;
}

function normalizeUser(u: Record<string, unknown>): AuthUser | null {
  const id = pickString(u, "id");
  const username = pickString(u, "username");
  const email = pickString(u, "email");
  if (!id || !username || !email) return null;
  return {
    id,
    username,
    email,
    full_name: pickString(u, "full_name", "fullName") ?? undefined,
    roles: Array.isArray(u.roles)
      ? u.roles.filter((r): r is string => typeof r === "string")
      : undefined,
  };
}

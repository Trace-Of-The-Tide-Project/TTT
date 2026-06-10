import { isAxiosError } from "axios";
import { api } from "./api";

/** Account overview, sourced from the live backend `GET /auth/me` (not the thin
 * proxy cookie payload, which omits status/email_verified/createdAt). */
export interface AccountOverview {
  id: string;
  username: string;
  full_name?: string;
  email: string;
  email_verified: boolean;
  status: string;
  roles: string[];
  createdAt: string;
}

/** One active session/device, as returned by the backend (never the token). */
export interface SessionItem {
  id: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  expires_at: string;
}

/** The exported account payload (shape mirrors the backend export endpoint). */
export interface AccountExport {
  exported_at: string;
  user: Record<string, unknown> | null;
  profile: Record<string, unknown> | null;
  settings: Record<string, unknown> | null;
  articles: Array<Record<string, unknown>>;
}

/** Pull a human-readable message out of an axios/HTTP error, mirroring the
 * extraction used by the change-password flow. */
export function accountErrorMessage(e: unknown, fallback: string): string {
  if (isAxiosError(e)) {
    const d = e.response?.data;
    if (typeof d === "string" && d.trim()) return d;
    if (d && typeof d === "object") {
      const o = d as Record<string, unknown>;
      const nested = o.data;
      if (nested && typeof nested === "object") {
        const m = (nested as Record<string, unknown>).message;
        if (typeof m === "string" && m.trim()) return m;
      }
      if (typeof o.message === "string" && o.message.trim()) return o.message;
      if (typeof o.error === "string" && o.error.trim()) return o.error;
    }
    return e.message || fallback;
  }
  if (e instanceof Error) return e.message;
  return fallback;
}

/** GET /auth/me (live backend) — full account fields for the overview card. */
export async function getAccountOverview(): Promise<AccountOverview> {
  const { data: envelope } = await api.get<Record<string, unknown>>("/auth/me");
  // Backend wraps response in { status, data: { ...user } } via global interceptor
  const data = (envelope.data ?? envelope) as Record<string, unknown>;
  return {
    id: String(data.id ?? ""),
    username: String(data.username ?? ""),
    full_name: typeof data.full_name === "string" ? data.full_name : undefined,
    email: String(data.email ?? ""),
    email_verified: Boolean(data.email_verified),
    status: String(data.status ?? "active"),
    roles: Array.isArray(data.roles)
      ? data.roles.filter((r): r is string => typeof r === "string")
      : [],
    createdAt: String(data.createdAt ?? ""),
  };
}

/** GET /author/settings/account/sessions — the caller's active sessions. */
export async function getSessions(): Promise<SessionItem[]> {
  const { data } = await api.get<{ sessions?: SessionItem[] }>(
    "/author/settings/account/sessions",
  );
  return Array.isArray(data?.sessions) ? data.sessions : [];
}

/** DELETE /author/settings/account/sessions/:id — revoke one session. */
export async function revokeSession(id: string): Promise<void> {
  await api.delete(`/author/settings/account/sessions/${encodeURIComponent(id)}`);
}

/** GET /author/settings/account/export — the caller's data as JSON. */
export async function exportAccountData(): Promise<AccountExport> {
  const { data } = await api.get<AccountExport>("/author/settings/account/export");
  return data;
}

/** POST /author/settings/account/deactivate — hide profile/articles (reversible). */
export async function deactivateAccount(password: string): Promise<{ message: string }> {
  const { data } = await api.post<{ message?: string }>(
    "/author/settings/account/deactivate",
    { password },
  );
  return { message: data?.message ?? "Account deactivated." };
}

/** POST /author/settings/account/delete — permanently close the account. */
export async function deleteAccount(password: string): Promise<{ message: string }> {
  const { data } = await api.post<{ message?: string }>(
    "/author/settings/account/delete",
    { password },
  );
  return { message: data?.message ?? "Account closed." };
}

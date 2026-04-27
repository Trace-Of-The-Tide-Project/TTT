import { NextResponse } from "next/server";
import { callBackend } from "@/lib/auth/proxy-backend";
import {
  clearSessionCookies,
  readAccessToken,
  readRefreshToken,
} from "@/lib/auth/server-session";

/**
 * Clears auth cookies. Best-effort notifies the backend so it can revoke the refresh
 * token; a backend failure does not block local logout.
 */
export async function POST() {
  const accessToken = await readAccessToken();
  const refreshToken = await readRefreshToken();

  if (accessToken) {
    void callBackend({
      path: "/auth/logout",
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: refreshToken ? { refreshToken } : undefined,
      timeoutMs: 4_000,
    }).catch(() => {});
  }

  const response = NextResponse.json({ ok: true }, { status: 200 });
  clearSessionCookies(response);
  return response;
}

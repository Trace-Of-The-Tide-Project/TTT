import { NextResponse } from "next/server";
import { callBackend } from "@/lib/auth/proxy-backend";
import { normalizeAuthBody } from "@/lib/auth/normalize-auth-response";
import {
  clearSessionCookies,
  readRefreshToken,
  readSessionUser,
  writeSessionCookies,
} from "@/lib/auth/server-session";

/**
 * Refreshes the session using the httpOnly refresh cookie. On success rewrites cookies
 * with the new access (and possibly refresh) token. On failure clears cookies so the
 * proxy/middleware sees a clean unauthenticated state.
 */
export async function POST() {
  const refreshToken = await readRefreshToken();
  if (!refreshToken) {
    const res = NextResponse.json({ user: null }, { status: 401 });
    clearSessionCookies(res);
    return res;
  }

  const result = await callBackend({
    path: "/auth/refresh",
    method: "POST",
    body: { refreshToken },
  });

  if (!result.ok || result.status >= 400) {
    const res = NextResponse.json({ user: null }, { status: 401 });
    clearSessionCookies(res);
    return res;
  }

  const { tokens, user: refreshedUser } = normalizeAuthBody(result.json);
  if (!tokens) {
    const res = NextResponse.json({ user: null }, { status: 401 });
    clearSessionCookies(res);
    return res;
  }

  // Some refresh endpoints don't echo the user back; reuse the stored principal.
  const user = refreshedUser ?? (await readSessionUser());
  if (!user) {
    const res = NextResponse.json({ user: null }, { status: 401 });
    clearSessionCookies(res);
    return res;
  }

  const response = NextResponse.json({ user }, { status: 200 });
  writeSessionCookies(response, tokens, user);
  return response;
}

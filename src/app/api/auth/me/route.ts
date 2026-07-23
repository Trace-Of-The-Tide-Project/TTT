import { NextResponse } from "next/server";
import { callBackend } from "@/lib/auth/proxy-backend";
import { normalizeAuthBody, normalizeMeBody } from "@/lib/auth/normalize-auth-response";
import {
  clearSessionCookies,
  readAccessToken,
  readRefreshToken,
  readSessionUser,
  writeSessionCookies,
  writeSessionUserCookie,
} from "@/lib/auth/server-session";

/**
 * Returns the current session principal (or `{ user: null }` when unauthenticated).
 * Always re-fetches from the backend so profile edits (name, avatar) show up
 * immediately — the httpOnly user cookie is only a fallback if the backend
 * call fails, since it's a stale snapshot from login time otherwise.
 *
 * The access JWT lives 1h but its cookie lives 24h and the `tot_user` snapshot
 * 30d, so for most of a returning visitor's day the backend rejects the token
 * while the snapshot still exists. Answering "authenticated" from that snapshot
 * makes every consumer of `useAuth().status` fire protected calls that 401, and
 * the axios interceptor turns the first one into a full-page redirect to
 * /auth/login — off a public page. So a rejected token is refreshed here, and
 * only a refresh the backend itself rejects ends the session.
 */
export async function GET() {
  const token = await readAccessToken();
  const refreshToken = await readRefreshToken();

  if (token) {
    const result = await callBackend({
      path: "/auth/me",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (result.ok && result.status < 400) {
      const user = normalizeMeBody(result.json);
      if (user) {
        const response = NextResponse.json({ user }, { status: 200 });
        writeSessionUserCookie(response, user);
        return response;
      }
    }

    // Anything other than an explicit rejection (backend down, 5xx, garbage
    // body) is transient — keep the snapshot rather than churn the session.
    const rejected = result.ok && (result.status === 401 || result.status === 403);
    if (!rejected) {
      return NextResponse.json({ user: await readSessionUser() }, { status: 200 });
    }
  }

  if (!refreshToken) {
    const res = NextResponse.json({ user: null }, { status: 200 });
    if (token) clearSessionCookies(res);
    return res;
  }

  const refreshed = await callBackend({
    path: "/auth/refresh",
    method: "POST",
    body: { refreshToken },
  });

  // Unreachable backend: not proof the session is dead (same rule as
  // /api/auth/refresh). Leave the cookies alone and answer from the snapshot.
  if (!refreshed.ok) {
    return NextResponse.json({ user: await readSessionUser() }, { status: 200 });
  }

  if (refreshed.status < 400) {
    const { tokens, user } = normalizeAuthBody(refreshed.json);
    const principal = user ?? (await readSessionUser());
    if (tokens && principal) {
      const res = NextResponse.json({ user: principal }, { status: 200 });
      writeSessionCookies(res, tokens, principal);
      return res;
    }
  }

  const res = NextResponse.json({ user: null }, { status: 200 });
  clearSessionCookies(res);
  return res;
}

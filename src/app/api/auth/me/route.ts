import { NextResponse } from "next/server";
import { callBackend } from "@/lib/auth/proxy-backend";
import { normalizeMeBody } from "@/lib/auth/normalize-auth-response";
import { readAccessToken, readSessionUser, writeSessionUserCookie } from "@/lib/auth/server-session";

/**
 * Returns the current session principal (or `{ user: null }` when unauthenticated).
 * Always re-fetches from the backend so profile edits (name, avatar) show up
 * immediately — the httpOnly user cookie is only a fallback if the backend
 * call fails, since it's a stale snapshot from login time otherwise.
 */
export async function GET() {
  const token = await readAccessToken();
  if (!token) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

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

  const user = await readSessionUser();
  return NextResponse.json({ user }, { status: 200 });
}

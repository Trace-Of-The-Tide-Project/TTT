import { NextResponse } from "next/server";
import { readAccessToken, readSessionUser } from "@/lib/auth/server-session";

/**
 * Returns the current session principal (or `{ user: null }` when unauthenticated).
 * Reads from the httpOnly user cookie, which is written alongside the access token at
 * login/signup. Used by the client to hydrate React state without exposing the JWT.
 */
export async function GET() {
  const token = await readAccessToken();
  if (!token) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
  const user = await readSessionUser();
  return NextResponse.json({ user }, { status: 200 });
}

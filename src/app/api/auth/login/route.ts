import { NextResponse } from "next/server";
import { backendErrorResponse, callBackend } from "@/lib/auth/proxy-backend";
import { normalizeAuthBody } from "@/lib/auth/normalize-auth-response";
import { writeSessionCookies } from "@/lib/auth/server-session";

type LoginBody = {
  email?: string;
  password?: string;
};

/**
 * Proxies sign-in: forwards `{ email, password }` to the upstream API,
 * sets httpOnly auth cookies on success, and never returns the raw token
 * to the browser.
 *
 * The backend DTO is strict (`whitelist + forbidNonWhitelisted`), so this
 * route deliberately sends *only* the fields the backend accepts.
 */
export async function POST(request: Request) {
  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const email = (body.email ?? "").trim();
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json(
      { message: "Email and password are required." },
      { status: 400 },
    );
  }

  const result = await callBackend({
    path: "/auth/login",
    method: "POST",
    body: { email, password },
  });

  if (!result.ok) {
    return backendErrorResponse(result);
  }

  if (result.status >= 400) {
    return NextResponse.json(result.json, { status: result.status });
  }

  const { tokens, user } = normalizeAuthBody(result.json);
  if (!tokens || !user) {
    return NextResponse.json(
      { message: "Authentication response was missing the session." },
      { status: 502 },
    );
  }

  const response = NextResponse.json({ user }, { status: 200 });
  writeSessionCookies(response, tokens, user);
  return response;
}

import { NextResponse } from "next/server";
import { backendErrorResponse, callBackend } from "@/lib/auth/proxy-backend";
import { normalizeAuthBody } from "@/lib/auth/normalize-auth-response";
import { writeSessionCookies } from "@/lib/auth/server-session";

type SignupBody = {
  username?: string;
  email?: string;
  password?: string;
  full_name?: string;
  phone_number?: string;
};

/**
 * Proxies sign-up: forwards every required backend field including `phone_number`,
 * and — when the API issues a session immediately — sets httpOnly auth cookies.
 * If the API returns no token (verification flow), we passthrough JSON unchanged.
 */
export async function POST(request: Request) {
  let body: SignupBody;
  try {
    body = (await request.json()) as SignupBody;
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const username = (body.username ?? "").trim();
  const email = (body.email ?? "").trim();
  const password = body.password ?? "";
  const full_name = (body.full_name ?? "").trim();
  const phone_number = (body.phone_number ?? "").trim();

  if (!username || !email || !password || !full_name) {
    return NextResponse.json({ message: "All required fields must be filled." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { message: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }

  const payload: Record<string, string> = {
    username,
    email,
    password,
    full_name,
  };
  if (phone_number) payload.phone_number = phone_number;

  const result = await callBackend({
    path: "/auth/signup",
    method: "POST",
    body: payload,
  });

  if (!result.ok) {
    return backendErrorResponse(result);
  }

  if (result.status >= 400) {
    return NextResponse.json(result.json, { status: result.status });
  }

  const { tokens, user } = normalizeAuthBody(result.json);

  // No session issued → email verification flow. Passthrough body so the client can
  // read `email` / `message` and route to /auth/check-email.
  if (!tokens || !user) {
    return NextResponse.json(result.json, { status: result.status });
  }

  const response = NextResponse.json({ user }, { status: result.status });
  writeSessionCookies(response, tokens, user);
  return response;
}

import { NextResponse } from "next/server";
import { backendErrorResponse, callBackend } from "@/lib/auth/proxy-backend";
import { normalizeAuthBody } from "@/lib/auth/normalize-auth-response";
import { writeSessionCookies } from "@/lib/auth/server-session";

export async function POST(request: Request) {
  let body: { token?: string };
  try {
    body = (await request.json()) as { token?: string };
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const token = (body.token ?? "").trim();
  if (!token) {
    return NextResponse.json(
      { message: "Invalid or missing verification link." },
      { status: 400 },
    );
  }

  const result = await callBackend({
    path: "/auth/verify-email",
    method: "POST",
    body: { token },
  });

  if (!result.ok) return backendErrorResponse(result);
  if (result.status >= 400) {
    return NextResponse.json(result.json, { status: result.status });
  }

  const { tokens, user } = normalizeAuthBody(result.json);
  if (tokens && user) {
    const response = NextResponse.json({ user }, { status: result.status });
    writeSessionCookies(response, tokens, user);
    return response;
  }

  return NextResponse.json(result.json, { status: result.status });
}

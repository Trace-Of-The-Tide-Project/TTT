import { NextResponse } from "next/server";
import { backendErrorResponse, callBackend } from "@/lib/auth/proxy-backend";

export async function POST(request: Request) {
  let body: { email?: string };
  try {
    body = (await request.json()) as { email?: string };
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }
  const email = (body.email ?? "").trim();
  if (!email) {
    return NextResponse.json({ message: "Email is required." }, { status: 400 });
  }

  const result = await callBackend({
    path: "/auth/forgot-password",
    method: "POST",
    body: { email },
  });

  if (!result.ok) return backendErrorResponse(result);
  return NextResponse.json(result.json, { status: result.status });
}

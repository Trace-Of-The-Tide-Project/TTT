import { NextResponse } from "next/server";
import { backendErrorResponse, callBackend } from "@/lib/auth/proxy-backend";

export async function POST(request: Request) {
  let body: { token?: string; newPassword?: string; confirmPassword?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const token = (body.token ?? "").trim();
  const newPassword = body.newPassword ?? "";
  const confirmPassword = body.confirmPassword ?? "";

  if (!token) {
    return NextResponse.json(
      { message: "Invalid or missing reset link." },
      { status: 400 },
    );
  }
  if (newPassword.length < 8) {
    return NextResponse.json(
      { message: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }
  if (newPassword !== confirmPassword) {
    return NextResponse.json({ message: "Passwords do not match." }, { status: 400 });
  }

  const result = await callBackend({
    path: "/auth/reset-password",
    method: "POST",
    body: {
      token,
      newPassword: newPassword.trim(),
      confirmPassword: confirmPassword.trim(),
    },
  });

  if (!result.ok) return backendErrorResponse(result);
  return NextResponse.json(result.json, { status: result.status });
}

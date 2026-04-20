import { NextResponse } from "next/server";
import { DEFAULT_PUBLIC_API_BASE_URL } from "@/lib/public-api-base-url";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_PUBLIC_API_BASE_URL;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { message: "Email is required." },
        { status: 400 }
      );
    }
    const res = await fetch(`${BACKEND_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Forgot password proxy error:", err);
    return NextResponse.json(
      { message: "Unable to reach the server." },
      { status: 502 }
    );
  }
}

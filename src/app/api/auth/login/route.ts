import { NextResponse } from "next/server"
import { DEFAULT_PUBLIC_API_BASE_URL } from "@/lib/public-api-base-url"

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_PUBLIC_API_BASE_URL

function parseJsonBody(text: string): { ok: true; data: unknown } | { ok: false } {
  const trimmed = text.trim()
  if (!trimmed) return { ok: true, data: {} }
  try {
    return { ok: true, data: JSON.parse(trimmed) as unknown }
  } catch {
    return { ok: false }
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const res = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const text = await res.text()
    const parsed = parseJsonBody(text)
    if (!parsed.ok) {
      return NextResponse.json(
        {
          message:
            "Authentication server returned a non-JSON response. Check NEXT_PUBLIC_API_BASE_URL and backend logs.",
        },
        { status: res.status >= 400 ? res.status : 502 },
      )
    }
    return NextResponse.json(parsed.data, { status: res.status })
  } catch (err) {
    console.error("Login proxy error:", err)
    return NextResponse.json({ message: "Unable to reach the server." }, { status: 502 })
  }
}

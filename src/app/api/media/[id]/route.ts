import { NextResponse } from "next/server";
import { getBackendBaseUrl } from "@/lib/auth/proxy-backend";

const BACKEND_URL = getBackendBaseUrl();

const MEDIA_TIMEOUT_MS = 10_000;

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: RouteContext) {
  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ message: "Missing asset id" }, { status: 400 });
  }

  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), MEDIA_TIMEOUT_MS);

  let upstream: Response;
  try {
    upstream = await fetch(`${BACKEND_URL}/public/media/${encodeURIComponent(id)}/url`, {
      cache: "no-store",
      signal: ac.signal,
    });
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("Media redirect fetch failed:", err);
    }
    return NextResponse.json({ message: "Unable to reach the server." }, { status: 502 });
  } finally {
    clearTimeout(timer);
  }

  if (!upstream.ok) {
    return NextResponse.json(
      { message: "File not found or no longer available." },
      { status: upstream.status },
    );
  }

  let body: unknown;
  try {
    body = await upstream.json();
  } catch {
    return NextResponse.json({ message: "Unexpected response from the server." }, { status: 502 });
  }

  const url = (body as { data?: { url?: unknown } } | null)?.data?.url;
  if (typeof url !== "string" || !url) {
    return NextResponse.json({ message: "File not found or no longer available." }, { status: 404 });
  }

  return NextResponse.redirect(url, { status: 302, headers: { "Cache-Control": "no-store" } });
}

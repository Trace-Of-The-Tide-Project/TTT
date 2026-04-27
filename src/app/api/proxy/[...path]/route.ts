import { NextResponse } from "next/server";
import { getBackendBaseUrl } from "@/lib/auth/proxy-backend";
import { readAccessToken } from "@/lib/auth/server-session";

const BACKEND_URL = getBackendBaseUrl();

const PROXY_TIMEOUT_MS = 30_000;

const HOP_BY_HOP_REQUEST_HEADERS = new Set([
  "host",
  "connection",
  "content-length",
  "accept-encoding",
  "transfer-encoding",
  "upgrade",
  "te",
  "trailer",
  "keep-alive",
  "proxy-authorization",
  "proxy-authenticate",
  "cookie",
]);

const HOP_BY_HOP_RESPONSE_HEADERS = new Set([
  "transfer-encoding",
  "connection",
  "keep-alive",
  "trailer",
  "upgrade",
  "content-encoding",
  "content-length",
  "set-cookie",
]);

type RouteContext = { params: Promise<{ path: string[] }> };

async function handle(request: Request, ctx: RouteContext): Promise<Response> {
  const { path } = await ctx.params;
  const segments = (path ?? []).map(encodeURIComponent).join("/");
  const url = new URL(request.url);
  const upstreamUrl = `${BACKEND_URL}/${segments}${url.search}`;

  const token = await readAccessToken();

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_REQUEST_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });
  if (token) headers.set("Authorization", `Bearer ${token}`);
  else headers.delete("Authorization");

  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), PROXY_TIMEOUT_MS);

  const init: RequestInit & { duplex?: "half" } = {
    method: request.method,
    headers,
    signal: ac.signal,
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = request.body;
    init.duplex = "half";
  }

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, init);
  } catch (err) {
    clearTimeout(timer);
    if (process.env.NODE_ENV === "development") {
      console.error("Proxy fetch failed:", err);
    }
    return NextResponse.json(
      { message: "Unable to reach the server." },
      { status: 502 },
    );
  } finally {
    clearTimeout(timer);
  }

  const respHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_RESPONSE_HEADERS.has(key.toLowerCase())) {
      respHeaders.set(key, value);
    }
  });

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: respHeaders,
  });
}

export async function GET(req: Request, ctx: RouteContext) { return handle(req, ctx); }
export async function POST(req: Request, ctx: RouteContext) { return handle(req, ctx); }
export async function PUT(req: Request, ctx: RouteContext) { return handle(req, ctx); }
export async function PATCH(req: Request, ctx: RouteContext) { return handle(req, ctx); }
export async function DELETE(req: Request, ctx: RouteContext) { return handle(req, ctx); }

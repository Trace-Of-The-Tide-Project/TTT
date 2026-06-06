import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

/**
 * Hostnames that should serve the editorial magazine at their root.
 *
 * On these hosts the root path (`/`, `/en`, `/ar`, …) is rewritten to
 * the magazine route so visitors land on the magazine, while the apex
 * domain keeps the hex-grid homepage at its root. The address bar is
 * left untouched (internal rewrite, not a redirect).
 */
const MAGAZINE_HOSTS = new Set([
  "magazine.traceofthetide.org",
  // Local/dev convenience — add subdomains used in other environments:
  // "magazine.localhost",
]);

/** Strip the port from a Host header value (`example.com:3000` → `example.com`). */
function normalizeHost(host: string | null): string {
  return (host ?? "").split(":")[0].toLowerCase();
}

/** True for `/`, `/en`, `/ar`, … i.e. the locale root with nothing after it. */
function isLocaleRoot(pathname: string): boolean {
  if (pathname === "/") return true;
  const seg = pathname.split("/").filter(Boolean); // drop empty leading segment
  return (
    seg.length === 1 && (routing.locales as readonly string[]).includes(seg[0])
  );
}

export default function middleware(request: NextRequest) {
  const host = normalizeHost(request.headers.get("host"));

  // Only the magazine subdomain rewrites its root to the magazine page.
  // Deeper paths (e.g. /en/books) are served normally on every host.
  if (MAGAZINE_HOSTS.has(host) && isLocaleRoot(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    // Keep the locale prefix when present (/ar → /ar/magazine, a clean
    // rewrite); for a bare "/" hand "/magazine" to next-intl and let it
    // add the default-locale prefix.
    url.pathname =
      url.pathname === "/" ? "/magazine" : `${url.pathname}/magazine`;
    // Re-run next-intl on the rewritten URL so locale detection /
    // prefixing still applies on top of the magazine path.
    return intlMiddleware(new NextRequest(url, request)) as NextResponse;
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};

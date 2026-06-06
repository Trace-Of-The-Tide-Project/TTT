import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
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
    // Mutate request.nextUrl in place rather than building a fresh
    // NextRequest. Next.js derives the internal rewrite target from
    // request.nextUrl; cloning into `new NextRequest(url, request)`
    // copies the original request's internal routing headers (which
    // still point at the un-rewritten path), so next-intl's pass-through
    // rewrite for an already-localized path like /ar lands back on
    // /[locale] instead of /[locale]/magazine.
    //
    // Keep the locale prefix when present (/ar → /ar/magazine, a clean
    // rewrite); for a bare "/" set "/magazine" and let next-intl add the
    // default-locale prefix via redirect.
    request.nextUrl.pathname =
      request.nextUrl.pathname === "/"
        ? "/magazine"
        : `${request.nextUrl.pathname}/magazine`;
  }

  // next-intl applies locale detection / prefixing on top of whatever
  // path we hand it (rewritten for the magazine host, untouched otherwise).
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};

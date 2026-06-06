import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
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

/**
 * Match the leading locale segment of a pathname, e.g. `/ar/x` → `ar`.
 * Returns null when the path has no locale prefix (e.g. a bare `/`).
 */
function leadingLocale(pathname: string): string | null {
  const seg = pathname.split("/").filter(Boolean)[0];
  return seg && (routing.locales as readonly string[]).includes(seg)
    ? seg
    : null;
}

/** True for `/`, `/en`, `/ar`, … i.e. the locale root with nothing after it. */
function isLocaleRoot(pathname: string): boolean {
  if (pathname === "/") return true;
  const seg = pathname.split("/").filter(Boolean);
  return seg.length === 1 && leadingLocale(pathname) !== null;
}

export default function middleware(request: NextRequest) {
  const host = normalizeHost(request.headers.get("host"));
  const { pathname } = request.nextUrl;

  // Everything except the magazine host (and its non-root paths) goes
  // straight through next-intl untouched.
  if (!MAGAZINE_HOSTS.has(host) || !isLocaleRoot(pathname)) {
    return intlMiddleware(request);
  }

  // Magazine host, root path. We must serve /<locale>/magazine.
  //
  // We can't just mutate request.nextUrl and re-run next-intl: when the
  // path is already localized (e.g. /ar), next-intl sees the target as
  // "no rewrite needed" and emits a bare NextResponse.next(), so Next
  // falls back to the originally matched /[locale] route (the homepage).
  // Instead we issue the rewrite ourselves, then merge next-intl's
  // headers (locale cookie, x-middleware-request-x-next-intl-locale, …)
  // so locale handling still applies.

  const locale = leadingLocale(pathname);

  // Bare "/" with no locale prefix: let next-intl decide the locale and
  // redirect, but send it to the magazine instead of the bare root.
  if (!locale) {
    const intlResponse = intlMiddleware(request);
    const location = intlResponse.headers.get("location");
    if (location) {
      // next-intl redirected "/" → "/<defaultLocale>"; append /magazine.
      const target = new URL(location, request.url);
      if (!target.pathname.endsWith("/magazine")) {
        target.pathname = `${target.pathname.replace(/\/$/, "")}/magazine`;
      }
      return NextResponse.redirect(target, intlResponse);
    }
    // Fallback: rewrite "/" → "/<defaultLocale>/magazine".
    const url = request.nextUrl.clone();
    url.pathname = `/${routing.defaultLocale}/magazine`;
    return NextResponse.rewrite(url, { request, headers: intlResponse.headers });
  }

  // Already-localized root (/ar, /en, …): run next-intl for its locale
  // headers/cookies, then rewrite the SAME response to /<locale>/magazine.
  const intlResponse = intlMiddleware(request);

  // If next-intl decided to redirect (e.g. locale mismatch), respect it
  // but retarget to the magazine path.
  const location = intlResponse.headers.get("location");
  if (location) {
    const target = new URL(location, request.url);
    if (!target.pathname.endsWith("/magazine")) {
      target.pathname = `${target.pathname.replace(/\/$/, "")}/magazine`;
    }
    return NextResponse.redirect(target, intlResponse);
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}/magazine`;
  return NextResponse.rewrite(url, { request, headers: intlResponse.headers });
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};

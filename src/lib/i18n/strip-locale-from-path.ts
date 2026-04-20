import { routing } from "@/i18n/routing";

export function getLeadingLocaleFromPath(pathname: string): string | null {
  for (const loc of routing.locales) {
    if (pathname === `/${loc}` || pathname.startsWith(`/${loc}/`)) return loc;
  }
  return null;
}

/**
 * Turns `/en/admin` → `/admin` so `next-intl` navigation can prefix the active locale once.
 * Also strips accidental duplicate prefixes (`/en/en/admin` → `/admin`).
 */
export function stripLocalePrefixesFromPath(input: string): string {
  let s = input.trim();
  if (!s) return "/";

  try {
    if (/^[a-z]+:/i.test(s)) {
      const u = new URL(s);
      s = u.pathname + u.search;
    }
  } catch {
    // keep s as-is
  }

  if (s.startsWith("//")) return "/admin";
  if (!s.startsWith("/")) s = `/${s}`;

  let prev = "";
  while (prev !== s) {
    prev = s;
    for (const loc of routing.locales) {
      if (s === `/${loc}`) {
        s = "/";
        break;
      }
      if (s.startsWith(`/${loc}/`)) {
        s = s.slice(`/${loc}`.length) || "/";
        break;
      }
    }
  }

  return s || "/";
}

/**
 * `usePathname()` from `next-intl/navigation` is usually locale-stripped, but some code paths
 * still see a leading `/{locale}` segment. Normalize once before comparing to config `href`s.
 */
export function normalizeAppPathname(pathname: string | null | undefined): string | null {
  if (pathname == null) return null;
  const trimmed = pathname.trim();
  if (!trimmed) return null;
  return stripLocalePrefixesFromPath(trimmed);
}

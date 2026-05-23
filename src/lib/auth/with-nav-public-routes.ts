/**
 * `(withNav)` routes that may render without a session. Pathnames are from
 * `usePathname()` (next-intl): no locale prefix, home is `/`.
 */
const GUEST_ALLOWED_WITH_NAV = new Set([
  "/",
  "",
  "/magazine",
  // TEMP (local preview only — revert before commit): let guests view the
  // content pages without a session so the styling can be checked.
  "/content",
  "/content/video",
  "/content/audio",
  "/content/article",
  "/content/gallery",
]);

export function guestMayAccessWithNavRoute(pathname: string | null | undefined): boolean {
  if (pathname == null) return false;
  const normalized = pathname === "" ? "/" : pathname;
  return GUEST_ALLOWED_WITH_NAV.has(normalized);
}

import { normalizeAppPathname } from "@/lib/i18n/strip-locale-from-path";

/**
 * Routes where the admin topbar shows the "Admin Settings" context title
 * (personal admin settings + system settings / security from the dashboard nav).
 */
const ADMIN_SETTINGS_HEADER_PREFIXES = [
  "/admin/profile",
  "/admin/availability",
  "/admin/notifications",
  "/admin/privacy",
  "/admin/password",
  "/admin/account",
  "/admin/settings",
  "/admin/security",
] as const;

export function shouldShowAdminSettingsHeader(pathname: string | null): boolean {
  const path = normalizeAppPathname(pathname);
  if (!path || !path.startsWith("/admin")) return false;
  return ADMIN_SETTINGS_HEADER_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}
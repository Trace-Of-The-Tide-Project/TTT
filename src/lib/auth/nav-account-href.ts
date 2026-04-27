import type { AuthUser } from "@/types/auth.types";

const ADMIN_ROLE_PATTERN = /^(super[_-]?admin|admin|moderator|editor)$/i;

/**
 * Determines where the navbar's user chip should link. **Roles only** — relying on
 * substring matches against `username` / `full_name` was bug-prone (e.g. someone named
 * "Mohammed Adminson" would have been routed to the admin dashboard).
 */
export function getNavAccountHref(user: AuthUser): string {
  const roles = user.roles ?? [];
  if (roles.some((role) => ADMIN_ROLE_PATTERN.test(String(role)))) {
    return "/admin";
  }
  return "/profile";
}

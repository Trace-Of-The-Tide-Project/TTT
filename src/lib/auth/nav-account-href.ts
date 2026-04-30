import type { AuthUser } from "@/types/auth.types";
import { isAdmin } from "./roles";

/**
 * Determines where the navbar's user chip should link. **Roles only** — relying on
 * substring matches against `username` / `full_name` was bug-prone (e.g. someone named
 * "Mohammed Adminson" would have been routed to the admin dashboard).
 */
export function getNavAccountHref(user: AuthUser): string {
  return isAdmin(user) ? "/admin" : "/profile";
}

import type { AuthUser } from "@/types/auth.types";

const ADMIN_ROLE_PATTERN =
  /^(super[_-]?admin|content[_-]?admin|finance[_-]?admin|support[_-]?admin|admin)$/i;

export function isAdmin(user: Pick<AuthUser, "roles"> | null | undefined): boolean {
  return !!user?.roles?.some((role) => ADMIN_ROLE_PATTERN.test(String(role)));
}

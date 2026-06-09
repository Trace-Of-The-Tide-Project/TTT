import type { AuthUser } from "@/types/auth.types";

const ADMIN_ROLE_PATTERN =
  /^(super[_-]?admin|content[_-]?admin|finance[_-]?admin|support[_-]?admin|admin)$/i;

const EDITOR_ROLE_PATTERN = /^editors?$/i;

export function isAdmin(user: Pick<AuthUser, "roles"> | null | undefined): boolean {
  return !!user?.roles?.some((role) => ADMIN_ROLE_PATTERN.test(String(role)));
}

export function isEditor(user: Pick<AuthUser, "roles"> | null | undefined): boolean {
  return !!user?.roles?.some((role) => EDITOR_ROLE_PATTERN.test(String(role)));
}

/** Editors and admins manage the editorial-review notification toggles. */
export function canManageEditorNotifications(
  user: Pick<AuthUser, "roles"> | null | undefined,
): boolean {
  return isAdmin(user) || isEditor(user);
}

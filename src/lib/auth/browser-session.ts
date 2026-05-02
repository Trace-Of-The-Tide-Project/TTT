import type { BrowserAuthStatus } from "@/types/auth.types";

/**
 * `true` when `/api/auth/me` returned a user (cookie-backed session). See
 * `BrowserAuthStatus` in `auth.types.ts`.
 */
export function hasBrowserAuthSession(status: BrowserAuthStatus): boolean {
  return status === "authenticated";
}

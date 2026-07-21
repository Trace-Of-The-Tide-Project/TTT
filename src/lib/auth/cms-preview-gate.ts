import { readAccessToken } from "@/lib/auth/server-session";
import { normalizeMeBody } from "@/lib/auth/normalize-auth-response";
import { callBackend } from "@/lib/auth/proxy-backend";
import { isAdmin } from "@/lib/auth/roles";

/**
 * Authoritative server-side gate for the CMS live-preview flag
 * (`?cmsPreview=1`). The flag alone grants nothing — it only switches
 * which `CmsPage` a route renders, and only after this check passes.
 *
 * Verification chain (no new auth mechanism — reuses the existing
 * cookie → backend round trip used by `/api/auth/me`):
 *   1. Read the httpOnly `tot_access_token` cookie (`readAccessToken`).
 *      Absent → not logged in → gate fails.
 *   2. Send it as `Authorization: Bearer <token>` to the backend's
 *      `/auth/me` (`callBackend`). The backend verifies the JWT
 *      signature/expiry itself (passport-jwt) and returns the *live*
 *      user record — this is NOT the client-trusted `tot_user` snapshot
 *      cookie, so a forged/stale cookie can't grant preview access.
 *   3. Check `roles` against the same `isAdmin` pattern the client-side
 *      `AdminAuthGate` uses (`src/lib/auth/roles.ts`), so "admin" is
 *      defined identically on both sides.
 *
 * A logged-out visitor, or a logged-in non-admin, hitting
 * `/en/home?cmsPreview=1` gets `false` here and the route falls back to
 * its normal published render.
 */
export async function isCmsPreviewAuthorized(): Promise<boolean> {
  const token = await readAccessToken();
  if (!token) return false;

  const result = await callBackend({
    path: "/auth/me",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!result.ok || result.status >= 400) return false;

  const user = normalizeMeBody(result.json);
  return isAdmin(user);
}

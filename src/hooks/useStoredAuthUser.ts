/**
 * @deprecated Prefer `useAuthUser` / `useAuth` from `@/components/providers/AuthProvider`.
 * This shim exists to avoid breaking the wide set of call-sites the cookie-session
 * refactor touches; remove once those imports are migrated.
 */
export { useAuthUser as useStoredAuthUser } from "@/components/providers/AuthProvider";

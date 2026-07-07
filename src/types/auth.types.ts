/**
 * Auth API request/response types.
 */

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  full_name: string;
  phone_number?: string;
}

/**
 * Backend `/auth/login` accepts `email` + `password` and rejects unknown
 * properties (the DTO is strict). Username login is not currently supported.
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AuthUser {
  id: string;
  username: string;
  full_name?: string;
  email: string;
  avatar_url?: string | null;
  roles?: string[];
}

/** Returned by `/api/auth/login` and `/api/auth/me`. The token never crosses the wire. */
export interface AuthSession {
  user: AuthUser;
}

/** Signup succeeded but the server did not issue a session (verify email first). */
export type SignupPendingVerification = {
  pendingEmailVerification: true;
  email: string;
  message?: string;
};

export type SignupResult = AuthSession | SignupPendingVerification;

/**
 * Client-side view of whether a session exists. Populated by `AuthProvider` after
 * `fetchCurrentUser()` → `GET /api/auth/me` with `credentials: "include"`. That route
 * reads httpOnly auth cookies (`lib/auth/server-session.ts`). Not stored in
 * `localStorage`.
 */
export type BrowserAuthStatus = "loading" | "authenticated" | "unauthenticated";

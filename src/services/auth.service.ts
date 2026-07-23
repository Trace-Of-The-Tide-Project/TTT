import type {
  AuthSession,
  AuthUser,
  ChangePasswordRequest,
  LoginRequest,
  SignupRequest,
  SignupResult,
} from "@/types/auth.types";
import { api } from "./api";

/**
 * Browser-side event emitted when the local session changes (login / logout).
 * Components can listen to refresh user-dependent UI without re-mounting.
 * Defined in `lib/auth/auth-events` and re-exported here for existing callers.
 */
import { emitAuthStateChanged } from "@/lib/auth/auth-events";

export { AUTH_STATE_CHANGED_EVENT, emitAuthStateChanged } from "@/lib/auth/auth-events";

async function postJson<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = null;
    }
  }
  if (!res.ok) {
    throw makeHttpError(res.status, parsed);
  }
  return (parsed ?? {}) as T;
}

function makeHttpError(status: number, body: unknown): Error & {
  response?: { status: number; data: unknown };
} {
  const message =
    extractMessage(body) ?? (status >= 500 ? "Server error. Please try again." : "Request failed.");
  const err = new Error(message) as Error & { response?: { status: number; data: unknown } };
  err.response = { status, data: body };
  return err;
}

function extractMessage(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const obj = body as Record<string, unknown>;
  const inner = obj.data && typeof obj.data === "object" ? (obj.data as Record<string, unknown>) : obj;
  const m = inner.message ?? obj.message;
  if (typeof m === "string" && m.trim()) return m.trim();
  if (Array.isArray(m) && typeof m[0] === "string") return m[0];
  if (typeof obj.error === "string") return obj.error;
  return null;
}

/**
 * POST /api/auth/signup — when the API issues a session immediately the cookie is
 * already set by the proxy and we resolve to `AuthSession`. Otherwise we resolve to
 * `pendingEmailVerification` so the caller can route to the check-email screen.
 */
export async function signup(data: SignupRequest): Promise<SignupResult> {
  const body: Record<string, string> = {
    username: data.username.trim(),
    email: data.email.trim(),
    password: data.password,
    full_name: data.full_name.trim(),
  };
  if (data.phone_number?.trim()) body.phone_number = data.phone_number.trim();

  const result = await postJson<{ user?: AuthUser; email?: string; message?: string }>(
    "/api/auth/signup",
    body,
  );

  if (result.user) {
    emitAuthStateChanged();
    return { user: result.user };
  }

  return {
    pendingEmailVerification: true,
    email: result.email ?? data.email.trim(),
    message: result.message,
  };
}

/**
 * POST /api/auth/login — sets httpOnly cookies on success. The browser never sees
 * the access token. The backend's login DTO is strict and only accepts `email`.
 */
export async function login(data: LoginRequest): Promise<AuthSession> {
  const result = await postJson<{ user?: AuthUser }>("/api/auth/login", {
    email: data.email.trim(),
    password: data.password,
  });
  if (!result.user) {
    throw new Error("Login response missing user.");
  }
  emitAuthStateChanged();
  return { user: result.user };
}

/** POST /api/auth/logout — clears cookies and notifies listeners. */
export async function logout(): Promise<void> {
  try {
    await postJson("/api/auth/logout");
  } finally {
    emitAuthStateChanged();
  }
}

/** GET /api/auth/me — `null` when unauthenticated. */
export async function fetchCurrentUser(): Promise<AuthUser | null> {
  const res = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" });
  if (!res.ok) return null;
  const body = (await res.json().catch(() => ({}))) as { user?: AuthUser | null };
  return body.user ?? null;
}

/** POST /auth/verify-email — proxy handles the upstream call; cookies set if API returns a session. */
export type VerifyEmailResult = { loggedIn: boolean };

export async function verifyEmail(token: string): Promise<VerifyEmailResult> {
  const result = await postJson<{ user?: AuthUser }>("/api/auth/verify-email", {
    token: token.trim(),
  });
  const loggedIn = Boolean(result.user);
  if (loggedIn) emitAuthStateChanged();
  return { loggedIn };
}

/** POST /auth/resend-verification */
export async function resendVerificationEmail(email: string): Promise<void> {
  const trimmed = email.trim();
  if (!trimmed) throw new Error("Enter your email address.");
  await postJson("/api/auth/resend-verification", { email: trimmed });
}

/** POST /auth/forgot-password — sends the reset link. Throws on validation/network errors. */
export async function requestPasswordReset(email: string): Promise<void> {
  const trimmed = email.trim();
  if (!trimmed) throw new Error("Enter your email address.");
  await postJson("/api/auth/forgot-password", { email: trimmed });
}

/** POST /auth/reset-password — completes the reset using the emailed token. */
export async function resetPassword(args: {
  token: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<void> {
  await postJson("/api/auth/reset-password", {
    token: args.token,
    newPassword: args.newPassword,
    confirmPassword: args.confirmPassword,
  });
}

/** POST /auth/change-password (requires session). */
export type ChangePasswordResult = { message: string };

export async function changePassword(body: ChangePasswordRequest): Promise<ChangePasswordResult> {
  const { data } = await api.post<unknown>("/auth/change-password", body);
  const raw = data as Record<string, unknown> | null | undefined;
  const inner = (raw?.data as Record<string, unknown> | undefined) ?? raw;
  const message =
    typeof inner?.message === "string" && inner.message.trim()
      ? inner.message.trim()
      : "Password changed successfully";
  return { message };
}

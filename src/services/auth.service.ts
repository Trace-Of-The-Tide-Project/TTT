import { api } from "./api"
import type {
  SignupRequest,
  LoginRequest,
  ChangePasswordRequest,
  AuthResponse,
  AuthUser,
  SignupResult,
} from "@/types/auth.types"
import {
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
  AUTH_STATE_CHANGED_EVENT,
  clearAuthStorageSync,
} from "@/lib/auth/storage-keys"

export { AUTH_STATE_CHANGED_EVENT } from "@/lib/auth/storage-keys"
type AuthStorageMode = "local" | "session"

function emitAuthStateChanged(): void {
  if (typeof window === "undefined") return
  window.dispatchEvent(new Event(AUTH_STATE_CHANGED_EVENT))
}

function getStorage(mode: AuthStorageMode): Storage | null {
  if (typeof window === "undefined") return null
  return mode === "local" ? window.localStorage : window.sessionStorage
}

function readStoredValue(key: string): string | null {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key)
}

function writeStoredValue(key: string, value: string, mode: AuthStorageMode): void {
  const target = getStorage(mode)
  const other = getStorage(mode === "local" ? "session" : "local")
  target?.setItem(key, value)
  other?.removeItem(key)
}

export function getStoredToken(): string | null {
  return readStoredValue(AUTH_TOKEN_KEY)
}

export function setStoredToken(token: string, mode: AuthStorageMode = "local"): void {
  if (typeof window === "undefined") return
  writeStoredValue(AUTH_TOKEN_KEY, token, mode)
  emitAuthStateChanged()
}

export function clearStoredToken(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(AUTH_TOKEN_KEY)
  sessionStorage.removeItem(AUTH_TOKEN_KEY)
  emitAuthStateChanged()
}

export function getStoredUser(): AuthUser | null {
  const raw = readStoredValue(AUTH_USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function setStoredUser(user: AuthUser, mode: AuthStorageMode = "local"): void {
  if (typeof window === "undefined") return
  writeStoredValue(AUTH_USER_KEY, JSON.stringify(user), mode)
  emitAuthStateChanged()
}

export function clearStoredAuth(): void {
  clearAuthStorageSync()
}

/** Raw API response may wrap in data and use camelCase or snake_case */
interface SignupApiResponse {
  data?: {
    accessToken?: string
    access_token?: string
    user?: AuthUser
    message?: string
  }
  accessToken?: string
  access_token?: string
  user?: AuthUser
  message?: string
  error?: string
}

async function createHttpError(res: Response): Promise<Error & {
  response?: { status: number; data: unknown }
}> {
  const errorData = await res.json().catch(() => ({}))
  const backendMessage =
    (errorData as { data?: { message?: string }; message?: string; error?: string }).data
      ?.message ??
    (errorData as { message?: string }).message ??
    (errorData as { error?: string }).error

  const err = new Error(backendMessage ?? res.statusText) as Error & {
    response?: { status: number; data: unknown }
  }
  err.response = { status: res.status, data: errorData }
  return err
}

function normalizeAuthResponse(
  raw: SignupApiResponse,
  storageMode: AuthStorageMode = "local"
): AuthResponse {
  const inner = raw?.data ?? raw
  const token =
    inner?.access_token ?? inner?.accessToken ?? raw?.access_token ?? raw?.accessToken
  const user = inner?.user ?? raw?.user

  if (token) {
    setStoredToken(token, storageMode)
  }

  if (!user) {
    throw new Error("Invalid auth response: missing user")
  }

  setStoredUser(user, storageMode)

  return {
    access_token: token ?? "",
    user: {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      email: user.email,
      roles: user.roles,
    },
  }
}

/**
 * POST /auth/signup - Register a new user
 * When the API returns an access token, it is stored and AuthResponse is returned.
 * When no token is returned (email verification required), nothing is stored and
 * `{ pendingEmailVerification, email }` is returned instead.
 */
export async function signup(data: SignupRequest): Promise<SignupResult> {
  const payload = {
    username: data.username,
    email: data.email,
    password: data.password,
    full_name: data.full_name,
  }

  let raw: SignupApiResponse
  if (typeof window !== "undefined") {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      throw await createHttpError(res)
    }
    raw = await res.json()
  } else {
    const response = await api.post<SignupApiResponse>("/auth/signup", payload)
    raw = response.data
  }

  const inner = raw?.data ?? raw
  const token =
    inner?.access_token ?? inner?.accessToken ?? raw?.access_token ?? raw?.accessToken
  if (!token) {
    return { pendingEmailVerification: true, email: data.email }
  }
  return normalizeAuthResponse(raw, "local")
}

export type VerifyEmailResult = { loggedIn: true } | { loggedIn: false }

/**
 * POST /auth/verify-email — completes signup verification using the emailed token.
 * If the API returns a session, it is stored like login; otherwise the caller should send the user to log in.
 */
export async function verifyEmail(token: string): Promise<VerifyEmailResult> {
  const res = await fetch("/api/auth/verify-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  })
  if (!res.ok) {
    throw await createHttpError(res)
  }
  const raw = (await res.json().catch(() => ({}))) as SignupApiResponse
  const inner = raw?.data ?? raw
  const access =
    inner?.access_token ?? inner?.accessToken ?? raw?.access_token ?? raw?.accessToken
  if (access) {
    normalizeAuthResponse(raw, "local")
    return { loggedIn: true }
  }
  return { loggedIn: false }
}

/**
 * POST /auth/resend-verification — asks the backend to send another verification email.
 */
export async function resendVerificationEmail(email: string): Promise<void> {
  const trimmed = email.trim();
  if (!trimmed) {
    throw new Error("Enter your email address.");
  }
  const res = await fetch("/api/auth/resend-verification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: trimmed }),
  });
  if (!res.ok) {
    throw await createHttpError(res);
  }
}

/**
 * POST /auth/login - Authenticate user
 */
export async function login(data: LoginRequest): Promise<AuthResponse> {
  let raw: SignupApiResponse

  if (typeof window !== "undefined") {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      throw await createHttpError(res)
    }
    raw = await res.json()
  } else {
    const response = await api.post<SignupApiResponse>("/auth/login", data)
    raw = response.data
  }

  return normalizeAuthResponse(raw, "local")
}

export type ChangePasswordResult = { message: string }

/**
 * POST /auth/change-password — updates password for the authenticated user (Bearer token).
 */
export async function changePassword(
  body: ChangePasswordRequest,
): Promise<ChangePasswordResult> {
  const { data } = await api.post<unknown>("/auth/change-password", body)
  const raw = data as Record<string, unknown> | null | undefined
  const inner = (raw?.data as Record<string, unknown> | undefined) ?? raw
  const message =
    typeof inner?.message === "string" && inner.message.trim()
      ? inner.message.trim()
      : "Password changed successfully"
  return { message }
}

/**
 * POST /auth/logout - Invalidate session (placeholder for future implementation)
 */
// export async function logout(): Promise<void> { clearStoredToken(); ... }

/**
 * POST /auth/refresh - Refresh access token (placeholder for future implementation)
 */
// export async function refreshToken(): Promise<AuthResponse> { ... }

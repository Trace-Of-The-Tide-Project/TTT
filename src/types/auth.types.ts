/**
 * Auth API request/response types
 */

export interface SignupRequest {
  username: string
  email: string
  password: string
  full_name: string
  phone_number: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface AuthUser {
  id: string
  username: string
  full_name?: string
  email: string
  roles?: string[]
}

export interface AuthResponse {
  access_token: string
  user: AuthUser
}

/** Signup succeeded but the server did not issue a session (e.g. verify email first). */
export type SignupPendingVerification = {
  pendingEmailVerification: true
  email: string
}

export type SignupResult = AuthResponse | SignupPendingVerification

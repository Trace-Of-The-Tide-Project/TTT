"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AUTH_STATE_CHANGED_EVENT,
  fetchCurrentUser,
  logout as logoutService,
} from "@/services/auth.service";
import type { AuthUser, BrowserAuthStatus } from "@/types/auth.types";

type AuthContextValue = {
  user: AuthUser | null;
  status: BrowserAuthStatus;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Resolves browser auth by calling `/api/auth/me` (httpOnly cookies — see
 * `lib/auth/server-session.ts`). Re-renders react to `AUTH_STATE_CHANGED_EVENT` so
 * login/logout in one tab updates other tabs where applicable.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<BrowserAuthStatus>("loading");
  const inflight = useRef<Promise<void> | null>(null);

  const refresh = useCallback(async () => {
    if (inflight.current) return inflight.current;
    const p = (async () => {
      try {
        const u = await fetchCurrentUser();
        setUser(u);
        setStatus(u ? "authenticated" : "unauthenticated");
      } catch {
        setUser(null);
        setStatus("unauthenticated");
      }
    })();
    inflight.current = p;
    try {
      await p;
    } finally {
      inflight.current = null;
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onChange = () => void refresh();
    window.addEventListener(AUTH_STATE_CHANGED_EVENT, onChange);
    window.addEventListener("focus", onChange);
    return () => {
      window.removeEventListener(AUTH_STATE_CHANGED_EVENT, onChange);
      window.removeEventListener("focus", onChange);
    };
  }, [refresh]);

  const logout = useCallback(async () => {
    await logoutService();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, refresh, logout }),
    [user, status, refresh, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}

export function useAuthUser(): AuthUser | null {
  return useAuth().user;
}

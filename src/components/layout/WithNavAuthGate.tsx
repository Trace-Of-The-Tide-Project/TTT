"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { AUTH_STATE_CHANGED_EVENT, getStoredToken } from "@/services/auth.service";

/**
 * Blocks all `(withNav)` routes until a session token exists. Auth lives under `/auth/*` (separate layout).
 */
export function WithNavAuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [checked, setChecked] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const syncToken = useCallback(() => {
    setToken(getStoredToken());
  }, []);

  useEffect(() => {
    syncToken();
    setChecked(true);
    const onChange = () => syncToken();
    window.addEventListener("storage", onChange);
    window.addEventListener(AUTH_STATE_CHANGED_EVENT, onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener(AUTH_STATE_CHANGED_EVENT, onChange);
    };
  }, [syncToken]);

  const redirectToLogin = useCallback(() => {
    // `pathname` from next-intl is locale-stripped (e.g. `/admin`). Do not use
    // `window.location.pathname` here — it includes `/en/...` and would double-prefix on login.
    const search = typeof window !== "undefined" ? window.location.search : "";
    const path = `${pathname ?? "/"}${search}`;
    const cb = encodeURIComponent(path || "/");
    router.replace(`/auth/login?callbackUrl=${cb}`);
  }, [pathname, router]);

  useEffect(() => {
    if (!checked) return;
    if (!token) redirectToLogin();
  }, [checked, token, redirectToLogin]);

  if (!checked) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: "#191919" }}
      >
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-700 border-t-[#C9A96E]" />
      </div>
    );
  }

  if (!token) {
    return null;
  }

  return <>{children}</>;
}

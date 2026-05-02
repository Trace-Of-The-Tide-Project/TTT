"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { guestMayAccessWithNavRoute } from "@/lib/auth/with-nav-public-routes";

/**
 * Most `(withNav)` routes require a cookie session (`AuthProvider` status). Guests are
 * sent to `/auth/login` with `callbackUrl` unless the path is listed in
 * `with-nav-public-routes.ts`.
 */
export function WithNavAuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useAuth();
  const guestOkHere = guestMayAccessWithNavRoute(pathname);

  useEffect(() => {
    if (status !== "unauthenticated") return;
    if (guestOkHere) return;
    const search = typeof window !== "undefined" ? window.location.search : "";
    const path = `${pathname ?? "/"}${search}`;
    const cb = encodeURIComponent(path || "/");
    router.replace(`/auth/login?callbackUrl=${cb}`);
  }, [status, pathname, router, guestOkHere]);

  if (status === "loading") {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: "#191919" }}
      >
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-700 border-t-[#C9A96E]" />
      </div>
    );
  }

  if (status === "unauthenticated" && !guestOkHere) {
    return null;
  }

  return <>{children}</>;
}

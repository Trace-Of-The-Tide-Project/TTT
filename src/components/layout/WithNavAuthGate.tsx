"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/components/providers/AuthProvider";

/**
 * Blocks all `(withNav)` routes until the cookie-backed session resolves to a logged-in
 * user. Auth lives under `/auth/*` (separate layout). The redirect carries the original
 * path as a `callbackUrl` so post-login lands the user back where they were.
 */
export function WithNavAuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useAuth();

  useEffect(() => {
    if (status !== "unauthenticated") return;
    const search = typeof window !== "undefined" ? window.location.search : "";
    const path = `${pathname ?? "/"}${search}`;
    const cb = encodeURIComponent(path || "/");
    router.replace(`/auth/login?callbackUrl=${cb}`);
  }, [status, pathname, router]);

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

  if (status === "unauthenticated") {
    return null;
  }

  return <>{children}</>;
}

"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/components/providers/AuthProvider";

/**
 * Every `(dashboard)` route (admin + profile) requires a cookie session
 * (`AuthProvider` status). Guests are sent to `/auth/login` with a
 * `callbackUrl` back to the page they tried to open. Rendering is held
 * back (spinner / null) until the session resolves so the auth-required
 * queries those pages fire on mount never run for guests.
 */
export function DashboardAuthGate({ children }: { children: React.ReactNode }) {
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
        style={{ backgroundColor: "var(--tott-dash-surface)" }}
      >
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[color:var(--tott-card-border)] border-t-[color:var(--tott-accent-gold)]" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return <>{children}</>;
}

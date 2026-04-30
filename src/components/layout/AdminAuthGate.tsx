"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { isAdmin } from "@/lib/auth/roles";

/**
 * Blocks `/admin/*` for users who are authenticated but lack an admin role.
 * Unauthenticated users are already redirected by `WithNavAuthGate` higher up,
 * so this only handles the role check.
 */
export function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, status } = useAuth();
  const allowed = status === "authenticated" && isAdmin(user);

  useEffect(() => {
    if (status === "authenticated" && !isAdmin(user)) {
      router.replace("/profile");
    }
  }, [status, user, router]);

  if (!allowed) return null;

  return <>{children}</>;
}

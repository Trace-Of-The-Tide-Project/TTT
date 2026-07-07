"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { theme } from "@/lib/theme";
import { LogOutIcon } from "@/components/ui/icons";
import { useAuth } from "@/components/providers/AuthProvider";

function getInitial(name?: string | null, email?: string | null): string {
  if (name?.trim()) return name.trim()[0].toUpperCase();
  if (email?.trim()) return email.trim()[0].toUpperCase();
  return "A";
}

function AvatarBadge({
  avatarUrl,
  initial,
  className,
}: {
  avatarUrl: string | null | undefined;
  initial: string;
  className: string;
}) {
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- signed, short-lived URL; not worth next/image's remote-pattern config
      <img src={avatarUrl} alt="" className={`${className} object-cover`} />
    );
  }
  return (
    <span
      className={`flex items-center justify-center font-bold ${className}`}
      style={{ backgroundColor: theme.accentGoldFocus, color: theme.bgDark }}
    >
      {initial}
    </span>
  );
}

type SidebarUserProps = {
  collapsed?: boolean;
};

export function SidebarUser({ collapsed = false }: SidebarUserProps) {
  const router = useRouter();
  const t = useTranslations("Dashboard.sidebarUser");
  const { user, logout } = useAuth();
  const name = user?.full_name || user?.username;
  const email = user?.email;
  const displayName = name || email || t("fallbackName");

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
    router.refresh();
  };

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-3 px-2 py-4">
        <div title={displayName}>
          <AvatarBadge
            avatarUrl={user?.avatar_url}
            initial={getInitial(name, email)}
            className="h-10 w-10 shrink-0 rounded-full text-sm overflow-hidden"
          />
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="text-[var(--tott-muted)] transition-colors hover:text-foreground"
          aria-label={t("signOut")}
          title={t("signOut")}
        >
          <LogOutIcon />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-3 py-4">
      <AvatarBadge
        avatarUrl={user?.avatar_url}
        initial={getInitial(name, email)}
        className="h-10 w-10 shrink-0 rounded-full text-sm overflow-hidden"
      />
      <span
        className="flex-1 truncate text-sm font-medium text-foreground"
      >
        {displayName}
      </span>
      <button
        type="button"
        onClick={handleLogout}
        className="shrink-0 text-[var(--tott-muted)] transition-colors hover:text-foreground"
        aria-label={t("signOut")}
      >
        <LogOutIcon />
      </button>
    </div>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useTheme } from "@/components/providers/ThemeProvider";
import type { SidebarItemConfig } from "@/lib/dashboard/types";
import { normalizeAppPathname } from "@/lib/i18n/strip-locale-from-path";

const ACTIVE_COLOR = "#C9A96E";

type SidebarItemProps = SidebarItemConfig & {
  onClick?: () => void;
};

export function SidebarItem({ labelKey, href, icon: Icon, badge, onClick }: SidebarItemProps) {
  const t = useTranslations("Dashboard");
  const label = (t as (key: string) => string)(labelKey);
  const pathname = usePathname();
  const path = normalizeAppPathname(pathname) ?? "";
  const isActive =
    path === href ||
    ((href !== "/admin" && href !== "/profile") && path.startsWith(`${href}/`));
  const { isDark } = useTheme();
  const inactive =
    "border border-transparent " +
    (isDark
      ? "text-gray-400 hover:bg-[var(--tott-dash-ghost-hover)] hover:text-foreground"
      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900");

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 mt-2 rounded-lg px-3 py-2.5 text-sm transition-colors ${
        isActive ? "border font-medium" : inactive
      }`}
      style={
        isActive
          ? { borderColor: ACTIVE_COLOR, color: ACTIVE_COLOR }
          : undefined
      }
    >
      <span className="shrink-0">
        <Icon />
      </span>
      <span className="flex-1 truncate">{label}</span>
      {badge !== undefined && (
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
          style={
            isActive
              ? { color: ACTIVE_COLOR, backgroundColor: "rgba(232, 221, 192, 0.1)" }
              : { color: "#9ca3af", backgroundColor: "rgba(255,255,255,0.1)" }
          }
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

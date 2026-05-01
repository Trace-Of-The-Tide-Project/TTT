"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useTheme } from "@/components/providers/ThemeProvider";
import type { SidebarItemConfig } from "@/lib/dashboard/types";
import { normalizeAppPathname } from "@/lib/i18n/strip-locale-from-path";

type SidebarItemProps = SidebarItemConfig & {
  onClick?: () => void;
  badgeOverrides?: Record<string, string>;
  collapsed?: boolean;
};

export function SidebarItem({ labelKey, href, icon: Icon, badge, onClick, badgeOverrides, collapsed = false }: SidebarItemProps) {
  const t = useTranslations("Dashboard");
  const label = (t as (key: string) => string)(labelKey);
  const pathname = usePathname();
  const path = normalizeAppPathname(pathname) ?? "";
  const isActive =
    path === href ||
    ((href !== "/admin" && href !== "/profile") && path.startsWith(`${href}/`));
  const { isDark } = useTheme();
  const inactive =
    "border border-transparent text-[var(--tott-muted)] " +
    (isDark
      ? "hover:bg-[var(--tott-dash-ghost-hover)] hover:text-foreground"
      : "hover:bg-[var(--tott-dash-ghost-hover)] hover:text-foreground");

  return (
    <Link
      href={href}
      onClick={onClick}
      title={collapsed ? label : undefined}
      aria-label={collapsed ? label : undefined}
      className={`mt-2 flex items-center rounded-lg text-sm transition-colors ${
        collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"
      } ${isActive ? "border-2 font-medium" : inactive}`}
      style={
        isActive
          ? {
              borderColor: "var(--tott-dash-gold-label)",
              backgroundColor: "var(--tott-elevated)",
              color: "var(--tott-dash-gold-label)",
            }
          : undefined
      }
    >
      <span className="shrink-0">
        <Icon />
      </span>
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{label}</span>
          {(badgeOverrides?.[href] ?? badge) !== undefined && (
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
              style={
                isActive
                  ? {
                      color: "var(--tott-dash-gold-label)",
                      backgroundColor:
                        "color-mix(in srgb, var(--tott-dash-gold-label) 12%, transparent)",
                    }
                  : {
                      color: "var(--tott-muted)",
                      backgroundColor: "var(--tott-dash-ghost-hover)",
                    }
              }
            >
              {badgeOverrides?.[href] ?? badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}

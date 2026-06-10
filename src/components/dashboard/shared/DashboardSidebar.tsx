"use client";

import { useEffect, useState } from "react";
import { usePathname } from "@/i18n/navigation";
import { normalizeAppPathname } from "@/lib/i18n/strip-locale-from-path";
import type { DashboardConfig } from "@/lib/dashboard/types";
import { SidebarSection } from "./SidebarSection";
import { SidebarUser } from "./SidebarUser";

type DashboardSidebarProps = {
  config: DashboardConfig;
  onItemClick?: () => void;
  badgeOverrides?: Record<string, string>;
  collapsed?: boolean;
};

function getActiveGroups(config: DashboardConfig, pathname: string): Set<string> {
  const open = new Set<string>();
  for (const section of config.sections) {
    for (const entry of section.items) {
      if (entry.kind !== "group") continue;
      const isActive = entry.items.some((item) => {
        if (item.kind !== "item") return false;
        return pathname === item.href || pathname.startsWith(item.href + "/");
      });
      if (isActive) open.add(entry.groupId);
    }
  }
  return open;
}

export function DashboardSidebar({ config, onItemClick, badgeOverrides, collapsed = false }: DashboardSidebarProps) {
  const rawPathname = usePathname();
  const pathname = normalizeAppPathname(rawPathname) ?? rawPathname;

  const [openGroups, setOpenGroups] = useState<Set<string>>(
    () => getActiveGroups(config, pathname)
  );

  // When the route changes, open the group containing the new active page
  // (but don't close anything the user manually opened)
  useEffect(() => {
    const activeGroups = getActiveGroups(config, pathname);
    if (activeGroups.size === 0) return;
    setOpenGroups((prev) => {
      const next = new Set(prev);
      for (const id of activeGroups) next.add(id);
      return next;
    });
  }, [pathname, config]);

  const handleToggleGroup = (groupId: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  return (
    <div className="flex h-full flex-col">
      <nav
        className={`dash-sidebar-nav flex-1 overflow-y-auto py-4 ${collapsed ? "px-2" : "px-3"}`}
        style={{ scrollbarWidth: "none" }}
      >
        <style>{`.dash-sidebar-nav::-webkit-scrollbar { display: none; }`}</style>
        <div className="flex flex-col gap-2">
          {config.sections.map((section, i) => (
            <SidebarSection
              key={section.heading ?? i}
              {...section}
              openGroups={openGroups}
              onToggleGroup={handleToggleGroup}
              onItemClick={onItemClick}
              badgeOverrides={badgeOverrides}
              collapsed={collapsed}
            />
          ))}
        </div>
      </nav>

      <div className="shrink-0 border-t border-[var(--tott-card-border)]">
        <SidebarUser collapsed={collapsed} />
      </div>

    </div>
  );
}

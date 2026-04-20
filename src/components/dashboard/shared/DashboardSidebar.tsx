"use client";

import { useState } from "react";
import type { DashboardConfig } from "@/lib/dashboard/types";
import { SidebarSection } from "./SidebarSection";
import { SidebarUser } from "./SidebarUser";

type DashboardSidebarProps = {
  config: DashboardConfig;
  onItemClick?: () => void;
};

function getDefaultOpenGroups(config: DashboardConfig): Set<string> {
  const open = new Set<string>();
  for (const section of config.sections) {
    for (const entry of section.items) {
      if (entry.kind === "group" && entry.defaultOpen) open.add(entry.groupId);
    }
  }
  return open;
}

export function DashboardSidebar({ config, onItemClick }: DashboardSidebarProps) {
  const [openGroups, setOpenGroups] = useState<Set<string>>(
    () => getDefaultOpenGroups(config)
  );

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
        className="dash-sidebar-nav flex-1 overflow-y-auto px-3 py-4"
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
            />
          ))}
        </div>
      </nav>

      <div className="shrink-0 border-t border-[var(--tott-card-border)]">
        <SidebarUser />
      </div>
    </div>
  );
}

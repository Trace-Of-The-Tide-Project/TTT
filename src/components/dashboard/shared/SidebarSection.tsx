import type { SidebarSectionConfig } from "@/lib/dashboard/types";
import { SidebarItem } from "./SidebarItem";
import { SidebarGroup } from "./SidebarGroup";

type SidebarSectionProps = SidebarSectionConfig & {
  openGroups: Set<string>;
  onToggleGroup: (groupId: string) => void;
  onItemClick?: () => void;
  badgeOverrides?: Record<string, string>;
  collapsed?: boolean;
};

export function SidebarSection({ items, openGroups, onToggleGroup, onItemClick, badgeOverrides, collapsed = false }: SidebarSectionProps) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((entry) =>
        entry.kind === "group" ? (
          <SidebarGroup
            key={entry.groupId}
            {...entry}
            isOpen={openGroups.has(entry.groupId)}
            onToggle={() => onToggleGroup(entry.groupId)}
            onItemClick={onItemClick}
            badgeOverrides={badgeOverrides}
            collapsed={collapsed}
          />
        ) : (
          <SidebarItem key={entry.href} {...entry} onClick={onItemClick} badgeOverrides={badgeOverrides} collapsed={collapsed} />
        )
      )}
    </div>
  );
}

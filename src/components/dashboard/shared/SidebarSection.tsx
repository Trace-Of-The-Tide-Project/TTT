import type { SidebarSectionConfig } from "@/lib/dashboard/types";
import { SidebarItem } from "./SidebarItem";
import { SidebarGroup } from "./SidebarGroup";

type SidebarSectionProps = SidebarSectionConfig & {
  openGroups: Set<string>;
  onToggleGroup: (groupId: string) => void;
  onItemClick?: () => void;
};

export function SidebarSection({ items, openGroups, onToggleGroup, onItemClick }: SidebarSectionProps) {
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
          />
        ) : (
          <SidebarItem key={entry.href} {...entry} onClick={onItemClick} />
        )
      )}
    </div>
  );
}

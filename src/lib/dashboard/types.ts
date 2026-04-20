import type { ComponentType } from "react";

export type SidebarItemConfig = {
  kind: "item";
  /** Key under `Dashboard` messages, e.g. `sidebar.allArticles`. */
  labelKey: string;
  href: string;
  icon: ComponentType;
  badge?: string | number;
};

export type SidebarGroupConfig = {
  kind: "group";
  /** Stable id for open/close state (not translated). */
  groupId: string;
  /** Key under `Dashboard` messages, e.g. `sidebar.articles`. */
  labelKey: string;
  icon: ComponentType;
  defaultOpen?: boolean;
  items: SidebarItemConfig[];
};

export type SidebarSectionConfig = {
  heading?: string;
  items: (SidebarItemConfig | SidebarGroupConfig)[];
};

export type DashboardConfig = {
  basePath: string;
  sections: SidebarSectionConfig[];
};

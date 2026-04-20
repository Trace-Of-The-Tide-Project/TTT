import type { ComponentType } from "react";
import { HomeIcon, FileTextIcon, LinkIcon, PaletteIcon } from "@/components/ui/icons";

export type CmsTabId = "home" | "static" | "nav" | "branding";

export const CMS_TABS: { id: CmsTabId; icon?: ComponentType }[] = [
  { id: "home", icon: HomeIcon },
  { id: "static", icon: FileTextIcon },
  { id: "nav", icon: LinkIcon },
  { id: "branding", icon: PaletteIcon },
];

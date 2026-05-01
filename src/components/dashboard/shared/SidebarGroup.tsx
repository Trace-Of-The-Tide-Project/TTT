"use client";

import { useTranslations } from "next-intl";
import type { SidebarGroupConfig } from "@/lib/dashboard/types";
import { SidebarItem } from "./SidebarItem";

type SidebarGroupProps = SidebarGroupConfig & {
  isOpen: boolean;
  onToggle: () => void;
  onItemClick?: () => void;
  badgeOverrides?: Record<string, string>;
};

export function SidebarGroup({
  labelKey,
  icon: Icon,
  items,
  isOpen,
  onToggle,
  onItemClick,
  badgeOverrides,
}: SidebarGroupProps) {
  const t = useTranslations("Dashboard");
  const label = (t as (key: string) => string)(labelKey);
  const groupBtn =
    "flex w-full items-center gap-3 rounded-lg bg-[var(--tott-elevated)] px-3 py-2.5 text-sm text-[var(--tott-muted)] transition-colors hover:bg-[var(--tott-elevated-hover)] hover:text-foreground";

  return (
    <div>
      <button type="button" onClick={onToggle} className={groupBtn}>
        <span className="shrink-0">
          <Icon />
        </span>
        <span className="flex-1 truncate text-start">{label}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-1 flex flex-col gap-0.5">
          {items.map((item) => (
            <SidebarItem key={item.href} {...item} onClick={onItemClick} badgeOverrides={badgeOverrides} />
          ))}
        </div>
      )}
    </div>
  );
}

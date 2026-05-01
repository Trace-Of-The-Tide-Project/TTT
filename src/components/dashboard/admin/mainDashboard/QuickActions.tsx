"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { ComponentType } from "react";
import type { QuickActionId } from "@/lib/dashboard/admin-dashboard-constants";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";

export type QuickActionItem = {
  id: string;
  actionId: QuickActionId;
  icon: ComponentType;
  href?: string;
  onClick?: () => void;
};

type QuickActionsProps = {
  items: QuickActionItem[];
};

export function QuickActions({ items }: QuickActionsProps) {
  const t = useTranslations("Dashboard.adminHome.quickActions");
  return (
    <div className="relative p-6">
      <ChamferedFrame />
      <h3 className="relative mb-4 text-lg font-bold text-foreground">{t("title")}</h3>

      <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((item) => {
          const Icon = item.icon;
          const label = t(`${item.actionId}.label`);
          const description = t(`${item.actionId}.description`);
          const className =
            "group relative flex items-center gap-4 px-5 py-4 text-start transition-colors hover:text-foreground";

          const inner = (
            <>
              <ChamferedFrame size={14} />
              <span className="relative flex h-11 w-11 shrink-0 items-center justify-center text-[var(--tott-muted)]">
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 44 44" fill="none">
                  <path
                    d="M22 2L40 13V35L22 46L4 35V13Z"
                    fill="var(--tott-dash-surface)"
                    stroke="var(--tott-card-border)"
                    strokeWidth="1"
                  />
                </svg>
                <span className="relative">
                  <Icon />
                </span>
              </span>
              <div className="relative min-w-0 flex-1">
                <p className="text-sm font-medium leading-tight text-foreground">{label}</p>
                <p className="mt-0.5 text-xs leading-snug text-[var(--tott-muted)]">{description}</p>
              </div>
            </>
          );

          if (item.onClick) {
            return (
              <button key={item.id} type="button" onClick={item.onClick} className={`w-full ${className}`}>
                {inner}
              </button>
            );
          }
          return (
            <Link key={item.id} href={item.href ?? "#"} className={className}>
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

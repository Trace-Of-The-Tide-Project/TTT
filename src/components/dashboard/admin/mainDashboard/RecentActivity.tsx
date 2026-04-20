"use client";

import { useTranslations } from "next-intl";
import type { ComponentType } from "react";

type ActivityItem = {
  id: string;
  icon: ComponentType;
};

type RecentActivityProps = {
  items: ActivityItem[];
};

export function RecentActivity({ items }: RecentActivityProps) {
  const t = useTranslations("Dashboard.adminHome.recentActivity");
  return (
    <div className="rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-5">
      <h3 className="mb-4 text-lg font-bold text-foreground">{t("title")}</h3>

      <div className="divide-y divide-[#A3A3A3]/20">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="flex items-start gap-3 py-4">
              <span className="mt-0.5 shrink-0 text-[#A3A3A3]">
                <Icon />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{t(`items.${item.id}.title`)}</p>
                <p className="mt-0.5 truncate text-xs text-[#A3A3A3]">{t(`items.${item.id}.description`)}</p>
              </div>
              <span className="shrink-0 text-xs text-[#A3A3A3]">{t(`items.${item.id}.time`)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

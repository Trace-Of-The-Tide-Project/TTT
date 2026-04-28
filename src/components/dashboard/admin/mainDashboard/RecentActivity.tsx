"use client";

import { useTranslations } from "next-intl";
import type { ComponentType } from "react";

type ActivityItem = {
  id: string;
  icon: ComponentType;
  title: string;
  description: string;
  time: string;
};

type RecentActivityProps = {
  items: ActivityItem[];
};

export function RecentActivity({ items }: RecentActivityProps) {
  const t = useTranslations("Dashboard.adminHome.recentActivity");
  return (
    <div className="rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-5">
      <h3 className="mb-4 text-lg font-bold text-foreground">{t("title")}</h3>

      <div className="divide-y divide-[var(--tott-dash-divider)]">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="flex items-start gap-3 py-3.5">
              <span className="mt-0.5 shrink-0 text-[var(--tott-muted)]">
                <Icon />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <p className="mt-0.5 truncate text-xs text-[var(--tott-muted)]">{item.description}</p>
              </div>
              <span className="shrink-0 text-xs text-[var(--tott-muted)] opacity-70">{item.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

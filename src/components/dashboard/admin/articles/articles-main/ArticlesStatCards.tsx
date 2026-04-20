"use client";

import { useTranslations } from "next-intl";
import { BookIcon, PenLineIcon, BarChartIcon, CalendarIcon } from "@/components/ui/icons";
import type { ComponentType } from "react";

type StatItem = {
  id: string;
  value: string;
  labelKey: string;
  iconKey: string;
};

const iconMap: Record<string, ComponentType> = {
  book: BookIcon,
  pen: PenLineIcon,
  barChart: BarChartIcon,
  calendar: CalendarIcon,
};

type ArticlesStatCardsProps = {
  stats: readonly StatItem[];
};

export function ArticlesStatCards({ stats }: ArticlesStatCardsProps) {
  const t = useTranslations("Dashboard");
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {stats.map((stat) => {
        const Icon = iconMap[stat.iconKey];
        if (!Icon) return null;
        return (
          <div
            key={stat.id}
            className="flex flex-col items-center gap-2 rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-4 py-5"
          >
            <span style={{ color: "#E8DDC0" }}>
              <Icon />
            </span>
            <span className="text-2xl font-bold text-foreground">{stat.value}</span>
            <span className="text-xs text-gray-500">{(t as (key: string) => string)(stat.labelKey)}</span>
          </div>
        );
      })}
    </div>
  );
}

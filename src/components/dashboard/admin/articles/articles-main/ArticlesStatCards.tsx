"use client";

import { useTranslations } from "next-intl";
import { BookIcon, PenLineIcon, BarChartIcon, CalendarIcon } from "@/components/ui/icons";
import type { ComponentType } from "react";
import { StaggerContainer } from "@/components/motion/StaggerContainer";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";

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
    <StaggerContainer className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {stats.map((stat) => {
        const Icon = iconMap[stat.iconKey];
        if (!Icon) return null;
        return (
          <StaggerItem key={stat.id}>
            <div className="relative flex flex-col items-center gap-2 px-4 py-7">
              <ChamferedFrame />
              <span className="relative" style={{ color: "var(--tott-stat-icon)" }}>
                <Icon />
              </span>
              <span className="relative text-2xl font-bold text-foreground">{stat.value}</span>
              <span className="relative text-xs text-[var(--tott-muted)]">{(t as (key: string) => string)(stat.labelKey)}</span>
            </div>
          </StaggerItem>
        );
      })}
    </StaggerContainer>
  );
}

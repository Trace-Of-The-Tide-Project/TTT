"use client";

import { useTranslations } from "next-intl";
import { StatCard } from "../shared/StatCard";
import { commandCenterStats } from "@/lib/dashboard/admin-dashboard-constants";

export function AdminCommandCenter() {
  const t = useTranslations("Dashboard.commandCenter");
  return (
    <div>
      <div className="flex flex-col gap-2 py-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">{t("title")}</h1>
          <p className="mt-1 text-sm text-gray-500">{t("subtitle")}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#E8DDC0" }}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>{t("lastUpdated")}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pb-6 lg:grid-cols-4">
        {commandCenterStats.map((stat) => (
          <StatCard
            key={stat.labelKey}
            icon={stat.icon}
            value={stat.value}
            label={(t as (key: string) => string)(stat.labelKey)}
            trend={
              stat.trend
                ? {
                    value: stat.trend.value,
                    direction: stat.trend.direction,
                    comparison: (t as (key: string) => string)(stat.trend.comparisonKey),
                  }
                : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}

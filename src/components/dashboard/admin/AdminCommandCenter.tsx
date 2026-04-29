"use client";

import { useTranslations } from "next-intl";
import { StatCard } from "../shared/StatCard";
import { useAuthUser } from "@/components/providers/AuthProvider";
import { useDashboardStats } from "@/hooks/queries/dashboard";
import type { DashboardStats } from "@/services/dashboard.service";
import {
  UsersIcon,
  FileTextIcon,
  DollarSignIcon,
  EyeIcon,
} from "@/components/ui/icons";

function formatStatValue(key: keyof DashboardStats, value: number): string {
  if (key === "monthlyDonations") return `$${value.toLocaleString()}`;
  return value.toLocaleString();
}

function formatChange(change: number): { value: string; direction: "up" | "down" } {
  const abs = Math.abs(change);
  return {
    value: `${abs.toFixed(1)}%`,
    direction: change >= 0 ? "up" : "down",
  };
}

function SkeletonCard() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-4 py-5 animate-pulse">
      <div className="h-10 w-10 rounded-full bg-[var(--tott-dash-control-bg)]" />
      <div className="h-3 w-20 rounded bg-[var(--tott-dash-control-bg)]" />
      <div className="h-7 w-24 rounded bg-[var(--tott-dash-control-bg)]" />
      <div className="h-3 w-28 rounded bg-[var(--tott-dash-control-bg)]" />
    </div>
  );
}

const STAT_CONFIG = [
  { key: "totalUsers" as const, icon: UsersIcon, labelKey: "stats.totalUsers", comparisonKey: "vsLastMonth" },
  { key: "contentPublished" as const, icon: FileTextIcon, labelKey: "stats.contentPublished", comparisonKey: "vsLastMonth" },
  { key: "monthlyDonations" as const, icon: DollarSignIcon, labelKey: "stats.monthlyDonations", comparisonKey: "vsLastMonth" },
  { key: "activeToday" as const, icon: EyeIcon, labelKey: "stats.activeToday", comparisonKey: "vsYesterday" },
];

export function AdminCommandCenter() {
  const t = useTranslations("Dashboard.commandCenter");
  const user = useAuthUser();
  const name = user?.full_name || user?.username || "Super Admin";

  const { data: stats, isPending: loading } = useDashboardStats();

  return (
    <div>
      <div className="flex flex-col gap-2 py-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">{t("title")}</h1>
          <p className="mt-1 text-sm text-[var(--tott-muted)]">
            {t("welcomeBack")} <span className="font-medium text-foreground">{name}</span>. {t("subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--tott-muted)]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--tott-dash-gold-text)" }}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>{t("lastUpdated")}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pb-6 sm:gap-4 md:grid-cols-4">
        {loading
          ? STAT_CONFIG.map((s) => <SkeletonCard key={s.key} />)
          : STAT_CONFIG.map((s) => {
              const stat = stats?.[s.key];
              const value = stat ? formatStatValue(s.key, stat.value) : "—";
              const trend = stat
                ? {
                    ...formatChange(stat.change),
                    comparison: (t as (k: string) => string)(s.comparisonKey),
                  }
                : undefined;
              return (
                <StatCard
                  key={s.key}
                  icon={s.icon}
                  value={value}
                  label={(t as (k: string) => string)(s.labelKey)}
                  trend={trend}
                />
              );
            })}
      </div>
    </div>
  );
}

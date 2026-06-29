"use client";

import { useTranslations } from "next-intl";
import { DashboardHeader } from "@/components/dashboard/shared/DashboardHeader";
import { theme } from "@/lib/theme";
import {
  CalendarIcon,
  DownloadIcon,
  EyeIcon,
  TrendingUpIcon,
  ClockIcon,
  UserCheckIcon,
} from "@/components/ui/icons";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";

export function AnalyticsPageHeader() {
  const t = useTranslations("Dashboard.headers.analytics");
  return (
    <div className="px-6 py-6 sm:px-8 sm:py-8">
      <DashboardHeader
        lastUpdated
        title={t("title")}
        subtitle={t("subtitle")}
        compactPadding
        actions={
          <>
            <button
              type="button"
              className="inline-flex h-[40px] items-center justify-center gap-2 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-4 text-sm font-medium text-foreground transition-colors hover:bg-[var(--tott-elevated-hover)]"
            >
              <span className="[&_svg]:h-4 [&_svg]:w-4 text-[var(--tott-muted)]">
                <CalendarIcon />
              </span>
              {t("last30Days")}
              <span className="ms-1 text-[var(--tott-muted)]">▾</span>
            </button>

            <button
              type="button"
              className="inline-flex h-[40px] items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-[var(--tott-on-accent)] whitespace-nowrap"
              style={{ backgroundColor: theme.accentGoldFocus }}
            >
              <span className="[&_svg]:h-4 [&_svg]:w-4">
                <DownloadIcon />
              </span>
              {t("exportReports")}
            </button>
          </>
        }
      />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative flex flex-col items-center gap-2 px-4 py-7"><ChamferedFrame />
          <span style={{ color: "var(--tott-stat-icon)" }}>
            <EyeIcon />
          </span>
          <span className="text-2xl font-bold text-foreground">2.4M</span>
          <span className="text-xs text-[var(--tott-muted)]">{t("cards.pageViews")}</span>
          <span className="text-xs text-emerald-400">↗ 18%</span>
        </div>

        <div className="relative flex flex-col items-center gap-2 px-4 py-7"><ChamferedFrame />
          <span style={{ color: "var(--tott-stat-icon)" }}>
            <UserCheckIcon />
          </span>
          <span className="text-2xl font-bold text-foreground">68%</span>
          <span className="text-xs text-[var(--tott-muted)]">{t("cards.userRetention")}</span>
          <span className="text-xs text-emerald-400">↗ 5%</span>
        </div>

        <div className="relative flex flex-col items-center gap-2 px-4 py-7"><ChamferedFrame />
          <span style={{ color: "var(--tott-stat-icon)" }}>
            <ClockIcon />
          </span>
          <span className="text-2xl font-bold text-foreground">8m 42s</span>
          <span className="text-xs text-[var(--tott-muted)]">{t("cards.avgSession")}</span>
          <span className="text-xs text-emerald-400">↗ 12%</span>
        </div>

        <div className="relative flex flex-col items-center gap-2 px-4 py-7"><ChamferedFrame />
          <span style={{ color: "var(--tott-stat-icon)" }}>
            <TrendingUpIcon />
          </span>
          <span className="text-2xl font-bold text-foreground">32%</span>
          <span className="text-xs text-[var(--tott-muted)]">{t("cards.bounceRate")}</span>
          <span className="text-xs text-red-400">↘ 3%</span>
        </div>
      </div>
    </div>
  );
}

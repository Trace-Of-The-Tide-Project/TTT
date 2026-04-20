"use client";

import { useTranslations } from "next-intl";
import { DashboardHeader } from "@/components/dashboard/shared/DashboardHeader";
import { theme } from "@/lib/theme";
import { DollarSignIcon, DownloadIcon, TrendingUpIcon, CreditCardIcon } from "@/components/ui/icons";

export function FinancePageHeader() {
  const t = useTranslations("Dashboard.headers.finance");
  return (
    <div className="px-6 py-6 sm:px-8 sm:py-8">
      <DashboardHeader
        title={t("title")}
        subtitle={t("subtitle")}
        compactPadding
        actions={
          <button
            type="button"
            className="inline-flex h-[40px] items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-[#111] whitespace-nowrap"
            style={{ backgroundColor: theme.accentGoldFocus }}
          >
            <span className="[&_svg]:h-4 [&_svg]:w-4">
              <DownloadIcon />
            </span>
            {t("exportReports")}
          </button>
        }
      />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col items-center gap-2 rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-4 py-5">
          <span style={{ color: "#E8DDC0" }}>
            <DollarSignIcon />
          </span>
          <span className="text-2xl font-bold text-foreground">$2,847</span>
          <span className="text-xs text-gray-500">{t("cards.todaysDonations")}</span>
          <span className="text-xs text-emerald-400">↗ 12%</span>
        </div>

        <div className="flex flex-col items-center gap-2 rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-4 py-5">
          <span style={{ color: "#E8DDC0" }}>
            <TrendingUpIcon />
          </span>
          <span className="text-2xl font-bold text-foreground">$34,892</span>
          <span className="text-xs text-gray-500">{t("cards.monthlyRevenue")}</span>
          <span className="text-xs text-emerald-400">↗ 22%</span>
        </div>

        <div className="flex flex-col items-center gap-2 rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-4 py-5">
          <span style={{ color: "#E8DDC0" }}>
            <CreditCardIcon />
          </span>
          <span className="text-2xl font-bold text-foreground">$2,596</span>
          <span className="text-xs text-gray-500">{t("cards.pendingPayouts")}</span>
          <span className="text-xs text-[#CBA158]">{t("cards.pendingCount")}</span>
        </div>

        <div className="flex flex-col items-center gap-2 rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-4 py-5">
          <span style={{ color: "#E8DDC0" }}>
            <DollarSignIcon />
          </span>
          <span className="text-2xl font-bold text-foreground">$3,489</span>
          <span className="text-xs text-gray-500">{t("cards.platformFees")}</span>
          <span className="text-xs text-gray-500">{t("cards.feeRate")}</span>
        </div>
      </div>
    </div>
  );
}

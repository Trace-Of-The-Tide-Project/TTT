"use client";

import { useTranslations } from "next-intl";
import { DashboardHeader } from "@/components/dashboard/shared/DashboardHeader";
import { theme } from "@/lib/theme";
import {
  ContributeIcon,
  ClockIcon,
  MessageSquareIcon,
  SquareCheckIcon,
  TrendingUpIcon,
} from "@/components/ui/icons";

export function MessagingPageHeader() {
  const t = useTranslations("Dashboard.headers.messaging");
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
              <ContributeIcon />
            </span>
            {t("newBroadcast")}
          </button>
        }
      />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col items-center gap-2 rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-4 py-5">
          <span style={{ color: "#E8DDC0" }}>
            <MessageSquareIcon />
          </span>
          <span className="text-2xl font-bold text-foreground">23</span>
          <span className="text-xs text-gray-500">{t("cards.unreadMessages")}</span>
        </div>

        <div className="flex flex-col items-center gap-2 rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-4 py-5">
          <span style={{ color: "#E8DDC0" }}>
            <TrendingUpIcon />
          </span>
          <span className="text-2xl font-bold text-foreground">5</span>
          <span className="text-xs text-gray-500">{t("cards.highPriority")}</span>
        </div>

        <div className="flex flex-col items-center gap-2 rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-4 py-5">
          <span style={{ color: "#E8DDC0" }}>
            <ClockIcon />
          </span>
          <span className="text-2xl font-bold text-foreground">12</span>
          <span className="text-xs text-gray-500">{t("cards.pendingResponse")}</span>
        </div>

        <div className="flex flex-col items-center gap-2 rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-4 py-5">
          <span style={{ color: "#E8DDC0" }}>
            <SquareCheckIcon />
          </span>
          <span className="text-2xl font-bold text-foreground">156</span>
          <span className="text-xs text-gray-500">{t("cards.resolvedThisWeek")}</span>
        </div>
      </div>
    </div>
  );
}

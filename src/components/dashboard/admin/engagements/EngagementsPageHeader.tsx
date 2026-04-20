"use client";

import { useTranslations } from "next-intl";
import { DashboardHeader } from "@/components/dashboard/shared/DashboardHeader";
import { useTheme } from "@/components/providers/ThemeProvider";
import { HeartIcon, MessageSquareIcon, TrendingUpIcon, GiftIcon } from "@/components/ui/icons";

export function EngagementsPageHeader() {
  const { isDark } = useTheme();
  const t = useTranslations("Dashboard.headers.engagements");
  const iconColor = isDark ? "#E8DDC0" : "#a89060";
  return (
    <div className="px-6 py-6 sm:px-8 sm:py-8">
      <DashboardHeader title={t("title")} subtitle={t("subtitle")} compactPadding />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col items-center gap-2 rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-4 py-5">
          <span style={{ color: iconColor }}>
            <MessageSquareIcon />
          </span>
          <span className="text-2xl font-bold text-foreground">12,546</span>
          <span className="text-xs text-gray-500">{t("stats.totalComments")}</span>
        </div>

        <div className="flex flex-col items-center gap-2 rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-4 py-5">
          <span style={{ color: iconColor }}>
            <HeartIcon />
          </span>
          <span className="text-2xl font-bold text-foreground">89.2k</span>
          <span className="text-xs text-gray-500">{t("stats.totalLikes")}</span>
        </div>

        <div className="flex flex-col items-center gap-2 rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-4 py-5">
          <span style={{ color: iconColor }}>
            <TrendingUpIcon />
          </span>
          <span className="text-2xl font-bold text-foreground">456</span>
          <span className="text-xs text-gray-500">{t("stats.activeDiscussions")}</span>
        </div>

        <div className="flex flex-col items-center gap-2 rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-4 py-5">
          <span style={{ color: iconColor }}>
            <GiftIcon />
          </span>
          <span className="text-2xl font-bold text-foreground">492</span>
          <span className="text-xs text-gray-500">{t("stats.badgesAwarded")}</span>
        </div>
      </div>
    </div>
  );
}

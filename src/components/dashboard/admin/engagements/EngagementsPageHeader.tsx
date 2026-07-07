"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { DashboardHeader } from "@/components/dashboard/shared/DashboardHeader";
import { HeartIcon, MessageSquareIcon, TrendingUpIcon, GiftIcon } from "@/components/ui/icons";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";
import { fetchEngagementStats } from "@/services/engagements";

function formatNumber(n: number | undefined | null): string {
  if (n == null) return "—";
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString();
}

export function EngagementsPageHeader() {
  const t = useTranslations("Dashboard.headers.engagements");
  const iconColor = "var(--tott-stat-icon)";

  const { data: stats } = useQuery({
    queryKey: ["engagements", "stats"],
    queryFn: fetchEngagementStats,
    staleTime: 60_000,
  });

  return (
    <div className="px-6 py-6 sm:px-8 sm:py-8">
      <DashboardHeader lastUpdated title={t("title")} subtitle={t("subtitle")} compactPadding />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative flex flex-col items-center gap-2 px-4 py-7"><ChamferedFrame />
          <span style={{ color: iconColor }}>
            <MessageSquareIcon />
          </span>
          <span className="text-2xl font-bold text-foreground">
            {formatNumber(stats?.total_comments)}
          </span>
          <span className="text-xs text-[var(--tott-muted)]">{t("stats.totalComments")}</span>
        </div>

        <div className="relative flex flex-col items-center gap-2 px-4 py-7"><ChamferedFrame />
          <span style={{ color: iconColor }}>
            <HeartIcon />
          </span>
          <span className="text-2xl font-bold text-foreground">
            {formatNumber(stats?.total_likes)}
          </span>
          <span className="text-xs text-[var(--tott-muted)]">{t("stats.totalLikes")}</span>
        </div>

        <div className="relative flex flex-col items-center gap-2 px-4 py-7"><ChamferedFrame />
          <span style={{ color: iconColor }}>
            <TrendingUpIcon />
          </span>
          <span className="text-2xl font-bold text-foreground">
            {formatNumber(stats?.active_discussions)}
          </span>
          <span className="text-xs text-[var(--tott-muted)]">{t("stats.activeDiscussions")}</span>
        </div>

        <div className="relative flex flex-col items-center gap-2 px-4 py-7"><ChamferedFrame />
          <span style={{ color: iconColor }}>
            <GiftIcon />
          </span>
          <span className="text-2xl font-bold text-foreground">
            {formatNumber(stats?.badges_awarded)}
          </span>
          <span className="text-xs text-[var(--tott-muted)]">{t("stats.badgesAwarded")}</span>
        </div>
      </div>
    </div>
  );
}

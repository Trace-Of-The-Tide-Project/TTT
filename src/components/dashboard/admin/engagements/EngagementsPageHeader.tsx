"use client";

import { useTranslations } from "next-intl";
import { DashboardHeader } from "@/components/dashboard/shared/DashboardHeader";
import { HeartIcon, MessageSquareIcon, TrendingUpIcon, GiftIcon } from "@/components/ui/icons";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";

export function EngagementsPageHeader() {
  const t = useTranslations("Dashboard.headers.engagements");
  const iconColor = "var(--tott-stat-icon)";
  return (
    <div className="px-6 py-6 sm:px-8 sm:py-8">
      <DashboardHeader title={t("title")} subtitle={t("subtitle")} compactPadding />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative flex flex-col items-center gap-2 px-4 py-7"><ChamferedFrame />
          <span style={{ color: iconColor }}>
            <MessageSquareIcon />
          </span>
          <span className="text-2xl font-bold text-foreground">12,546</span>
          <span className="text-xs text-gray-500">{t("stats.totalComments")}</span>
        </div>

        <div className="relative flex flex-col items-center gap-2 px-4 py-7"><ChamferedFrame />
          <span style={{ color: iconColor }}>
            <HeartIcon />
          </span>
          <span className="text-2xl font-bold text-foreground">89.2k</span>
          <span className="text-xs text-gray-500">{t("stats.totalLikes")}</span>
        </div>

        <div className="relative flex flex-col items-center gap-2 px-4 py-7"><ChamferedFrame />
          <span style={{ color: iconColor }}>
            <TrendingUpIcon />
          </span>
          <span className="text-2xl font-bold text-foreground">456</span>
          <span className="text-xs text-gray-500">{t("stats.activeDiscussions")}</span>
        </div>

        <div className="relative flex flex-col items-center gap-2 px-4 py-7"><ChamferedFrame />
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

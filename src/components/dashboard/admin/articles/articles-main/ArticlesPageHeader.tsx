"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { TrendingUpIcon } from "@/components/ui/icons";
import { ArticlesStatCards } from "./ArticlesStatCards";
import { getAnalyticsOverview } from "@/services/analytics.service";

const BASE_STATS = [
  { id: "1", value: "—", labelKey: "articles.stats.published", iconKey: "book" },
  { id: "2", value: "—", labelKey: "articles.stats.contributions", iconKey: "pen" },
  { id: "3", value: "—", labelKey: "articles.stats.totalReads", iconKey: "barChart" },
  { id: "4", value: "—", labelKey: "articles.stats.daysActive", iconKey: "calendar" },
];

export function ArticlesPageHeader() {
  const t = useTranslations("Dashboard.articles.page");
  const [stats, setStats] = useState(BASE_STATS);

  useEffect(() => {
    getAnalyticsOverview().then((data) => {
      setStats([
        { id: "1", value: data.published_articles.toLocaleString(), labelKey: "articles.stats.published", iconKey: "book" },
        { id: "2", value: data.total_contributions.toLocaleString(), labelKey: "articles.stats.contributions", iconKey: "pen" },
        { id: "3", value: data.total_page_views.toLocaleString(), labelKey: "articles.stats.totalReads", iconKey: "barChart" },
        { id: "4", value: data.days_active.toLocaleString(), labelKey: "articles.stats.daysActive", iconKey: "calendar" },
      ]);
    }).catch(() => {});
  }, []);

  return (
    <div className="pb-6">
      <div className="flex flex-col gap-2 py-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">{t("title")}</h1>
          <p className="mt-1 text-sm text-gray-500">{t("subtitle")}</p>
        </div>
        <span className="flex items-center gap-2 text-sm font-medium text-emerald-400">
          <TrendingUpIcon />
          {t("lastUpdated")}
        </span>
      </div>

      <ArticlesStatCards stats={stats} />
    </div>
  );
}

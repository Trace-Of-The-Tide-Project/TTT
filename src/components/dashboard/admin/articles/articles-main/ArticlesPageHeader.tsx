"use client";

import { useTranslations } from "next-intl";
import { ArticlesStatCards } from "./ArticlesStatCards";
import { useAnalyticsOverview } from "@/hooks/queries/analytics";
import { LastUpdatedIndicator } from "@/components/ui/LastUpdatedIndicator";

export function ArticlesPageHeader() {
  const t = useTranslations("Dashboard.articles.page");
  const { data } = useAnalyticsOverview();
  const fmt = (n: number | undefined) => (n != null ? n.toLocaleString() : "—");
  const stats = [
    { id: "1", value: fmt(data?.published_articles), labelKey: "articles.stats.published", iconKey: "book" },
    { id: "2", value: fmt(data?.total_contributions), labelKey: "articles.stats.contributions", iconKey: "pen" },
    { id: "3", value: fmt(data?.total_page_views), labelKey: "articles.stats.totalReads", iconKey: "barChart" },
    { id: "4", value: fmt(data?.days_active), labelKey: "articles.stats.daysActive", iconKey: "calendar" },
  ];

  return (
    <div className="pb-6">
      <div className="flex flex-col gap-2 py-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">{t("title")}</h1>
          <p className="mt-1 text-sm text-[var(--tott-muted)]">{t("subtitle")}</p>
        </div>
        <LastUpdatedIndicator />
      </div>

      <ArticlesStatCards stats={stats} />
    </div>
  );
}

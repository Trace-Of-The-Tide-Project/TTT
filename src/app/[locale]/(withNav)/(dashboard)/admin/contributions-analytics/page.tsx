"use client";

import { TopPerformingArticles, type TopArticleEntry } from "@/components/dashboard/admin/mainDashboard/TopPerformingArticles";
import { useAnalyticsContentPerformance } from "@/hooks/queries/analytics";

export default function ContributionsAnalyticsPage() {
  const { data } = useAnalyticsContentPerformance();
  const articles: TopArticleEntry[] = (data?.top_articles ?? []).map((a) => ({
    id: a.id,
    title: a.title,
    views: a.view_count.toLocaleString(),
    contributors: a.contributor_count > 0 ? a.contributor_count : undefined,
    trend:
      a.trend_pct !== null
        ? {
            value: `${a.trend_pct >= 0 ? "+" : ""}${a.trend_pct}%`,
            direction: a.trend_pct >= 0 ? ("up" as const) : ("down" as const),
          }
        : undefined,
  }));

  return (
    <div>
      <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
        <TopPerformingArticles items={articles} />
      </div>
    </div>
  );
}

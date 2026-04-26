"use client";

import { useEffect, useState } from "react";
import { TopPerformingArticles, type TopArticleEntry } from "@/components/dashboard/admin/mainDashboard/TopPerformingArticles";
import { getAnalyticsContentPerformance } from "@/services/analytics.service";

export default function ContributionsAnalyticsPage() {
  const [articles, setArticles] = useState<TopArticleEntry[]>([]);

  useEffect(() => {
    getAnalyticsContentPerformance().then((data) => {
      setArticles(
        data.top_articles.map((a) => ({
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
        }))
      );
    }).catch(() => {});
  }, []);

  return (
    <div>
      <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
        <TopPerformingArticles items={articles} />
      </div>
    </div>
  );
}

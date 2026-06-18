"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { api } from "@/services/api";

type AnalyticsTabId = "overview" | "contentPerformance" | "topCreators" | "conversionFunnel";

const ANALYTICS_TAB_IDS: AnalyticsTabId[] = [
  "overview",
  "contentPerformance",
  "topCreators",
  "conversionFunnel",
];

export default function AnalyticsPage() {
  const t = useTranslations("Dashboard.analyticsPage");
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<AnalyticsTabId>("overview");
  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "1y">("30d");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [overview, setOverview] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [contentPerf, setContentPerf] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [topCreatorsData, setTopCreatorsData] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [funnel, setFunnel] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      api.get("/analytics/overview", { params: { period } }).then((r: { data: any }) => setOverview(r.data)),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      api.get("/analytics/content-performance", { params: { period } }).then((r: { data: any }) => setContentPerf(r.data)),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      api.get("/analytics/top-creators", { params: { period, limit: 10 } }).then((r: { data: any }) => setTopCreatorsData(r.data)),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      api.get("/analytics/conversion-funnel").then((r: { data: any }) => setFunnel(r.data)),
    ]).finally(() => setLoading(false));
  }, [period]);

  const formatNum = (n: number) => (n ?? 0).toLocaleString(locale === "ar" ? "ar" : "en-US");
  const formatCurrency = (n: number) => `$${formatNum(n)}`;

  const topCategories: Array<{ category: string; total_views: number; article_count: number }> =
    contentPerf?.top_categories ?? [];
  const maxViews = useMemo(
    () => Math.max(1, ...topCategories.map((r) => r.total_views)),
    [topCategories],
  );

  const topAuthors: Array<{ author_id: string; article_count: number; total_views: number; author: { full_name: string } }> =
    topCreatorsData?.top_authors ?? [];

  const funnelSteps: Array<{ stage: string; count: number; conversion: number | null }> =
    funnel?.funnel ?? [];
  const funnelMax = funnelSteps[0]?.count ?? 1;

  const summaryCards = overview?.summary
    ? [
        { label: t("overview.totalViews"), value: formatNum(overview.summary.total_page_views) },
        { label: t("overview.totalUsers"), value: formatNum(overview.summary.total_users) },
        { label: t("overview.newUsers"), value: formatNum(overview.summary.new_users) },
        { label: t("overview.publishedArticles"), value: formatNum(overview.summary.published_articles) },
      ]
    : [];

  // suppress unused warning
  void formatCurrency;

  return (
    <div className="px-6 py-6 sm:px-8 sm:py-8">
      <div className="rounded-2xl border border-[#2f2f2f] bg-[#121212] p-6 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex w-fit gap-1 rounded-lg border border-[#444] bg-[#232323] p-1">
            {ANALYTICS_TAB_IDS.map((tabId) => (
              <button
                key={tabId}
                type="button"
                onClick={() => setActiveTab(tabId)}
                className={`rounded-md px-5 py-2.5 text-sm font-medium transition-all ${
                  tabId === activeTab
                    ? "border border-[#4A4A4A] bg-[#333333] text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
                    : "border border-transparent bg-transparent text-[#AAAAAA] hover:text-[#E0E0E0]"
                }`}
              >
                {t(`tabs.${tabId}`)}
              </button>
            ))}
          </div>

          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as typeof period)}
            className="rounded-lg border border-[#444] bg-[#232323] px-3 py-2 text-sm text-white focus:outline-none"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>

        {loading && <p className="text-center text-sm text-gray-500 py-8">Loading…</p>}

        {!loading && activeTab === "overview" && (
          <div className="space-y-6">
            {summaryCards.length > 0 && (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {summaryCards.map((card) => (
                  <div key={card.label} className="rounded-xl border border-[#2f2f2f] bg-[#181818] p-5">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">{card.label}</p>
                    <p className="mt-2 text-2xl font-bold text-white">{card.value}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {[
                { title: t("overview.platformGrowth"), hint: t("overview.platformGrowthHint"), data: overview?.charts?.user_growth ?? [] },
                { title: t("overview.engagementTrends"), hint: t("overview.engagementTrendsHint"), data: overview?.charts?.content_growth ?? [] },
              ].map(({ title, hint, data }) => (
                <div key={title} className="rounded-2xl border border-[#2f2f2f] bg-[#121212] p-6">
                  <h3 className="text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{hint}</p>
                  <div className="mt-6 space-y-2">
                    {data.length === 0 && <p className="text-sm text-gray-600">{t("overview.chartPlaceholder")}</p>}
                    {data.slice(0, 8).map((pt: { date: string; count: number }) => {
                      const max = Math.max(1, ...data.map((x: { count: number }) => x.count));
                      return (
                        <div key={pt.date} className="flex items-center gap-3">
                          <span className="w-20 text-xs text-gray-500">{pt.date}</span>
                          <div className="flex-1 h-1.5 rounded-full bg-[#222]">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.max(2, (pt.count / max) * 100)}%`,
                                background: "linear-gradient(to right, rgba(203,161,88,0.35), #CBA158)",
                              }}
                            />
                          </div>
                          <span className="w-10 text-right text-xs text-gray-400">{formatNum(pt.count)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && activeTab === "contentPerformance" && (
          <div className="mt-2">
            <h2 className="text-2xl font-semibold text-white">{t("contentPerformance.title")}</h2>
            <p className="mt-1 text-sm text-gray-500">{t("contentPerformance.subtitle")}</p>
            {topCategories.length === 0 ? (
              <p className="mt-8 text-center text-sm text-gray-500">No data yet.</p>
            ) : (
              <div className="mt-7 space-y-6">
                {topCategories.map((row, idx) => {
                  const pct = Math.max(0.06, row.total_views / maxViews);
                  return (
                    <div key={row.category} className="grid grid-cols-[32px_1fr] items-center gap-4">
                      <div className="text-xl font-semibold text-gray-500">{idx + 1}</div>
                      <div className="min-w-0">
                        <div className="flex items-center justify-between gap-6">
                          <p className="truncate text-base font-semibold text-white">{row.category}</p>
                          <p className="text-sm text-gray-400">
                            {formatNum(row.total_views)} {t("contentPerformance.views")}
                          </p>
                        </div>
                        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-[#222]">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${pct * 100}%`,
                              background: "linear-gradient(to right, rgba(203,161,88,0.35), #CBA158)",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {!loading && activeTab === "topCreators" && (
          <div className="mt-2">
            <h2 className="text-2xl font-semibold text-white">{t("topCreators.title")}</h2>
            <p className="mt-1 text-sm text-gray-500">{t("topCreators.subtitle")}</p>
            {topAuthors.length === 0 ? (
              <p className="mt-8 text-center text-sm text-gray-500">No data yet.</p>
            ) : (
              <div className="mt-6 overflow-hidden rounded-2xl border border-[#2f2f2f]">
                <div className="grid grid-cols-[1.6fr_0.7fr_0.7fr] items-center border-b border-[#2f2f2f] bg-[#121212] px-6 py-4">
                  <div className="text-start text-sm text-[#CBA158]">{t("topCreators.colCreator")}</div>
                  <div className="text-center text-sm text-[#CBA158]">{t("topCreators.colContent")}</div>
                  <div className="text-end text-sm text-[#CBA158]">Views</div>
                </div>
                <div className="divide-y divide-[#2f2f2f]">
                  {topAuthors.map((row, idx) => (
                    <div key={row.author_id} className="grid grid-cols-[1.6fr_0.7fr_0.7fr] items-center px-6 py-5">
                      <div className="text-start text-sm font-medium text-white">
                        {idx + 1}. {row.author?.full_name ?? row.author_id}
                      </div>
                      <div className="text-center text-sm text-gray-400">{formatNum(row.article_count)}</div>
                      <div className="text-end text-sm text-gray-400">{formatNum(row.total_views)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!loading && activeTab === "conversionFunnel" && (
          <div className="mt-2">
            <h2 className="text-2xl font-semibold text-white">{t("funnel.title")}</h2>
            <p className="mt-1 text-sm text-gray-500">{t("funnel.subtitle")}</p>
            {funnelSteps.length === 0 ? (
              <p className="mt-8 text-center text-sm text-gray-500">No data yet.</p>
            ) : (
              <div className="mt-8 space-y-7">
                {funnelSteps.map((step) => {
                  const pct = Math.max(0.02, step.count / funnelMax);
                  return (
                    <div key={step.stage}>
                      <div className="flex items-center justify-between gap-6">
                        <p className="text-base font-semibold text-white capitalize">{step.stage.replace(/_/g, " ")}</p>
                        <div className="flex items-center gap-4">
                          <p className="text-sm text-gray-400">{formatNum(step.count)}</p>
                          {step.conversion != null && (
                            <p className="text-sm font-semibold text-emerald-400">
                              {t("funnel.conversion", { pct: step.conversion })}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-[#222]">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct * 100}%`,
                            background: "linear-gradient(to right, rgba(203,161,88,0.35), #CBA158)",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

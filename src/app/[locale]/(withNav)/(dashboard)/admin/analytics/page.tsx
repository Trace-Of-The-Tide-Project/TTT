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
  const tx = useTranslations("Dashboard.analyticsExtra");
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
    let cancelled = false;
    setLoading(true);
    Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      api.get("/analytics/overview", { params: { period } }).then((r: { data: any }) => { if (!cancelled) setOverview(r.data); }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      api.get("/analytics/content-performance", { params: { period } }).then((r: { data: any }) => { if (!cancelled) setContentPerf(r.data); }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      api.get("/analytics/top-creators", { params: { period, limit: 10 } }).then((r: { data: any }) => { if (!cancelled) setTopCreatorsData(r.data); }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      api.get("/analytics/conversion-funnel").then((r: { data: any }) => { if (!cancelled) setFunnel(r.data); }),
    ]).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [period]);

  const formatNum = (n: number) => (n ?? 0).toLocaleString(locale === "ar" ? "ar" : "en-US");
  const formatCurrency = (n: number) => `$${formatNum(n)}`;

  const topCategories: Array<{ category: string; total_views: number; article_count: number }> = useMemo(
    () => contentPerf?.top_categories ?? [],
    [contentPerf],
  );
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
      <div className="rounded-2xl border border-[var(--tott-card-border)] bg-[var(--tott-elevated)] p-6 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex w-fit gap-1 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] p-1">
            {ANALYTICS_TAB_IDS.map((tabId) => (
              <button
                key={tabId}
                type="button"
                onClick={() => setActiveTab(tabId)}
                className={`rounded-md px-5 py-2.5 text-sm font-medium transition-all ${
                  tabId === activeTab
                    ? "border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] text-foreground shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
                    : "border border-transparent bg-transparent text-[var(--tott-muted)] hover:text-foreground"
                }`}
              >
                {t(`tabs.${tabId}`)}
              </button>
            ))}
          </div>

          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as typeof period)}
            className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground focus:outline-none"
          >
            <option value="7d">{tx("period7d")}</option>
            <option value="30d">{tx("period30d")}</option>
            <option value="90d">{tx("period90d")}</option>
            <option value="1y">{tx("periodYear")}</option>
          </select>
        </div>

        {loading && <p className="text-center text-sm text-[var(--tott-muted)] py-8">{tx("loading")}</p>}

        {!loading && activeTab === "overview" && (
          <div className="space-y-6">
            {summaryCards.length > 0 && (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {summaryCards.map((card) => (
                  <div key={card.label} className="rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-elevated)] p-5">
                    <p className="text-xs text-[var(--tott-muted)] uppercase tracking-wider">{card.label}</p>
                    <p className="mt-2 text-2xl font-bold text-foreground">{card.value}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {[
                { title: t("overview.platformGrowth"), hint: t("overview.platformGrowthHint"), data: overview?.charts?.user_growth ?? [] },
                { title: t("overview.engagementTrends"), hint: t("overview.engagementTrendsHint"), data: overview?.charts?.content_growth ?? [] },
              ].map(({ title, hint, data }) => (
                <div key={title} className="rounded-2xl border border-[var(--tott-card-border)] bg-[var(--tott-elevated)] p-6">
                  <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                  <p className="mt-1 text-sm text-[var(--tott-muted)]">{hint}</p>
                  <div className="mt-6 space-y-2">
                    {data.length === 0 && <p className="text-sm text-[var(--tott-muted)]">{t("overview.chartPlaceholder")}</p>}
                    {data.slice(0, 8).map((pt: { date: string; count: number }) => {
                      const max = Math.max(1, ...data.map((x: { count: number }) => x.count));
                      return (
                        <div key={pt.date} className="flex items-center gap-3">
                          <span className="w-20 text-xs text-[var(--tott-muted)]">{pt.date}</span>
                          <div className="flex-1 h-1.5 rounded-full bg-[var(--tott-dash-surface-2)]">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.max(2, (pt.count / max) * 100)}%`,
                                background: "linear-gradient(to right, rgba(203,161,88,0.35), #CBA158)",
                              }}
                            />
                          </div>
                          <span className="w-10 text-right text-xs text-[var(--tott-muted)]">{formatNum(pt.count)}</span>
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
            <h2 className="text-2xl font-semibold text-foreground">{t("contentPerformance.title")}</h2>
            <p className="mt-1 text-sm text-[var(--tott-muted)]">{t("contentPerformance.subtitle")}</p>
            {topCategories.length === 0 ? (
              <p className="mt-8 text-center text-sm text-[var(--tott-muted)]">{tx("noDataYet")}</p>
            ) : (
              <div className="mt-7 space-y-6">
                {topCategories.map((row, idx) => {
                  const pct = Math.max(0.06, row.total_views / maxViews);
                  return (
                    <div key={row.category} className="grid grid-cols-[32px_1fr] items-center gap-4">
                      <div className="text-xl font-semibold text-[var(--tott-muted)]">{idx + 1}</div>
                      <div className="min-w-0">
                        <div className="flex items-center justify-between gap-6">
                          <p className="truncate text-base font-semibold text-foreground">{row.category}</p>
                          <p className="text-sm text-[var(--tott-muted)]">
                            {formatNum(row.total_views)} {t("contentPerformance.views")}
                          </p>
                        </div>
                        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-[var(--tott-dash-surface-2)]">
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
            <h2 className="text-2xl font-semibold text-foreground">{t("topCreators.title")}</h2>
            <p className="mt-1 text-sm text-[var(--tott-muted)]">{t("topCreators.subtitle")}</p>
            {topAuthors.length === 0 ? (
              <p className="mt-8 text-center text-sm text-[var(--tott-muted)]">{tx("noDataYet")}</p>
            ) : (
              <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--tott-card-border)]">
                <div className="grid grid-cols-[1.6fr_0.7fr_0.7fr] items-center border-b border-[var(--tott-card-border)] bg-[var(--tott-elevated)] px-6 py-4">
                  <div className="text-start text-sm text-[var(--tott-accent-gold)]">{t("topCreators.colCreator")}</div>
                  <div className="text-center text-sm text-[var(--tott-accent-gold)]">{t("topCreators.colContent")}</div>
                  <div className="text-end text-sm text-[var(--tott-accent-gold)]">{tx("viewsColumn")}</div>
                </div>
                <div className="divide-y divide-[var(--tott-card-border)]">
                  {topAuthors.map((row, idx) => (
                    <div key={row.author_id} className="grid grid-cols-[1.6fr_0.7fr_0.7fr] items-center px-6 py-5">
                      <div className="text-start text-sm font-medium text-foreground">
                        {idx + 1}. {row.author?.full_name ?? row.author_id}
                      </div>
                      <div className="text-center text-sm text-[var(--tott-muted)]">{formatNum(row.article_count)}</div>
                      <div className="text-end text-sm text-[var(--tott-muted)]">{formatNum(row.total_views)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!loading && activeTab === "conversionFunnel" && (
          <div className="mt-2">
            <h2 className="text-2xl font-semibold text-foreground">{t("funnel.title")}</h2>
            <p className="mt-1 text-sm text-[var(--tott-muted)]">{t("funnel.subtitle")}</p>
            {funnelSteps.length === 0 ? (
              <p className="mt-8 text-center text-sm text-[var(--tott-muted)]">{tx("noDataYet")}</p>
            ) : (
              <div className="mt-8 space-y-7">
                {funnelSteps.map((step) => {
                  const pct = Math.max(0.02, step.count / funnelMax);
                  return (
                    <div key={step.stage}>
                      <div className="flex items-center justify-between gap-6">
                        <p className="text-base font-semibold text-foreground capitalize">{step.stage.replace(/_/g, " ")}</p>
                        <div className="flex items-center gap-4">
                          <p className="text-sm text-[var(--tott-muted)]">{formatNum(step.count)}</p>
                          {step.conversion != null && (
                            <p className="text-sm font-semibold text-emerald-400">
                              {t("funnel.conversion", { pct: step.conversion })}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-[var(--tott-dash-surface-2)]">
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

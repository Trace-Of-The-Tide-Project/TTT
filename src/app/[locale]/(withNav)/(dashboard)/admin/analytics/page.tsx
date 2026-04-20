"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type AnalyticsTabId = "overview" | "contentPerformance" | "topCreators" | "conversionFunnel";

const ANALYTICS_TAB_IDS: AnalyticsTabId[] = [
  "overview",
  "contentPerformance",
  "topCreators",
  "conversionFunnel",
];

type TopCategoryRow = {
  id: string;
  views: number;
  trendPct: number;
};

type CreatorRow = {
  id: string;
  rank: number;
  name: string;
  followers: number;
  content: number;
  earnings: number;
};

type FunnelStep = {
  id: string;
  labelKey: "visitors" | "registeredUsers" | "contributors" | "authors" | "editors";
  value: number;
  conversionPct?: number;
};

const TOP_CATEGORIES: TopCategoryRow[] = [
  { id: "c1", views: 125_400, trendPct: 12 },
  { id: "c2", views: 98_200, trendPct: 8 },
  { id: "c3", views: 76_500, trendPct: -2 },
  { id: "c4", views: 54_300, trendPct: 15 },
  { id: "c5", views: 32_100, trendPct: 22 },
];

const TOP_CREATORS: CreatorRow[] = Array.from({ length: 6 }).map((_, i) => ({
  id: `u${i + 1}`,
  rank: 1,
  name: "Fadi Barghouti",
  followers: 12_400,
  content: 127,
  earnings: 8_920,
}));

const FUNNEL_STEPS_DATA: Omit<FunnelStep, "labelKey">[] = [
  { id: "f1", value: 45_000 },
  { id: "f2", value: 12_500, conversionPct: 27.8 },
  { id: "f3", value: 1_543, conversionPct: 12.3 },
  { id: "f4", value: 589, conversionPct: 38.2 },
  { id: "f5", value: 156, conversionPct: 26.5 },
];

const FUNNEL_LABEL_KEYS: FunnelStep["labelKey"][] = [
  "visitors",
  "registeredUsers",
  "contributors",
  "authors",
  "editors",
];

export default function AnalyticsPage() {
  const t = useTranslations("Dashboard.analyticsPage");
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<AnalyticsTabId>("overview");

  const funnelSteps = useMemo(
    () =>
      FUNNEL_STEPS_DATA.map((row, i) => ({
        ...row,
        labelKey: FUNNEL_LABEL_KEYS[i]!,
      })),
    [],
  );

  const maxViews = useMemo(() => Math.max(...TOP_CATEGORIES.map((r) => r.views)), []);

  const formatViews = (n: number) => n.toLocaleString(locale === "ar" ? "ar" : "en-US");
  const formatInt = (n: number) => n.toLocaleString(locale === "ar" ? "ar" : "en-US");
  const formatCurrency = (n: number) =>
    `$${n.toLocaleString(locale === "ar" ? "ar" : "en-US")}`;

  return (
    <div className="px-6 py-6 sm:px-8 sm:py-8">
      <div className="rounded-2xl border border-[#2f2f2f] bg-[#121212] p-6 lg:p-8">
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

        {activeTab === "overview" && (
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-[#2f2f2f] bg-[#121212] p-6">
              <h3 className="text-lg font-semibold text-white">{t("overview.platformGrowth")}</h3>
              <p className="mt-1 text-sm text-gray-500">{t("overview.platformGrowthHint")}</p>
              <div className="mt-6 flex h-[280px] items-end rounded-2xl border border-[#2f2f2f] bg-[#0f0f0f] p-6 text-sm text-gray-500">
                {t("overview.chartPlaceholder")}
              </div>
            </div>

            <div className="rounded-2xl border border-[#2f2f2f] bg-[#121212] p-6">
              <h3 className="text-lg font-semibold text-white">{t("overview.engagementTrends")}</h3>
              <p className="mt-1 text-sm text-gray-500">{t("overview.engagementTrendsHint")}</p>
              <div className="mt-6 flex h-[280px] items-end rounded-2xl border border-[#2f2f2f] bg-[#0f0f0f] p-6 text-sm text-gray-500">
                {t("overview.chartPlaceholder")}
              </div>
            </div>
          </div>
        )}

        {activeTab === "contentPerformance" && (
          <div className="mt-6">
            <h2 className="text-2xl font-semibold text-white">{t("contentPerformance.title")}</h2>
            <p className="mt-1 text-sm text-gray-500">{t("contentPerformance.subtitle")}</p>

            <div className="mt-7 space-y-6">
              {TOP_CATEGORIES.map((row, idx) => {
                const pct = Math.max(0.06, row.views / maxViews);
                const trendUp = row.trendPct >= 0;
                return (
                  <div key={row.id} className="grid grid-cols-[32px_1fr_auto] items-center gap-4">
                    <div className="text-xl font-semibold text-gray-500">{idx + 1}</div>
                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-6">
                        <p className="truncate text-base font-semibold text-white">
                          {t(`topCategories.${row.id}` as "topCategories.c1")}
                        </p>
                        <div className="flex items-center gap-3">
                          <p className="text-sm text-gray-400">
                            {formatViews(row.views)} {t("contentPerformance.views")}
                          </p>
                          <p
                            className={`flex items-center gap-1 text-xs font-semibold ${
                              trendUp ? "text-emerald-400" : "text-red-400"
                            }`}
                          >
                            <span aria-hidden="true">{trendUp ? "↗" : "↘"}</span>
                            {Math.abs(row.trendPct)}%
                          </p>
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
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "topCreators" && (
          <div className="mt-6">
            <h2 className="text-2xl font-semibold text-white">{t("topCreators.title")}</h2>
            <p className="mt-1 text-sm text-gray-500">{t("topCreators.subtitle")}</p>

            <div className="mt-6 overflow-hidden rounded-2xl border border-[#2f2f2f]">
              <div className="grid grid-cols-[1.6fr_0.7fr_0.6fr_0.7fr] items-center border-b border-[#2f2f2f] bg-[#121212] px-6 py-4 text-sm">
                <div className="text-start text-sm text-[#CBA158]">{t("topCreators.colCreator")}</div>
                <div className="text-center text-sm text-[#CBA158]">{t("topCreators.colFollowers")}</div>
                <div className="text-center text-sm text-[#CBA158]">{t("topCreators.colContent")}</div>
                <div className="text-end text-sm text-[#CBA158]">{t("topCreators.colEarnings")}</div>
              </div>

              <div className="divide-y divide-[#2f2f2f]">
                {TOP_CREATORS.map((row) => (
                  <div
                    key={row.id}
                    className="grid grid-cols-[1.6fr_0.7fr_0.6fr_0.7fr] items-center px-6 py-5"
                  >
                    <div className="text-start text-sm font-medium text-white">
                      {row.rank}-{row.name}
                    </div>
                    <div className="text-center text-sm text-gray-400">{formatInt(row.followers)}</div>
                    <div className="text-center text-sm text-gray-400">{formatInt(row.content)}</div>
                    <div className="text-end text-sm text-gray-400">{formatCurrency(row.earnings)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "conversionFunnel" && (
          <div className="mt-6">
            <h2 className="text-2xl font-semibold text-white">{t("funnel.title")}</h2>
            <p className="mt-1 text-sm text-gray-500">{t("funnel.subtitle")}</p>

            <div className="mt-8 space-y-7">
              {funnelSteps.map((step) => {
                const pct = Math.max(0.02, step.value / funnelSteps[0]!.value);
                return (
                  <div key={step.id}>
                    <div className="flex items-center justify-between gap-6">
                      <p className="text-base font-semibold text-white">{t(`funnel.${step.labelKey}`)}</p>
                      <div className="flex items-center gap-4">
                        <p className="text-sm text-gray-400">{formatInt(step.value)}</p>
                        {typeof step.conversionPct === "number" && (
                          <p className="text-sm font-semibold text-emerald-400">
                            {t("funnel.conversion", { pct: step.conversionPct })}
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
          </div>
        )}
      </div>
    </div>
  );
}

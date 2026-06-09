"use client";

import { DashboardHeader } from "@/components/dashboard/shared/DashboardHeader";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";
import { SpringCard } from "@/components/motion/SpringCard";
import { HexIconOutlined } from "@/components/dashboard/admin/articles/articles-create/HexIconOutlined";
import {
  EyeIcon,
  BarChartIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  HeartHandshakeIcon,
  GridIcon,
} from "@/components/ui/icons";
import { useAuthorDashboard } from "@/hooks/queries/author-dashboard";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import Link from "next/link";

interface TopArticle {
  id: string;
  title: string;
  view_count: number;
  published_at: string | null;
  contributors: number;
  growth: number;
}

interface AnalyticsData {
  top_articles: TopArticle[];
}

function normalizeTopArticle(raw: unknown): TopArticle {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    id: typeof o.id === "string" ? o.id : "",
    title: typeof o.title === "string" ? o.title : "Untitled",
    view_count: typeof o.view_count === "number" ? o.view_count : 0,
    published_at: typeof o.published_at === "string" ? o.published_at : null,
    contributors: typeof o.contributors === "number" ? o.contributors : 0,
    growth: typeof o.growth === "number" ? o.growth : 0,
  };
}

function useAuthorAnalytics() {
  return useQuery({
    queryKey: ["author-analytics"],
    queryFn: async (): Promise<AnalyticsData> => {
      const { data } = await api.get<unknown>("/author/analytics");
      const o = (data && typeof data === "object" ? data : {}) as Record<string, unknown>;
      return {
        top_articles: Array.isArray(o.top_articles)
          ? o.top_articles.map(normalizeTopArticle)
          : [],
      };
    },
  });
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

type StatMiniCardProps = {
  icon: React.ReactNode;
  value: string;
  label: string;
  trend?: { value: string; direction: "up" | "down" };
};

function StatMiniCard({ icon, value, label, trend }: StatMiniCardProps) {
  return (
    <SpringCard className="relative flex flex-col items-center gap-2 px-4 py-7">
      <ChamferedFrame />
      <span
        className="relative flex h-11 w-11 items-center justify-center"
        style={{ color: "var(--tott-dash-gold-text)" }}
      >
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 44 44" fill="none">
          <path
            d="M22 2L40 12.5V31.5L22 42L4 31.5V12.5Z"
            fill="var(--tott-dash-icon-bg)"
            stroke="currentColor"
            strokeOpacity="0.5"
            strokeWidth="1.25"
          />
        </svg>
        <span className="relative flex items-center justify-center">{icon}</span>
      </span>
      <span className="relative text-[11px] font-medium tracking-wide text-[var(--tott-muted)]">
        {label}
      </span>
      <span className="relative text-3xl font-bold tracking-tight text-foreground">{value}</span>
      {trend && (
        <span
          className="relative inline-flex items-center gap-1 text-[11px] font-medium"
          style={{
            color:
              trend.direction === "up"
                ? "var(--tott-dash-positive)"
                : "var(--tott-dash-negative)",
          }}
        >
          {trend.direction === "up" ? "↗" : "↘"} {trend.value}
        </span>
      )}
    </SpringCard>
  );
}

export function ProfileAnalytics() {
  const { data: analytics, isLoading } = useAuthorAnalytics();
  const { data: dashboard } = useAuthorDashboard();

  const topArticles = analytics?.top_articles ?? [];
  const maxViews = Math.max(...topArticles.map((a) => a.view_count), 1);

  const totalViews = topArticles.reduce((sum, a) => sum + a.view_count, 0);
  const totalContributors = topArticles.reduce((sum, a) => sum + a.contributors, 0);
  const avgViews = topArticles.length > 0 ? Math.round(totalViews / topArticles.length) : 0;
  const articlesPublished = dashboard?.stats.articles_published ?? topArticles.length;

  const dash = "…";

  return (
    <div>
      <DashboardHeader
        compactPadding
        title="Analytics"
        subtitle="Track your content performance and audience."
      />

      <div className="space-y-8 p-6 sm:p-8">
        {/* Summary stat cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatMiniCard
            icon={<EyeIcon />}
            value={isLoading ? dash : formatNumber(totalViews)}
            label="Total views"
          />
          <StatMiniCard
            icon={<GridIcon />}
            value={isLoading ? dash : String(articlesPublished)}
            label="Articles published"
          />
          <StatMiniCard
            icon={<BarChartIcon />}
            value={isLoading ? dash : formatNumber(avgViews)}
            label="Avg views / article"
          />
          <StatMiniCard
            icon={<HeartHandshakeIcon />}
            value={isLoading ? dash : String(totalContributors)}
            label="Total contributors"
          />
        </div>

        {/* Top articles */}
        <div>
          <h3 className="mb-4 text-lg font-bold text-foreground">Top Performing Articles</h3>

          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="relative px-5 py-4 animate-pulse">
                  <ChamferedFrame />
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-gray-800 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-2/3 rounded bg-gray-800" />
                      <div className="h-2 w-1/3 rounded bg-gray-800" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : topArticles.length === 0 ? (
            <div className="relative flex flex-col items-center justify-center gap-3 py-16">
              <ChamferedFrame />
              <span style={{ color: "var(--tott-dash-gold-text)" }}>
                <BarChartIcon />
              </span>
              <p className="text-sm text-[var(--tott-muted)]">No published articles yet.</p>
              <p className="text-xs text-gray-600">Publish your first article to see analytics here.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {topArticles.map((article, i) => {
                const barWidth = maxViews > 0 ? (article.view_count / maxViews) * 100 : 0;
                const isUp = article.growth >= 0;
                const pubDate = formatDate(article.published_at);
                return (
                  <div key={article.id} className="relative px-5 py-4">
                    <ChamferedFrame />
                    <div className="flex items-center gap-4">
                      {/* Rank + hex icon */}
                      <div className="relative shrink-0">
                        <HexIconOutlined size="md">
                          <span className="text-sm font-bold" style={{ color: "var(--tott-dash-gold-text)" }}>
                            {i + 1}
                          </span>
                        </HexIconOutlined>
                      </div>

                      {/* Title + meta */}
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/admin/articles/${article.id}`}
                          className="block truncate text-sm font-medium transition-colors hover:text-[var(--tott-dash-gold-text)]"
                          style={{ color: "#C9A96E" }}
                        >
                          {article.title}
                        </Link>
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-gray-500">
                          {pubDate && <span>{pubDate}</span>}
                          {article.contributors > 0 && (
                            <span>· {article.contributors} contributor{article.contributors !== 1 ? "s" : ""}</span>
                          )}
                        </div>

                        {/* View bar */}
                        <div className="mt-2.5 h-1 w-full rounded-full bg-gray-800">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${barWidth}%`,
                              background: "linear-gradient(90deg, #C9A96E, #7a5c2e)",
                            }}
                          />
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="shrink-0 flex flex-col items-end gap-1">
                        <span className="text-sm font-semibold text-foreground">
                          {formatNumber(article.view_count)}
                          <span className="ml-1 text-xs font-normal text-gray-500">views</span>
                        </span>
                        <span
                          className="flex items-center gap-0.5 text-xs font-medium"
                          style={{
                            color: isUp ? "var(--tott-dash-positive)" : "var(--tott-dash-negative)",
                          }}
                        >
                          {isUp ? <TrendingUpIcon /> : <TrendingDownIcon />}
                          {Math.abs(article.growth)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

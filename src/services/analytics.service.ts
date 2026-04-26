import { api } from "./api";

function unwrap<T>(body: unknown): T {
  if (body && typeof body === "object" && "data" in body && (body as { data?: unknown }).data) {
    return (body as { data: T }).data;
  }
  return body as T;
}

export interface OverviewSummary {
  total_page_views: number;
  total_users: number;
  new_users: number;
  user_growth_pct: number;
  total_articles: number;
  published_articles: number;
  total_contributions: number;
  new_contributions: number;
  days_active: number;
}

export interface TopArticle {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  view_count: number;
  published_at: string | null;
  author?: { id: string; username?: string; full_name?: string };
  contributor_count: number;
  trend_pct: number | null;
}

export interface ContentPerformance {
  top_articles: TopArticle[];
  top_categories: Array<{ category: string; total_views: string; article_count: string }>;
}

export async function getAnalyticsOverview(period = "30d"): Promise<OverviewSummary> {
  const res = await api.get("/analytics/overview", { params: { period } });
  const body = unwrap<{ summary: OverviewSummary }>(res.data);
  return body.summary;
}

export async function getAnalyticsContentPerformance(period = "30d"): Promise<ContentPerformance> {
  const res = await api.get("/analytics/content-performance", { params: { period } });
  return unwrap<ContentPerformance>(res.data);
}

import { api } from "./api";

export interface AuthorStats {
  articles_published: number;
  contributions: number;
  total_reads: number;
  days_active: number;
}

export interface RecentArticle {
  id: string;
  title: string;
  status: string;
  published_at: string | null;
  createdAt: string;
}

export interface RecentSupporter {
  id: string;
  amount: number;
  type: string;
  createdAt: string;
  User?: { id: string; username: string; full_name?: string };
}

export interface AuthorDashboardData {
  stats: AuthorStats;
  recent_articles: RecentArticle[];
  recent_supporters: RecentSupporter[];
}

function num(v: unknown): number {
  return typeof v === "number" ? v : Number(v) || 0;
}

function str(v: unknown): string {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

function normalizeStats(raw: unknown): AuthorStats {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    articles_published: num(o.articles_published),
    contributions: num(o.contributions),
    total_reads: num(o.total_reads),
    days_active: num(o.days_active),
  };
}

function normalizeArticle(raw: unknown): RecentArticle {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    id: str(o.id),
    title: str(o.title),
    status: str(o.status),
    published_at: typeof o.published_at === "string" ? o.published_at : null,
    createdAt: str(o.createdAt),
  };
}

function normalizeSupporter(raw: unknown): RecentSupporter {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const rawUser = o.user ?? o.User;
  const user = rawUser && typeof rawUser === "object" ? (rawUser as Record<string, unknown>) : null;
  return {
    id: str(o.id),
    amount: num(o.amount),
    type: str(o.type),
    createdAt: str(o.createdAt),
    User: user
      ? {
          id: str(user.id),
          username: str(user.username),
          full_name: typeof user.full_name === "string" ? user.full_name : undefined,
        }
      : undefined,
  };
}

export async function getAuthorDashboard(): Promise<AuthorDashboardData> {
  const { data } = await api.get<unknown>("/author/dashboard");
  const o = (data && typeof data === "object" ? data : {}) as Record<string, unknown>;
  return {
    stats: normalizeStats(o.stats),
    recent_articles: Array.isArray(o.recent_articles)
      ? o.recent_articles.map(normalizeArticle)
      : [],
    recent_supporters: Array.isArray(o.recent_supporters)
      ? o.recent_supporters.map(normalizeSupporter)
      : [],
  };
}
import { api } from "./api";

export interface StatValue {
  value: number;
  change: number;
  label: string;
}

export interface DashboardStats {
  totalUsers: StatValue;
  contentPublished: StatValue;
  monthlyDonations: StatValue;
  activeToday: StatValue;
}

function unwrap<T>(body: unknown): T {
  if (body && typeof body === "object" && "data" in body && (body as { data?: unknown }).data) {
    return (body as { data: T }).data;
  }
  return body as T;
}

export async function getDashboardStats(period?: string): Promise<DashboardStats> {
  const params = period ? { period } : {};
  const res = await api.get("/dashboard/stats", { params });
  return unwrap<DashboardStats>(res.data);
}

// ──────────────────────────────────────────────────────────────
// Alerts
// ──────────────────────────────────────────────────────────────

export interface AlertsResponse {
  flaggedContent: number;
  pendingReviews: number;
  pendingEditorApps: number;
  unreadNotifications: number;
  items: Array<{ type: string; severity: string; message: string; description: string }>;
}

export async function getDashboardAlerts(): Promise<AlertsResponse> {
  const res = await api.get("/dashboard/alerts");
  return unwrap<AlertsResponse>(res.data);
}

/** The dismissable, count-driven alert types (matches backend DismissAlertDto). */
export type DismissableAlertType = "flagged" | "pending_review" | "editor_application";

/**
 * Persist the current admin's dismissal of one alert at its present count.
 * The server hides it until the underlying count rises above that value, then
 * the alert re-surfaces — so subsequent GET /dashboard/alerts already excludes it.
 */
export async function dismissDashboardAlert(type: DismissableAlertType): Promise<void> {
  await api.post("/dashboard/alerts/dismiss", { type });
}

// ──────────────────────────────────────────────────────────────
// Editor Applications
// ──────────────────────────────────────────────────────────────

export interface EditorApplicationRow {
  id: string;
  initials: string;
  name: string;
  badge: string;
  experience: string;
  timeAgo: string;
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function mapEditorApplicationRow(row: unknown): EditorApplicationRow {
  const r = row as {
    id: string;
    createdAt?: string;
    User?: { username?: string; full_name?: string; UserProfile?: { bio?: string } };
    user?: { username?: string; full_name?: string; userProfile?: { bio?: string } };
  };
  const u = r.User ?? r.user;
  const name = u?.full_name || u?.username || "Unknown";
  const bio =
    (u as { UserProfile?: { bio?: string } } | undefined)?.UserProfile?.bio ||
    (u as { userProfile?: { bio?: string } } | undefined)?.userProfile?.bio ||
    "";
  return {
    id: r.id,
    initials: name.charAt(0).toUpperCase(),
    name,
    badge: "Editor",
    experience: bio.slice(0, 60),
    timeAgo: r.createdAt ? relativeTime(r.createdAt) : "",
  };
}

function asArray(body: unknown): unknown[] {
  if (Array.isArray(body)) return body;
  if (body && typeof body === "object") {
    const b = body as { data?: unknown; items?: unknown };
    if (Array.isArray(b.data)) return b.data;
    if (Array.isArray(b.items)) return b.items;
  }
  return [];
}

export async function getDashboardEditorApplications(limit = 5): Promise<EditorApplicationRow[]> {
  const res = await api.get("/dashboard/editor-applications", { params: { limit } });
  return asArray(unwrap<unknown>(res.data)).map(mapEditorApplicationRow);
}

export async function approveEditorApplication(id: string): Promise<void> {
  await api.post(`/dashboard/applications/${id}/approve`);
}

export async function rejectEditorApplication(id: string): Promise<void> {
  await api.post(`/dashboard/applications/${id}/reject`);
}

// ──────────────────────────────────────────────────────────────
// Full Editor Applications (Roles page — includes email + date)
// ──────────────────────────────────────────────────────────────

export interface FullEditorApplication {
  id: string;
  name: string;
  email: string;
  appliedAt: string;
  yearsInPublishing: number;
  publishedArticles: number;
  status: "pending" | "approved" | "rejected";
}

function formatAppliedDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function mapFullEditorApplication(row: unknown): FullEditorApplication {
  const r = row as {
    id: string;
    createdAt?: string;
    User?: { username?: string; full_name?: string; email?: string };
    user?: { username?: string; full_name?: string; email?: string };
  };
  const u = r.User ?? r.user;
  return {
    id: r.id,
    name: u?.full_name || u?.username || "Unknown",
    email: u?.email ?? "",
    appliedAt: r.createdAt ? formatAppliedDate(r.createdAt) : "—",
    yearsInPublishing: 0,
    publishedArticles: 0,
    status: "pending",
  };
}

export async function getEditorApplicationsFull(limit = 50): Promise<FullEditorApplication[]> {
  const res = await api.get("/dashboard/editor-applications", { params: { limit } });
  return asArray(unwrap<unknown>(res.data)).map(mapFullEditorApplication);
}

// ──────────────────────────────────────────────────────────────
// Content Overview
// ──────────────────────────────────────────────────────────────

export interface ContentCategory {
  id: string;
  label: string;
  published: number;
  drafts: number;
  flagged: number;
}

export async function getDashboardContentOverview(): Promise<{ categories: ContentCategory[]; total: number }> {
  const res = await api.get("/dashboard/content-overview");
  const body = unwrap<{ categories: unknown[]; totalContentPieces: number }>(res.data);
  return {
    categories: (body.categories ?? []).map((c) => {
      const cat = c as { category: string; typeId: string; published: number; drafts: number; flagged: number };
      return { id: cat.typeId, label: cat.category, published: cat.published, drafts: cat.drafts, flagged: cat.flagged };
    }),
    total: body.totalContentPieces ?? 0,
  };
}

// ──────────────────────────────────────────────────────────────
// Users by Role
// ──────────────────────────────────────────────────────────────

export interface RoleRow {
  id: string;
  label: string;
  count: number;
  percentage: number;
  change: number;
}

export async function getDashboardUsersByRole(): Promise<{ roles: RoleRow[]; totalUsers: number }> {
  const res = await api.get("/dashboard/users-by-role");
  const body = unwrap<{ roles: unknown[]; totalUsers: number }>(res.data);
  const total = body.totalUsers ?? 0;
  return {
    roles: (body.roles ?? []).map((r) => {
      const role = r as { role: string; roleId: string; count: number; change: number };
      return {
        id: role.roleId,
        label: role.role,
        count: role.count,
        percentage: total > 0 ? Math.round((role.count / total) * 100) : 0,
        change: role.change,
      };
    }),
    totalUsers: total,
  };
}

// ──────────────────────────────────────────────────────────────
// Finance Snapshot
// ──────────────────────────────────────────────────────────────

export interface FinanceSnapshot {
  todayDonations: { value: number; transactions: number };
  monthlyRevenue: { value: number; change: number };
  pendingPayouts: { value: number; count: number };
  platformFees: { value: number; rate: string };
}

export async function getDashboardFinanceSnapshot(): Promise<FinanceSnapshot> {
  const res = await api.get("/dashboard/finance/snapshot");
  const body = unwrap<{
    todayDonations?: { value: number; transactions: number; change: null };
    monthlyRevenue?: { value: number; change: number; previousValue: number };
    pendingPayouts?: { value: number; count: number };
    platformFees?: { value: number; rate: string };
  }>(res.data);
  return {
    todayDonations: { value: body.todayDonations?.value ?? 0, transactions: body.todayDonations?.transactions ?? 0 },
    monthlyRevenue: { value: body.monthlyRevenue?.value ?? 0, change: body.monthlyRevenue?.change ?? 0 },
    pendingPayouts: { value: body.pendingPayouts?.value ?? 0, count: body.pendingPayouts?.count ?? 0 },
    platformFees: { value: body.platformFees?.value ?? 0, rate: body.platformFees?.rate ?? "10%" },
  };
}

// ──────────────────────────────────────────────────────────────
// Recent Activity
// ──────────────────────────────────────────────────────────────

export interface ActivityEntry {
  id: string;
  type: string;
  action: string;
  entityType: string;
  user: { id: string; name: string } | null;
  timestamp: string;
  details: Record<string, unknown> | null;
}

export async function getDashboardRecentActivity(limit = 10): Promise<ActivityEntry[]> {
  const res = await api.get("/dashboard/recent-activity", { params: { limit } });
  const body = unwrap<{ activities?: ActivityEntry[] }>(res.data);
  return body.activities ?? [];
}

// ──────────────────────────────────────────────────────────────
// Moderation — Reports, Audit log, Stats (admin Reports page)
// Backed by GET /dashboard/moderation/{reports,audit-log,stats}.
// View shapes mirror the ones the Reports page already renders.
// ──────────────────────────────────────────────────────────────

export interface ModerationStats {
  pendingReports: number;
  contentFlagged: number;
  usersReported: number;
  resolvedToday: number;
}

export interface ModerationReportRow {
  id: string;
  title: string;
  timeAgo: string;
  reporter: string;
  /** Display key for the type chip. */
  typeLabel: "Comment" | "Content";
  /** Pending = flagged/unresolved; Under review = escalated/resolved. */
  status: "Pending" | "Under review";
}

export interface ModerationAuditRow {
  id: string;
  title: string;
  /** e.g. "by Super Admin · Flagged Article" */
  meta: string;
  timeAgo: string;
}

export type ModerationReportFilter = {
  /** Backend ModerationLog.action filter. */
  status?: "flagged" | "approved" | "rejected";
  search?: string;
  page?: number;
  limit?: number;
};

function personName(u: unknown): string {
  if (!u || typeof u !== "object") return "Unknown";
  const o = u as { full_name?: string; username?: string };
  return o.full_name || o.username || "Unknown";
}

function mapModerationReportRow(row: unknown): ModerationReportRow {
  const r = row as {
    id: string;
    action?: string;
    status?: string;
    created_at?: string;
    contribution?: { title?: string; user?: unknown };
    reviewer?: unknown;
  };
  const reporter = r.reviewer ? personName(r.reviewer) : personName(r.contribution?.user);
  return {
    id: r.id,
    title: r.contribution?.title || "Untitled content",
    timeAgo: r.created_at ? relativeTime(r.created_at) : "",
    reporter,
    typeLabel: "Content",
    status: r.status === "pending" || r.action === "flagged" ? "Pending" : "Under review",
  };
}

export async function getModerationReports(
  filters: ModerationReportFilter = {},
): Promise<{ reports: ModerationReportRow[]; total: number }> {
  const params: Record<string, string | number> = {};
  if (filters.status) params.status = filters.status;
  if (filters.search?.trim()) params.search = filters.search.trim();
  params.page = filters.page ?? 1;
  params.limit = filters.limit ?? 20;
  const res = await api.get("/dashboard/moderation/reports", { params });
  const body = unwrap<{ data?: unknown[]; total?: number }>(res.data);
  return {
    reports: asArray(body).map(mapModerationReportRow),
    total: typeof body.total === "number" ? body.total : 0,
  };
}

function mapModerationAuditRow(row: unknown): ModerationAuditRow {
  const r = row as {
    id: string;
    action?: string;
    entity_type?: string;
    timestamp?: string;
    user?: unknown;
  };
  const who = personName(r.user);
  const entity = r.entity_type ? ` · ${r.entity_type}` : "";
  return {
    id: r.id,
    title: r.action || "Action",
    meta: `by ${who}${entity}`,
    timeAgo: r.timestamp ? relativeTime(r.timestamp) : "",
  };
}

export async function getModerationAuditLog(
  page = 1,
  limit = 20,
): Promise<{ entries: ModerationAuditRow[]; total: number }> {
  const res = await api.get("/dashboard/moderation/audit-log", { params: { page, limit } });
  const body = unwrap<{ data?: unknown[]; total?: number }>(res.data);
  return {
    entries: asArray(body).map(mapModerationAuditRow),
    total: typeof body.total === "number" ? body.total : 0,
  };
}

export async function getModerationStats(): Promise<ModerationStats> {
  const res = await api.get("/dashboard/moderation/stats");
  const body = unwrap<Partial<ModerationStats>>(res.data);
  return {
    pendingReports: body.pendingReports ?? 0,
    contentFlagged: body.contentFlagged ?? 0,
    usersReported: body.usersReported ?? 0,
    resolvedToday: body.resolvedToday ?? 0,
  };
}

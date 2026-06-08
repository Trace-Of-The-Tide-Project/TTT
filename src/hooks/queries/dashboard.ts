import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  dismissDashboardAlert,
  getDashboardAlerts,
  getDashboardContentOverview,
  getDashboardEditorApplications,
  getDashboardFinanceSnapshot,
  getDashboardRecentActivity,
  getDashboardStats,
  getDashboardUsersByRole,
  getEditorApplicationsFull,
  getModerationAuditLog,
  getModerationReports,
  getModerationStats,
  type DismissableAlertType,
  type ModerationReportFilter,
} from "@/services/dashboard.service";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  stats: (period?: string) => ["dashboard", "stats", period ?? "default"] as const,
  alerts: () => ["dashboard", "alerts"] as const,
  editorApplications: (limit: number) => ["dashboard", "editor-applications", limit] as const,
  editorApplicationsFull: (limit: number) =>
    ["dashboard", "editor-applications-full", limit] as const,
  contentOverview: () => ["dashboard", "content-overview"] as const,
  usersByRole: () => ["dashboard", "users-by-role"] as const,
  financeSnapshot: () => ["dashboard", "finance-snapshot"] as const,
  recentActivity: (limit: number) => ["dashboard", "recent-activity", limit] as const,
  moderationReports: (filters?: ModerationReportFilter) =>
    ["dashboard", "moderation-reports", filters ?? {}] as const,
  moderationAuditLog: (page: number, limit: number) =>
    ["dashboard", "moderation-audit-log", page, limit] as const,
  moderationStats: () => ["dashboard", "moderation-stats"] as const,
};

export function useDashboardStats(period?: string) {
  return useQuery({
    queryKey: dashboardKeys.stats(period),
    queryFn: () => getDashboardStats(period),
  });
}

export function useDashboardAlerts() {
  return useQuery({
    queryKey: dashboardKeys.alerts(),
    queryFn: getDashboardAlerts,
  });
}

export function useDashboardEditorApplications(limit = 5) {
  return useQuery({
    queryKey: dashboardKeys.editorApplications(limit),
    queryFn: () => getDashboardEditorApplications(limit),
  });
}

export function useEditorApplicationsFull(limit = 50) {
  return useQuery({
    queryKey: dashboardKeys.editorApplicationsFull(limit),
    queryFn: () => getEditorApplicationsFull(limit),
  });
}

export function useDashboardContentOverview() {
  return useQuery({
    queryKey: dashboardKeys.contentOverview(),
    queryFn: getDashboardContentOverview,
  });
}

export function useDashboardUsersByRole() {
  return useQuery({
    queryKey: dashboardKeys.usersByRole(),
    queryFn: getDashboardUsersByRole,
  });
}

export function useDashboardFinanceSnapshot() {
  return useQuery({
    queryKey: dashboardKeys.financeSnapshot(),
    queryFn: getDashboardFinanceSnapshot,
  });
}

export function useDashboardRecentActivity(limit = 10) {
  return useQuery({
    queryKey: dashboardKeys.recentActivity(limit),
    queryFn: () => getDashboardRecentActivity(limit),
  });
}

/**
 * Dismiss a dashboard alert for the current admin (persisted server-side).
 * On success the alerts query is invalidated so the card disappears and stays
 * gone across refreshes until its underlying count rises again.
 */
export function useDismissDashboardAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (type: DismissableAlertType) => dismissDashboardAlert(type),
    onSuccess: () => qc.invalidateQueries({ queryKey: dashboardKeys.alerts() }),
  });
}

export function useModerationReports(filters?: ModerationReportFilter) {
  return useQuery({
    queryKey: dashboardKeys.moderationReports(filters),
    queryFn: () => getModerationReports(filters ?? {}),
  });
}

export function useModerationAuditLog(page = 1, limit = 20) {
  return useQuery({
    queryKey: dashboardKeys.moderationAuditLog(page, limit),
    queryFn: () => getModerationAuditLog(page, limit),
  });
}

export function useModerationStats() {
  return useQuery({
    queryKey: dashboardKeys.moderationStats(),
    queryFn: getModerationStats,
  });
}

import { useQuery } from "@tanstack/react-query";
import {
  getDashboardAlerts,
  getDashboardContentOverview,
  getDashboardEditorApplications,
  getDashboardFinanceSnapshot,
  getDashboardRecentActivity,
  getDashboardStats,
  getDashboardUsersByRole,
  getEditorApplicationsFull,
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

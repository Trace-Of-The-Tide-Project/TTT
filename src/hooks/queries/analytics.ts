import { useQuery } from "@tanstack/react-query";
import {
  getAnalyticsContentPerformance,
  getAnalyticsOverview,
} from "@/services/analytics.service";

export const analyticsKeys = {
  all: ["analytics"] as const,
  overview: (period?: string) => ["analytics", "overview", period ?? "30d"] as const,
  contentPerformance: (period?: string) =>
    ["analytics", "content-performance", period ?? "30d"] as const,
};

export function useAnalyticsOverview(period = "30d") {
  return useQuery({
    queryKey: analyticsKeys.overview(period),
    queryFn: () => getAnalyticsOverview(period),
  });
}

export function useAnalyticsContentPerformance(period = "30d") {
  return useQuery({
    queryKey: analyticsKeys.contentPerformance(period),
    queryFn: () => getAnalyticsContentPerformance(period),
  });
}

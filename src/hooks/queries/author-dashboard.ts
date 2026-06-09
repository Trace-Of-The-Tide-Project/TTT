import { useQuery } from "@tanstack/react-query";
import { getAuthorDashboard } from "@/services/author-dashboard.service";

export const authorDashboardKeys = {
  all: ["author-dashboard"] as const,
  detail: () => ["author-dashboard", "detail"] as const,
};

export function useAuthorDashboard() {
  return useQuery({
    queryKey: authorDashboardKeys.detail(),
    queryFn: getAuthorDashboard,
  });
}

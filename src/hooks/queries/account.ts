import { useQuery } from "@tanstack/react-query";
import { getAccountOverview, getSessions } from "@/services/account.service";

export const accountKeys = {
  all: ["account"] as const,
  overview: () => ["account", "overview"] as const,
  sessions: () => ["account", "sessions"] as const,
};

export function useAccountOverview() {
  return useQuery({
    queryKey: accountKeys.overview(),
    queryFn: getAccountOverview,
  });
}

export function useAccountSessions() {
  return useQuery({
    queryKey: accountKeys.sessions(),
    queryFn: getSessions,
  });
}

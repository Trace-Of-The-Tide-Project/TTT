import { useQuery } from "@tanstack/react-query";
import {
  getSessionsAdmin,
  getSession,
  getSessionStats,
  getSessionTickets,
  type GetSessionsParams,
} from "@/services/sessions.service";

export const sessionsKeys = {
  all: ["sessions"] as const,
  adminList: (params?: GetSessionsParams) => ["sessions", "adminList", params ?? {}] as const,
  byId: (id: string) => ["sessions", "byId", id] as const,
  stats: (id: string) => ["sessions", "stats", id] as const,
  tickets: (id: string) => ["sessions", "tickets", id] as const,
};

export function useSessionsAdmin(params?: GetSessionsParams) {
  return useQuery({
    queryKey: sessionsKeys.adminList(params),
    queryFn: () => getSessionsAdmin(params),
    placeholderData: (prev) => prev,
  });
}

export function useSession(sessionId: string | null | undefined) {
  return useQuery({
    queryKey: sessionsKeys.byId(sessionId ?? ""),
    queryFn: () => getSession(sessionId as string),
    enabled: Boolean(sessionId),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });
}

export function useSessionStats(sessionId: string | null | undefined) {
  return useQuery({
    queryKey: sessionsKeys.stats(sessionId ?? ""),
    queryFn: () => getSessionStats(sessionId as string),
    enabled: Boolean(sessionId),
  });
}

export function useSessionTickets(sessionId: string | null | undefined) {
  return useQuery({
    queryKey: sessionsKeys.tickets(sessionId ?? ""),
    queryFn: () => getSessionTickets(sessionId as string),
    enabled: Boolean(sessionId),
  });
}

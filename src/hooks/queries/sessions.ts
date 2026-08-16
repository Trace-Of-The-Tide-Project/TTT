import { useQuery } from "@tanstack/react-query";
import {
  getSession,
  listDraftComments,
  listMyCertificates,
  listMyTickets,
  listSessionDrafts,
  listSessions,
} from "@/services/sessions.service";

export const sessionsKeys = {
  all: ["sessions"] as const,
  list: (params?: Record<string, unknown>) =>
    ["sessions", "list", params ?? {}] as const,
  byId: (id: string) => ["sessions", "byId", id] as const,
  drafts: (sessionId: string) => ["sessions", "drafts", sessionId] as const,
  comments: (draftId: string) => ["sessions", "comments", draftId] as const,
  myTickets: () => ["sessions", "tickets", "mine"] as const,
  myCertificates: () => ["sessions", "certificates", "mine"] as const,
};

export function useSessions(params?: {
  space?: "writing_room" | "waqamh";
  status?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: sessionsKeys.list(params),
    queryFn: () => listSessions(params),
  });
}

export function useSession(id: string | null | undefined) {
  return useQuery({
    queryKey: sessionsKeys.byId(id ?? ""),
    queryFn: () => getSession(id as string),
    enabled: Boolean(id),
  });
}

export function useSessionDrafts(sessionId: string | null | undefined) {
  return useQuery({
    queryKey: sessionsKeys.drafts(sessionId ?? ""),
    queryFn: () => listSessionDrafts(sessionId as string),
    enabled: Boolean(sessionId),
  });
}

export function useDraftComments(
  sessionId: string | null | undefined,
  draftId: string | null | undefined,
) {
  return useQuery({
    queryKey: sessionsKeys.comments(draftId ?? ""),
    queryFn: () => listDraftComments(sessionId as string, draftId as string),
    enabled: Boolean(sessionId) && Boolean(draftId),
  });
}

export function useMyTickets() {
  return useQuery({
    queryKey: sessionsKeys.myTickets(),
    queryFn: () => listMyTickets(),
  });
}

export function useMyCertificates() {
  return useQuery({
    queryKey: sessionsKeys.myCertificates(),
    queryFn: () => listMyCertificates(),
  });
}

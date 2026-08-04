import { useQuery } from "@tanstack/react-query";
import { getThread, getUnreadTotal, listMessages, listThreads, searchUsers } from "@/services/dm.service";

export const dmKeys = {
  all: ["dm"] as const,
  threads: () => ["dm", "threads"] as const,
  thread: (threadId: string) => ["dm", "threads", threadId] as const,
  messages: (threadId: string) => ["dm", "threads", threadId, "messages"] as const,
  unreadTotal: () => ["dm", "unread-total"] as const,
  userSearch: (q: string) => ["dm", "user-search", q] as const,
};

export function useDmThreads() {
  return useQuery({
    queryKey: dmKeys.threads(),
    queryFn: () => listThreads(),
  });
}

export function useDmThread(threadId: string | null | undefined) {
  return useQuery({
    queryKey: dmKeys.thread(threadId ?? ""),
    queryFn: () => getThread(threadId as string),
    enabled: Boolean(threadId),
  });
}

export function useDmMessages(threadId: string | null | undefined) {
  return useQuery({
    queryKey: dmKeys.messages(threadId ?? ""),
    queryFn: () => listMessages(threadId as string),
    enabled: Boolean(threadId),
    refetchOnWindowFocus: false,
  });
}

export function useDmUnreadTotal() {
  return useQuery({
    queryKey: dmKeys.unreadTotal(),
    queryFn: getUnreadTotal,
    refetchInterval: 60_000,
  });
}

export function useDmUserSearch(q: string) {
  return useQuery({
    queryKey: dmKeys.userSearch(q),
    queryFn: () => searchUsers(q),
    enabled: q.trim().length >= 2,
  });
}

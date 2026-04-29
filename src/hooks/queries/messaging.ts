import { useQuery } from "@tanstack/react-query";
import {
  fetchTemplates,
  getMessagingSummary,
  listConversations,
  loadConversationMessages,
} from "@/services/messaging.service";

export const messagingKeys = {
  all: ["messaging"] as const,
  summary: () => ["messaging", "summary"] as const,
  conversations: (status?: "inbox" | "archived", limit = 30) =>
    ["messaging", "conversations", status ?? "all", limit] as const,
  messages: (conversationId: string, currentUserId?: string | null) =>
    ["messaging", "messages", conversationId, currentUserId ?? null] as const,
  templates: () => ["messaging", "templates"] as const,
};

export function useMessagingSummary() {
  return useQuery({
    queryKey: messagingKeys.summary(),
    queryFn: getMessagingSummary,
  });
}

export function useConversations(status?: "inbox" | "archived", limit = 30) {
  return useQuery({
    queryKey: messagingKeys.conversations(status, limit),
    queryFn: () => listConversations(status, limit),
  });
}

export function useConversationMessages(
  conversationId: string | null | undefined,
  currentUserId?: string | null,
) {
  return useQuery({
    queryKey: messagingKeys.messages(conversationId ?? "", currentUserId),
    queryFn: () => loadConversationMessages(conversationId as string, currentUserId),
    enabled: Boolean(conversationId),
  });
}

export function useMessageTemplates() {
  return useQuery({
    queryKey: messagingKeys.templates(),
    queryFn: fetchTemplates,
  });
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  archiveConversation,
  createApiTemplate,
  deleteApiTemplate,
  sendBroadcastMessage,
  sendReply,
  updateApiTemplate,
  type ApiTemplate,
} from "@/services/messaging.service";
import { messagingKeys } from "@/hooks/queries/messaging";

export function useSendReply() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { conversationId: string; content: string; templateId?: string }) =>
      sendReply(args.conversationId, args.content, args.templateId),
    onSuccess: (_d, args) => {
      qc.invalidateQueries({ queryKey: ["messaging", "messages", args.conversationId] });
      qc.invalidateQueries({ queryKey: messagingKeys.summary() });
    },
  });
}

export function useArchiveConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => archiveConversation(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: messagingKeys.all }),
  });
}

export function useCreateMessageTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<ApiTemplate, "id">) => createApiTemplate(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: messagingKeys.templates() }),
  });
}

export function useUpdateMessageTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: string; data: Partial<Omit<ApiTemplate, "id">> }) =>
      updateApiTemplate(args.id, args.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: messagingKeys.templates() }),
  });
}

export function useDeleteMessageTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteApiTemplate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: messagingKeys.templates() }),
  });
}

export function useSendBroadcast() {
  return useMutation({
    mutationFn: (data: Parameters<typeof sendBroadcastMessage>[0]) =>
      sendBroadcastMessage(data),
  });
}

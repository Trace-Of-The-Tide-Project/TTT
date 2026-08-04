import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markThreadRead, sendMessage, startThread } from "@/services/dm.service";
import { dmKeys } from "@/hooks/queries/dm";

export function useStartDmThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (recipientId: string) => startThread(recipientId),
    onSuccess: () => qc.invalidateQueries({ queryKey: dmKeys.threads() }),
  });
}

export function useSendDmMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { threadId: string; content: string }) =>
      sendMessage(args.threadId, args.content),
    onSuccess: (_d, args) => {
      qc.invalidateQueries({ queryKey: dmKeys.messages(args.threadId) });
      qc.invalidateQueries({ queryKey: dmKeys.threads() });
    },
  });
}

export function useMarkDmThreadRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (threadId: string) => markThreadRead(threadId),
    onSuccess: (_d, threadId) => {
      qc.invalidateQueries({ queryKey: dmKeys.threads() });
      qc.invalidateQueries({ queryKey: dmKeys.unreadTotal() });
      qc.invalidateQueries({ queryKey: dmKeys.messages(threadId) });
    },
  });
}

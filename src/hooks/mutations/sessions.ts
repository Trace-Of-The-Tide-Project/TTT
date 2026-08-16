import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { mutationToast } from "@/hooks/useMutationToast";
import {
  cancelTicket,
  createDraftComment,
  createSessionDraft,
  registerForSession,
} from "@/services/sessions.service";
import { sessionsKeys } from "@/hooks/queries/sessions";

export function useRegisterSession(sessionId: string) {
  const qc = useQueryClient();
  const t = useTranslations("WritingRoomSessions");
  return useMutation({
    mutationFn: (opts?: { awna?: boolean }) =>
      mutationToast(() => registerForSession(sessionId, opts), {
        loading: t("registering"),
        success: t("registered"),
        error: t("registerFailed"),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sessionsKeys.byId(sessionId) });
      qc.invalidateQueries({ queryKey: sessionsKeys.myTickets() });
    },
  });
}

export function useCancelTicket() {
  const qc = useQueryClient();
  const t = useTranslations("WritingRoomSessions");
  return useMutation({
    mutationFn: (ticketId: string) =>
      mutationToast(() => cancelTicket(ticketId), {
        loading: t("cancelling"),
        success: t("cancelled"),
        error: t("cancelFailed"),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sessionsKeys.myTickets() });
    },
  });
}

export function useCreateDraft(sessionId: string) {
  const qc = useQueryClient();
  const t = useTranslations("WritingRoomSessions");
  return useMutation({
    mutationFn: (payload: { title: string; file_path: string }) =>
      mutationToast(() => createSessionDraft(sessionId, payload), {
        loading: t("uploadingDraft"),
        success: t("draftUploaded"),
        error: t("draftUploadFailed"),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sessionsKeys.drafts(sessionId) });
    },
  });
}

export function useCreateComment(sessionId: string, draftId: string) {
  const qc = useQueryClient();
  const t = useTranslations("WritingRoomSessions");
  return useMutation({
    mutationFn: (payload: { body: string; parent_comment_id?: string }) =>
      mutationToast(
        () => createDraftComment(sessionId, draftId, payload),
        {
          loading: t("postingComment"),
          success: t("commentPosted"),
          error: t("commentFailed"),
        },
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sessionsKeys.comments(draftId) });
    },
  });
}

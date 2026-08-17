import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { mutationToast } from "@/hooks/useMutationToast";
import {
  cancelTicket,
  createDraftComment,
  createSessionDraft,
  registerForSession,
  giftTicket,
  claimTicketInvite,
  linkSessionContribution,
  unlinkSessionContribution,
  createSession,
  updateSession,
  deleteSession,
  markTicketAttended,
  type SessionPayload,
} from "@/services/sessions.service";
import { sessionsKeys } from "@/hooks/queries/sessions";

export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SessionPayload) => createSession(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sessionsKeys.all });
    },
  });
}

export function useUpdateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, payload }: { sessionId: string; payload: Partial<SessionPayload> }) =>
      updateSession(sessionId, payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: sessionsKeys.byId(variables.sessionId) });
      qc.invalidateQueries({ queryKey: sessionsKeys.all });
    },
  });
}

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

export function useDeleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => deleteSession(sessionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sessionsKeys.all });
    },
  });
}

export function useMarkTicketAttended() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId }: { ticketId: string; sessionId: string }) =>
      markTicketAttended(ticketId),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: sessionsKeys.tickets(variables.sessionId) });
      qc.invalidateQueries({ queryKey: sessionsKeys.stats(variables.sessionId) });
    },
  });
}

export function useGiftTicket(sessionId: string) {
  const qc = useQueryClient();
  const t = useTranslations("Waqamh");
  return useMutation({
    mutationFn: (recipient_email: string) =>
      mutationToast(() => giftTicket(sessionId, recipient_email), {
        loading: t("gifting"),
        success: t("gifted"),
        error: t("giftFailed"),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sessionsKeys.byId(sessionId) });
    },
  });
}

export function useClaimInvite() {
  const t = useTranslations("Waqamh");
  return useMutation({
    mutationFn: (token: string) =>
      mutationToast(() => claimTicketInvite(token), {
        loading: t("claiming"),
        success: t("claimed"),
        error: t("claimFailed"),
      }),
  });
}

export function useLinkContribution(sessionId: string) {
  const qc = useQueryClient();
  const t = useTranslations("Waqamh");
  return useMutation({
    mutationFn: (articleId: string) =>
      mutationToast(() => linkSessionContribution(sessionId, articleId), {
        loading: t("linkingContribution"),
        success: t("contributionLinked"),
        error: t("linkContributionFailed"),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sessionsKeys.contributions(sessionId) });
    },
  });
}

export function useUnlinkContribution(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (articleId: string) => unlinkSessionContribution(sessionId, articleId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sessionsKeys.contributions(sessionId) });
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

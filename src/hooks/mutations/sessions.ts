import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
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
    onSuccess: () => qc.invalidateQueries({ queryKey: sessionsKeys.all }),
    meta: { silent: true },
  });
}

export function useUpdateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { sessionId: string; payload: Partial<SessionPayload> }) =>
      updateSession(args.sessionId, args.payload),
    onSuccess: (_d, args) => {
      qc.invalidateQueries({ queryKey: sessionsKeys.byId(args.sessionId) });
      qc.invalidateQueries({ queryKey: sessionsKeys.all });
    },
    meta: { silent: true },
  });
}

export function useDeleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => deleteSession(sessionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: sessionsKeys.all }),
    meta: { silent: true },
  });
}

export function useMarkTicketAttended() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { ticketId: string; sessionId: string }) =>
      markTicketAttended(args.ticketId),
    onSuccess: (_d, args) => {
      qc.invalidateQueries({ queryKey: sessionsKeys.tickets(args.sessionId) });
      qc.invalidateQueries({ queryKey: sessionsKeys.stats(args.sessionId) });
    },
    meta: { silent: true },
  });
}

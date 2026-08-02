import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  createWriterProfile,
  updateWriterProfile,
  setWriterEditorialBoard,
  setWriterFeatured,
  linkWriterAccount,
  deleteWriterProfile,
  sendWriterSupport,
  sendWriterCollaboration,
  type WriterProfilePayload,
  type SupportPayload,
  type CollaboratePayload,
} from "@/services/writers.service";
import { writersKeys } from "@/hooks/queries/writers";
import { mutationToast } from "@/hooks/useMutationToast";

export function useCreateWriterProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: WriterProfilePayload) =>
      createWriterProfile(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: writersKeys.all }),
    meta: { silent: true },
  });
}

export function useUpdateWriterProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      writerId: string;
      payload: Partial<WriterProfilePayload>;
    }) => updateWriterProfile(args.writerId, args.payload),
    onSuccess: (_d, args) => {
      qc.invalidateQueries({ queryKey: writersKeys.byId(args.writerId) });
      qc.invalidateQueries({ queryKey: writersKeys.all });
    },
    meta: { silent: true },
  });
}

export function useSetWriterEditorialBoard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { writerId: string; value: boolean }) =>
      setWriterEditorialBoard(args.writerId, args.value),
    onSuccess: () => qc.invalidateQueries({ queryKey: writersKeys.all }),
    meta: { silent: true },
  });
}

export function useSetWriterFeatured() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { writerId: string; value: boolean }) =>
      setWriterFeatured(args.writerId, args.value),
    onSuccess: () => qc.invalidateQueries({ queryKey: writersKeys.all }),
    meta: { silent: true },
  });
}

export function useLinkWriterAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { writerId: string; userId: string }) =>
      linkWriterAccount(args.writerId, args.userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: writersKeys.all }),
    meta: { silent: true },
  });
}

export function useDeleteWriterProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (writerId: string) => deleteWriterProfile(writerId),
    onSuccess: () => qc.invalidateQueries({ queryKey: writersKeys.all }),
    meta: { silent: true },
  });
}

export function useSendSupport(writerId: string) {
  const qc = useQueryClient();
  const t = useTranslations("Writers.support");
  return useMutation({
    mutationFn: (payload: SupportPayload) =>
      mutationToast(() => sendWriterSupport(writerId, payload), {
        loading: t("sending"),
        success: t("sent"),
        error: t("sendFailed"),
      }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: writersKeys.supportSummary(writerId) }),
  });
}

export function useSendCollaboration(writerId: string) {
  const t = useTranslations("Writers.connect");
  return useMutation({
    mutationFn: (payload: CollaboratePayload) =>
      mutationToast(() => sendWriterCollaboration(writerId, payload), {
        loading: t("sending"),
        success: t("sent"),
        error: t("sendFailed"),
      }),
  });
}

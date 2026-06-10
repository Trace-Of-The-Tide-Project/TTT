import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createWriterProfile,
  updateWriterProfile,
  deleteWriterProfile,
  type WriterProfilePayload,
} from "@/services/writers.service";
import { writersKeys } from "@/hooks/queries/writers";

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

export function useDeleteWriterProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (writerId: string) => deleteWriterProfile(writerId),
    onSuccess: () => qc.invalidateQueries({ queryKey: writersKeys.all }),
    meta: { silent: true },
  });
}

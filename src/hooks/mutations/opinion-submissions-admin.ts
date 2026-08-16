import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateOpinionSubmission,
  type OpinionSubmissionStatus,
} from "@/services/opinion-submissions-admin.service";
import { opinionSubmissionsAdminKeys } from "@/hooks/queries/opinion-submissions-admin";

export function useUpdateOpinionSubmissionStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: string; status: OpinionSubmissionStatus }) =>
      updateOpinionSubmission(args.id, { status: args.status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: opinionSubmissionsAdminKeys.all }),
  });
}

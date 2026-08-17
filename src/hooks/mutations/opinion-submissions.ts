import { useMutation } from "@tanstack/react-query";
import {
  submitOpinionPiece,
  type CreateOpinionSubmissionPayload,
} from "@/services/opinion-submissions.service";

export function useSubmitOpinionPiece() {
  return useMutation({
    mutationFn: (payload: CreateOpinionSubmissionPayload) =>
      submitOpinionPiece(payload),
  });
}

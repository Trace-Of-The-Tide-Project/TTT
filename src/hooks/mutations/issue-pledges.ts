import { useMutation } from "@tanstack/react-query";
import {
  createIssuePledge,
  type CreatePledgePayload,
} from "@/services/issue-pledges.service";

export function useCreateIssuePledge() {
  return useMutation({
    mutationFn: (payload: CreatePledgePayload) => createIssuePledge(payload),
  });
}

import { useQuery } from "@tanstack/react-query";
import {
  listOpinionSubmissions,
  type OpinionSubmissionStatus,
} from "@/services/opinion-submissions-admin.service";

export const opinionSubmissionsAdminKeys = {
  all: ["opinion-submissions-admin"] as const,
  list: (status?: OpinionSubmissionStatus) =>
    ["opinion-submissions-admin", "list", status] as const,
};

export function useOpinionSubmissionsAdmin(status: OpinionSubmissionStatus = "new") {
  return useQuery({
    queryKey: opinionSubmissionsAdminKeys.list(status),
    queryFn: () => listOpinionSubmissions({ status }),
    refetchOnWindowFocus: false,
  });
}

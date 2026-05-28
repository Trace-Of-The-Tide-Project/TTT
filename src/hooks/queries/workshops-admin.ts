import { useQuery } from "@tanstack/react-query";
import { listAllWorkshopApplications } from "@/services/workshops.service";

export const workshopsAdminKeys = {
  all: ["workshops-admin"] as const,
  applications: () => ["workshops-admin", "applications"] as const,
};

export function useWorkshopApplications() {
  return useQuery({
    queryKey: workshopsAdminKeys.applications(),
    queryFn: listAllWorkshopApplications,
    placeholderData: (prev) => prev,
  });
}

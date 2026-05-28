import { useQuery } from "@tanstack/react-query";
import { getResidencyApplications } from "@/services/residency.service";

export const residencyKeys = {
  all: ["residency"] as const,
  applications: () => ["residency", "applications"] as const,
};

export function useResidencyApplications(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: residencyKeys.applications(),
    queryFn: getResidencyApplications,
    placeholderData: (prev) => prev,
    enabled: options?.enabled ?? true,
  });
}

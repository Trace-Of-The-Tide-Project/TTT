import { useQuery } from "@tanstack/react-query";
import { getAvailability } from "@/services/availability.service";

export const availabilityKeys = {
  all: ["availability"] as const,
  detail: () => ["availability", "detail"] as const,
};

export function useAvailability() {
  return useQuery({
    queryKey: availabilityKeys.detail(),
    queryFn: getAvailability,
  });
}

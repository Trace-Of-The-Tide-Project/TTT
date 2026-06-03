import { useQuery } from "@tanstack/react-query";
import { listAllEncounterBookings } from "@/services/encounters.service";

export const encountersAdminKeys = {
  all: ["encounters-admin"] as const,
  bookings: () => ["encounters-admin", "bookings"] as const,
};

export function useEncounterBookings() {
  return useQuery({
    queryKey: encountersAdminKeys.bookings(),
    queryFn: listAllEncounterBookings,
    placeholderData: (prev) => prev,
  });
}

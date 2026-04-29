import { useQuery } from "@tanstack/react-query";
import { getTripById, getTrips } from "@/services/trips.service";

export const tripsKeys = {
  all: ["trips"] as const,
  list: () => ["trips", "list"] as const,
  byId: (id: string) => ["trips", "byId", id] as const,
};

export function useTrips() {
  return useQuery({
    queryKey: tripsKeys.list(),
    queryFn: getTrips,
  });
}

export function useTrip(tripId: string | null | undefined) {
  return useQuery({
    queryKey: tripsKeys.byId(tripId ?? ""),
    queryFn: () => getTripById(tripId as string),
    enabled: Boolean(tripId),
  });
}

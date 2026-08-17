import { useQuery } from "@tanstack/react-query";
import {
  listAllEncounterBookings,
  listEncountersAdmin,
  getEncounterAdmin,
  type GetEncountersAdminParams,
} from "@/services/encounters.service";

export const encountersAdminKeys = {
  all: ["encounters-admin"] as const,
  list: (params?: GetEncountersAdminParams) =>
    [...encountersAdminKeys.all, "list", params] as const,
  byId: (id: string) => [...encountersAdminKeys.all, "byId", id] as const,
  bookings: () => [...encountersAdminKeys.all, "bookings"] as const,
};

export function useEncounterBookings() {
  return useQuery({
    queryKey: encountersAdminKeys.bookings(),
    queryFn: listAllEncounterBookings,
    placeholderData: (prev) => prev,
  });
}

export function useEncountersAdmin(params?: GetEncountersAdminParams) {
  return useQuery({
    queryKey: encountersAdminKeys.list(params),
    queryFn: () => listEncountersAdmin(params),
  });
}

export function useEncounterAdmin(id: string | null | undefined) {
  return useQuery({
    queryKey: encountersAdminKeys.byId(id ?? ""),
    queryFn: () => getEncounterAdmin(id as string),
    enabled: Boolean(id),
  });
}
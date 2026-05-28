import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateEncounterBookingStatus,
  type EncounterBookingStatus,
} from "@/services/encounters.service";
import { encountersAdminKeys } from "@/hooks/queries/encounters-admin";

export function useUpdateEncounterBookingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: string; status: EncounterBookingStatus }) =>
      updateEncounterBookingStatus(args.id, args.status),
    onSuccess: () => qc.invalidateQueries({ queryKey: encountersAdminKeys.all }),
  });
}

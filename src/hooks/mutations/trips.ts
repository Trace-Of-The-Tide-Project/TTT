import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createTrip,
  deleteTrip,
  type CreateTripPayload,
} from "@/services/trips.service";
import { tripsKeys } from "@/hooks/queries/trips";

export function useCreateTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTripPayload) => createTrip(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: tripsKeys.all }),
  });
}

export function useDeleteTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTrip(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: tripsKeys.all }),
  });
}

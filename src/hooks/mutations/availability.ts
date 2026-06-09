import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateAvailability,
  type UpdateAvailabilityInput,
} from "@/services/availability.service";
import { availabilityKeys } from "@/hooks/queries/availability";

export function useUpdateAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateAvailabilityInput) => updateAvailability(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: availabilityKeys.detail() }),
  });
}

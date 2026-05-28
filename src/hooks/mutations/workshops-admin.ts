import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateWorkshopApplicationStatus,
  type WorkshopApplicationStatus,
} from "@/services/workshops.service";
import { workshopsAdminKeys } from "@/hooks/queries/workshops-admin";

export function useUpdateWorkshopApplicationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: string; status: WorkshopApplicationStatus }) =>
      updateWorkshopApplicationStatus(args.id, args.status),
    onSuccess: () => qc.invalidateQueries({ queryKey: workshopsAdminKeys.all }),
  });
}

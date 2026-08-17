import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateEncounterBookingStatus,
  createEncounter,
  updateEncounter,
  deleteEncounter,
  addScheduleStop,
  updateScheduleStop,
  deleteScheduleStop,
  reorderSchedule,
  type EncounterBookingStatus,
  type EncounterInput,
  type EncounterScheduleInput,
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

export function useCreateEncounter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: EncounterInput) => createEncounter(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: encountersAdminKeys.all }),
  });
}

export function useUpdateEncounter(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<EncounterInput>) => updateEncounter(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: encountersAdminKeys.all }),
  });
}

export function useDeleteEncounter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEncounter(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: encountersAdminKeys.all }),
  });
}

export function useAddScheduleStop(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: EncounterScheduleInput) => addScheduleStop(id, payload),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: encountersAdminKeys.byId(id) }),
  });
}

export function useUpdateScheduleStop(id: string, stopId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<EncounterScheduleInput>) =>
      updateScheduleStop(id, stopId, payload),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: encountersAdminKeys.byId(id) }),
  });
}

export function useDeleteScheduleStop(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (stopId: string) => deleteScheduleStop(id, stopId),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: encountersAdminKeys.byId(id) }),
  });
}

export function useReorderSchedule(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (stopIds: string[]) => reorderSchedule(id, stopIds),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: encountersAdminKeys.byId(id) }),
  });
}
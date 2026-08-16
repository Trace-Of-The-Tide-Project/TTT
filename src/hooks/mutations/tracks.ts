import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createTrack,
  updateTrack,
  deleteTrack,
  setTrackItems,
  setTracksForEntity,
  type TrackInput,
  type SetTrackItemInput,
  type TrackEntityType,
} from "@/services/tracks.service";
import { tracksKeys } from "@/hooks/queries/tracks";

// Callers wrap mutateAsync in mutationToast, so errors are silent here.

export function useCreateTrack() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: TrackInput) => createTrack(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: tracksKeys.all }),
    meta: { silent: true },
  });
}

export function useUpdateTrack(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Omit<TrackInput, "language" | "translation_of">>) =>
      updateTrack(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: tracksKeys.all }),
    meta: { silent: true },
  });
}

export function useDeleteTrack() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTrack(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: tracksKeys.all }),
    meta: { silent: true },
  });
}

export function useSetTrackItems(trackId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items: SetTrackItemInput[]) => setTrackItems(trackId, items),
    onSuccess: () => qc.invalidateQueries({ queryKey: tracksKeys.items(trackId) }),
    meta: { silent: true },
  });
}

export function useSetTracksForEntity(entityType: TrackEntityType, entityId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (trackIds: string[]) => setTracksForEntity(entityType, entityId, trackIds),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: tracksKeys.forEntity(entityType, entityId) }),
    meta: { silent: true },
  });
}

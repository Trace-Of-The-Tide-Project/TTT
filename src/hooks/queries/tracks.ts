import { useQuery } from "@tanstack/react-query";
import {
  listTracksAdmin,
  getTrackByIdAdmin,
  getTrackItems,
  getTracksForEntity,
  type GetTracksParams,
  type TrackEntityType,
} from "@/services/tracks.service";

export const tracksKeys = {
  all: ["tracks"] as const,
  list: (params?: GetTracksParams) => [...tracksKeys.all, "list", params] as const,
  byId: (id: string) => [...tracksKeys.all, "byId", id] as const,
  items: (trackId: string) => [...tracksKeys.all, "items", trackId] as const,
  forEntity: (type: TrackEntityType, id: string) =>
    [...tracksKeys.all, "forEntity", type, id] as const,
};

export function useTracksAdmin(params?: GetTracksParams) {
  return useQuery({
    queryKey: tracksKeys.list(params),
    queryFn: () => listTracksAdmin(params),
  });
}

export function useTrackAdmin(id: string | null | undefined) {
  return useQuery({
    queryKey: tracksKeys.byId(id ?? ""),
    queryFn: () => getTrackByIdAdmin(id as string),
    enabled: Boolean(id),
  });
}

export function useTrackItems(trackId: string | null | undefined) {
  return useQuery({
    queryKey: tracksKeys.items(trackId ?? ""),
    queryFn: () => getTrackItems(trackId as string),
    enabled: Boolean(trackId),
  });
}

export function useTracksForEntity(
  entityType: TrackEntityType,
  entityId: string | null | undefined,
) {
  return useQuery({
    queryKey: tracksKeys.forEntity(entityType, entityId ?? ""),
    queryFn: () => getTracksForEntity(entityType, entityId as string),
    enabled: Boolean(entityId),
  });
}

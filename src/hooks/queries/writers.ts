import { useQuery } from "@tanstack/react-query";
import {
  getFeaturedWriters,
  getWriters,
  getWriter,
  getWritersAdmin,
  type GetWritersParams,
} from "@/services/writers.service";

export const writersKeys = {
  all: ["writers"] as const,
  featured: () => ["writers", "featured"] as const,
  list: (params?: GetWritersParams) =>
    ["writers", "list", params ?? {}] as const,
  adminList: (params?: GetWritersParams) =>
    ["writers", "adminList", params ?? {}] as const,
  byId: (id: string) => ["writers", "byId", id] as const,
};

export function useFeaturedWriters() {
  return useQuery({
    queryKey: writersKeys.featured(),
    queryFn: () => getFeaturedWriters(),
  });
}

export function useWriters(params?: GetWritersParams) {
  return useQuery({
    queryKey: writersKeys.list(params),
    queryFn: () => getWriters(params),
    placeholderData: (prev) => prev,
  });
}

export function useWritersAdmin(params?: GetWritersParams) {
  return useQuery({
    queryKey: writersKeys.adminList(params),
    queryFn: () => getWritersAdmin(params),
    placeholderData: (prev) => prev,
  });
}

export function useWriter(writerId: string | null | undefined) {
  return useQuery({
    queryKey: writersKeys.byId(writerId ?? ""),
    queryFn: () => getWriter(writerId as string),
    enabled: Boolean(writerId),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });
}

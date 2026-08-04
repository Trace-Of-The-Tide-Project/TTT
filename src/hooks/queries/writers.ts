import { useQuery } from "@tanstack/react-query";
import {
  getFeaturedWriters,
  getWriters,
  getWriter,
  getWritersAdmin,
  getWriterSupportSummary,
  getWriterTopWorks,
  getWriterWorks,
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
  supportSummary: (id: string) => ["writers", "supportSummary", id] as const,
  topWorks: (id: string, limit?: number) =>
    ["writers", "topWorks", id, limit ?? null] as const,
  works: (id: string, params?: Record<string, string | number | undefined>) =>
    ["writers", "works", id, params ?? {}] as const,
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

export function useWriterSupportSummary(writerId: string | null | undefined) {
  return useQuery({
    queryKey: writersKeys.supportSummary(writerId ?? ""),
    queryFn: () => getWriterSupportSummary(writerId as string),
    enabled: Boolean(writerId),
  });
}

export function useWriterTopWorks(
  writerId: string | null | undefined,
  limit = 4,
) {
  return useQuery({
    queryKey: writersKeys.topWorks(writerId ?? "", limit),
    queryFn: () => getWriterTopWorks(writerId as string, limit),
    enabled: Boolean(writerId),
  });
}

export function useWriterWorks(
  writerId: string | null | undefined,
  params?: Record<string, string | number | undefined>,
) {
  return useQuery({
    queryKey: writersKeys.works(writerId ?? "", params),
    queryFn: () => getWriterWorks(writerId as string, params),
    enabled: Boolean(writerId),
  });
}

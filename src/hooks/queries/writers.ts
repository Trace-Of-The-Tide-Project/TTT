import { useQuery } from "@tanstack/react-query";
import {
  getFeaturedWriters,
  getWriters,
  type GetWritersParams,
} from "@/services/writers.service";

export const writersKeys = {
  all: ["writers"] as const,
  featured: () => ["writers", "featured"] as const,
  list: (params?: GetWritersParams) =>
    ["writers", "list", params ?? {}] as const,
};

export function useFeaturedWriters() {
  return useQuery({
    queryKey: writersKeys.featured(),
    queryFn: getFeaturedWriters,
  });
}

export function useWriters(params?: GetWritersParams) {
  return useQuery({
    queryKey: writersKeys.list(params),
    queryFn: () => getWriters(params),
    placeholderData: (prev) => prev,
  });
}

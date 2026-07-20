import { useQuery } from "@tanstack/react-query";
import { getFramings } from "@/services/image-framing.service";

export const imageFramingKeys = {
  all: ["image-framings"] as const,
  list: (entityType: string, entityIds: string[], field?: string) =>
    [...imageFramingKeys.all, entityType, [...entityIds].sort().join(","), field ?? null] as const,
};

/**
 * Framing for a set of records, in one request. Ids are sorted into the key so
 * the same set in a different order is a cache hit rather than a second fetch.
 */
export function useImageFramings(
  entityType: string,
  entityIds: string[],
  field?: string,
) {
  const ids = entityIds.filter(Boolean);
  return useQuery({
    queryKey: imageFramingKeys.list(entityType, ids, field),
    queryFn: () => getFramings(entityType, ids, field),
    enabled: ids.length > 0,
  });
}

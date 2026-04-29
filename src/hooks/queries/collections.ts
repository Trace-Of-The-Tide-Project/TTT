import { useQuery } from "@tanstack/react-query";
import {
  getCollections,
  type GetCollectionsParams,
} from "@/services/collections.service";

export const collectionsKeys = {
  all: ["collections"] as const,
  list: (params?: GetCollectionsParams) =>
    ["collections", "list", params ?? {}] as const,
};

export function useCollections(params?: GetCollectionsParams) {
  return useQuery({
    queryKey: collectionsKeys.list(params),
    queryFn: () => getCollections(params),
  });
}

import { useQuery } from "@tanstack/react-query";
import { getAdminTags, listTags, type ListTagsParams } from "@/services/admin-tags.service";

export const adminTagsKeys = {
  all: ["admin-tags"] as const,
  list: (params?: ListTagsParams) => [...adminTagsKeys.all, "list", params ?? {}] as const,
};

export function useAdminTags() {
  return useQuery({
    queryKey: adminTagsKeys.all,
    queryFn: getAdminTags,
  });
}

export function useTagsList(params?: ListTagsParams) {
  return useQuery({
    queryKey: adminTagsKeys.list(params),
    queryFn: () => listTags(params),
  });
}

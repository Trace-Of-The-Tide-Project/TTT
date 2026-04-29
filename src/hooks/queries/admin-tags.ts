import { useQuery } from "@tanstack/react-query";
import { getAdminTags } from "@/services/admin-tags.service";

export const adminTagsKeys = {
  all: ["admin-tags"] as const,
};

export function useAdminTags() {
  return useQuery({
    queryKey: adminTagsKeys.all,
    queryFn: getAdminTags,
  });
}

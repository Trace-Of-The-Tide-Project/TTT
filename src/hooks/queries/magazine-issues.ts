import { useQuery } from "@tanstack/react-query";
import {
  getMagazineIssueBySlug,
  getMagazineIssues,
  type GetMagazineIssuesParams,
} from "@/services/magazine-issues.service";

export const magazineIssuesKeys = {
  all: ["magazine-issues"] as const,
  list: (params?: GetMagazineIssuesParams) =>
    ["magazine-issues", "list", params ?? {}] as const,
  bySlug: (slug: string) => ["magazine-issues", "slug", slug] as const,
};

export function useMagazineIssues(params?: GetMagazineIssuesParams) {
  return useQuery({
    queryKey: magazineIssuesKeys.list(params),
    queryFn: () => getMagazineIssues(params),
    placeholderData: (prev) => prev,
  });
}

export function useMagazineIssueBySlug(slug: string | null | undefined) {
  return useQuery({
    queryKey: magazineIssuesKeys.bySlug(slug ?? ""),
    queryFn: () => getMagazineIssueBySlug(slug as string),
    enabled: Boolean(slug),
  });
}

import { useQuery } from "@tanstack/react-query";
import {
  getCurrentIssue,
  getMagazineIssueBySlug,
  getMagazineIssues,
  type GetMagazineIssuesParams,
} from "@/services/magazine-issues.service";

export const magazineIssuesKeys = {
  all: ["magazine-issues"] as const,
  list: (params?: GetMagazineIssuesParams) =>
    ["magazine-issues", "list", params ?? {}] as const,
  bySlug: (slug: string) => ["magazine-issues", "slug", slug] as const,
  current: (lang?: string) => ["magazine-issues", "current", lang ?? ""] as const,
};

export function useMagazineIssues(
  params?: GetMagazineIssuesParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: magazineIssuesKeys.list(params),
    queryFn: () => getMagazineIssues(params),
    placeholderData: (prev) => prev,
    enabled: options?.enabled ?? true,
  });
}

export function useMagazineIssueBySlug(slug: string | null | undefined) {
  return useQuery({
    queryKey: magazineIssuesKeys.bySlug(slug ?? ""),
    queryFn: () => getMagazineIssueBySlug(slug as string),
    enabled: Boolean(slug),
  });
}

export function useCurrentIssue(lang?: string) {
  return useQuery({
    queryKey: magazineIssuesKeys.current(lang),
    queryFn: () => getCurrentIssue(lang),
  });
}

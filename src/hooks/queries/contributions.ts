import { useQuery } from "@tanstack/react-query";
import {
  fetchContributionTypes,
  getContributions,
} from "@/services/contributions.service";

export const contributionsKeys = {
  all: ["contributions"] as const,
  list: (page: number, limit: number) =>
    ["contributions", "list", page, limit] as const,
  types: () => ["contributions", "types"] as const,
};

export function useContributions(page = 1, limit = 10) {
  return useQuery({
    queryKey: contributionsKeys.list(page, limit),
    queryFn: () => getContributions(page, limit),
    placeholderData: (prev) => prev,
  });
}

export function useContributionTypes() {
  return useQuery({
    queryKey: contributionsKeys.types(),
    queryFn: fetchContributionTypes,
  });
}

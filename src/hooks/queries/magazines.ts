import { useQuery } from "@tanstack/react-query";
import {
  getMagazineBySlug,
  getMagazines,
  type GetMagazinesParams,
} from "@/services/magazines.service";

export const magazinesKeys = {
  all: ["magazines"] as const,
  list: (params?: GetMagazinesParams) =>
    ["magazines", "list", params ?? {}] as const,
  bySlug: (slug: string) => ["magazines", "slug", slug] as const,
};

export function useMagazines(params?: GetMagazinesParams) {
  return useQuery({
    queryKey: magazinesKeys.list(params),
    queryFn: () => getMagazines(params),
  });
}

export function useMagazineBySlug(slug: string | null | undefined) {
  return useQuery({
    queryKey: magazinesKeys.bySlug(slug ?? ""),
    queryFn: () => getMagazineBySlug(slug as string),
    enabled: Boolean(slug),
  });
}

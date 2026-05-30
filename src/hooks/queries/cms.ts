import { useQuery } from "@tanstack/react-query";
import {
  getCmsHomepage,
  getCmsPageBySlug,
  getCmsPages,
  getCmsSettings,
} from "@/services/cms.service";
import { ensureMagazinePage } from "@/services/magazine-page.service";

export const cmsKeys = {
  all: ["cms"] as const,
  homepage: () => ["cms", "homepage"] as const,
  pageBySlug: (slug: string) => ["cms", "page", slug] as const,
  pages: () => ["cms", "pages"] as const,
  settings: () => ["cms", "settings"] as const,
};

export function useCmsPageBySlug(slug: string) {
  return useQuery({
    queryKey: cmsKeys.pageBySlug(slug),
    queryFn: () => getCmsPageBySlug(slug),
  });
}

/**
 * Ensure the magazine CMS page (and seed sections) exist, then return
 * it. Idempotent — running it on every admin mount is safe.
 */
export function useEnsureMagazinePage() {
  return useQuery({
    queryKey: cmsKeys.pageBySlug("magazine"),
    queryFn: ensureMagazinePage,
  });
}

export function useCmsHomepage() {
  return useQuery({
    queryKey: cmsKeys.homepage(),
    queryFn: getCmsHomepage,
  });
}

export function useCmsPages() {
  return useQuery({
    queryKey: cmsKeys.pages(),
    queryFn: getCmsPages,
  });
}

export function useCmsSettings() {
  return useQuery({
    queryKey: cmsKeys.settings(),
    queryFn: getCmsSettings,
  });
}

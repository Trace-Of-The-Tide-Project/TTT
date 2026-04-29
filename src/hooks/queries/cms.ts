import { useQuery } from "@tanstack/react-query";
import {
  getCmsHomepage,
  getCmsPages,
  getCmsSettings,
} from "@/services/cms.service";

export const cmsKeys = {
  all: ["cms"] as const,
  homepage: () => ["cms", "homepage"] as const,
  pages: () => ["cms", "pages"] as const,
  settings: () => ["cms", "settings"] as const,
};

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

import { useQuery } from "@tanstack/react-query";
import {
  getMediaAssets,
  getMediaAsset,
  getMediaFolders,
  getAdminPageHeroes,
  type MediaAssetFilters,
} from "@/services/media-library.service";

export const mediaLibraryKeys = {
  all: ["media-library"] as const,
  assets: (filters: MediaAssetFilters) =>
    [...mediaLibraryKeys.all, "assets", filters] as const,
  asset: (id: string) => [...mediaLibraryKeys.all, "asset", id] as const,
  folders: () => [...mediaLibraryKeys.all, "folders"] as const,
  pageHeroes: () => [...mediaLibraryKeys.all, "page-heroes"] as const,
};

export function useMediaAssets(filters: MediaAssetFilters) {
  return useQuery({
    queryKey: mediaLibraryKeys.assets(filters),
    queryFn: () => getMediaAssets(filters),
    placeholderData: (prev) => prev,
  });
}

export function useMediaAsset(id: string | null) {
  return useQuery({
    queryKey: mediaLibraryKeys.asset(id ?? ""),
    queryFn: () => getMediaAsset(id as string),
    enabled: !!id,
  });
}

export function useMediaFolders() {
  return useQuery({
    queryKey: mediaLibraryKeys.folders(),
    queryFn: () => getMediaFolders(),
  });
}

export function useAdminPageHeroes() {
  return useQuery({
    queryKey: mediaLibraryKeys.pageHeroes(),
    queryFn: () => getAdminPageHeroes(),
  });
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateMediaAsset,
  deleteMediaAsset,
  uploadToMediaLibrary,
  runMediaScan,
  createMediaFolder,
  updateMediaFolder,
  deleteMediaFolder,
  bulkMoveMediaAssets,
  bulkDeleteMediaAssets,
  updatePageHero,
} from "@/services/media-library.service";
import { mediaLibraryKeys } from "@/hooks/queries/media-library";

export function useUpdatePageHero() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ pageId, storageKey }: { pageId: string; storageKey: string }) =>
      updatePageHero(pageId, storageKey),
    onSuccess: () => qc.invalidateQueries({ queryKey: mediaLibraryKeys.pageHeroes() }),
  });
}

export function useBulkMoveMediaAssets() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      assetIds,
      folderId,
    }: {
      assetIds: string[];
      folderId: string | null;
    }) => bulkMoveMediaAssets(assetIds, folderId),
    onSuccess: () => qc.invalidateQueries({ queryKey: mediaLibraryKeys.all }),
  });
}

export function useBulkDeleteMediaAssets() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ assetIds, force }: { assetIds: string[]; force?: boolean }) =>
      bulkDeleteMediaAssets(assetIds, force),
    onSuccess: () => qc.invalidateQueries({ queryKey: mediaLibraryKeys.all }),
  });
}

export function useUpdateMediaAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string;
      patch: { file_name?: string; folder_id?: string | null };
    }) => updateMediaAsset(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: mediaLibraryKeys.all }),
  });
}

export function useDeleteMediaAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, force }: { id: string; force?: boolean }) =>
      deleteMediaAsset(id, force),
    onSuccess: () => qc.invalidateQueries({ queryKey: mediaLibraryKeys.all }),
  });
}

export function useUploadToMediaLibrary() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      file,
      folderId,
      onProgress,
    }: {
      file: File;
      folderId?: string;
      onProgress?: (percent: number) => void;
    }) => uploadToMediaLibrary(file, folderId, onProgress),
    onSuccess: () => qc.invalidateQueries({ queryKey: mediaLibraryKeys.all }),
  });
}

export function useRunMediaScan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => runMediaScan(),
    onSuccess: () => qc.invalidateQueries({ queryKey: mediaLibraryKeys.all }),
  });
}

export function useCreateMediaFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; parent_id?: string }) =>
      createMediaFolder(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: mediaLibraryKeys.all }),
  });
}

export function useUpdateMediaFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string;
      patch: { name?: string; parent_id?: string | null };
    }) => updateMediaFolder(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: mediaLibraryKeys.all }),
  });
}

export function useDeleteMediaFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMediaFolder(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: mediaLibraryKeys.all }),
  });
}

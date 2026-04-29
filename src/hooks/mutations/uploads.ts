import { useMutation } from "@tanstack/react-query";
import {
  uploadArticleAsset,
  uploadFileForContribution,
} from "@/services/uploads.service";

export function useUploadArticleAsset() {
  return useMutation({
    mutationFn: (file: File) => uploadArticleAsset(file),
  });
}

export function useUploadContributionFile() {
  return useMutation({
    mutationFn: (file: File) => uploadFileForContribution(file),
  });
}

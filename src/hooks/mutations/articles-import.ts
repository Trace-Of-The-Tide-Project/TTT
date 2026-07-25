import { useMutation } from "@tanstack/react-query";
import { importFromGoogleDrive } from "@/services/articles.service";

// Caller wraps mutateAsync in mutationToast, so errors are silent here.

export function useImportFromGoogleDrive() {
  return useMutation({
    mutationFn: (url: string) => importFromGoogleDrive(url),
    meta: { silent: true },
  });
}

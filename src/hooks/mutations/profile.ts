import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateProfile,
  uploadAvatar,
  type UpdateProfileInput,
} from "@/services/profile.service";
import { profileKeys } from "@/hooks/queries/profile";

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => updateProfile(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: profileKeys.detail() }),
  });
}

export function useUploadAvatar() {
  return useMutation({
    mutationFn: (file: File) => uploadAvatar(file),
  });
}

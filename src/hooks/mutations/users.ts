import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateUser,
  updateUserStatus,
  type AdminUserStatus,
  type UpdateUserPayload,
} from "@/services/users.service";
import { usersKeys } from "@/hooks/queries/users";

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: string; payload: UpdateUserPayload }) =>
      updateUser(args.id, args.payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: usersKeys.all }),
  });
}

export function useUpdateUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: string; status: AdminUserStatus }) =>
      updateUserStatus(args.id, args.status),
    onSuccess: () => qc.invalidateQueries({ queryKey: usersKeys.all }),
  });
}

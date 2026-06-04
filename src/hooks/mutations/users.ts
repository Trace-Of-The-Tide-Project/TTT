import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  assignUserRole,
  revokeUserRole,
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

export function useAssignUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { userId: string; role: string }) =>
      assignUserRole(args.userId, args.role),
    onSuccess: () => qc.invalidateQueries({ queryKey: usersKeys.all }),
  });
}

export function useRevokeUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { userId: string; role: string }) =>
      revokeUserRole(args.userId, args.role),
    onSuccess: () => qc.invalidateQueries({ queryKey: usersKeys.all }),
  });
}

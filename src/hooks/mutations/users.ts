import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  assignUserRole,
  revokeUserRole,
  updateUser,
  updateUserStatus,
  createAdminUser,
  type AdminUserStatus,
  type UpdateUserPayload,
  type CreateAdminUserPayload,
} from "@/services/users.service";
import { usersKeys } from "@/hooks/queries/users";

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: string; payload: UpdateUserPayload }) =>
      updateUser(args.id, args.payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: usersKeys.all }),
    meta: { silent: true },
  });
}

export function useUpdateUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: string; status: AdminUserStatus }) =>
      updateUserStatus(args.id, args.status),
    onSuccess: () => qc.invalidateQueries({ queryKey: usersKeys.all }),
    meta: { silent: true },
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

export function useCreateAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAdminUserPayload) => createAdminUser(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: usersKeys.all }),
  });
}

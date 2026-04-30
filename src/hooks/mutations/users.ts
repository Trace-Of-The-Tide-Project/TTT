import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUser, type UpdateUserPayload } from "@/services/users.service";
import { usersKeys } from "@/hooks/queries/users";

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: string; payload: UpdateUserPayload }) =>
      updateUser(args.id, args.payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: usersKeys.all }),
  });
}

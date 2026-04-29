import { useQuery } from "@tanstack/react-query";
import {
  getUsers,
  type GetUsersParams,
} from "@/services/users.service";

export const usersKeys = {
  all: ["users"] as const,
  list: (params?: GetUsersParams) => ["users", "list", params ?? {}] as const,
};

export function useUsers(params?: GetUsersParams, options?: { silent?: boolean }) {
  return useQuery({
    queryKey: usersKeys.list(params),
    queryFn: () => getUsers(params),
    placeholderData: (prev) => prev,
    meta: options?.silent ? { silent: true } : undefined,
  });
}

import { useQuery } from "@tanstack/react-query";
import {
  getTasksAdmin,
  getMyTasks,
  getTask,
  type GetTasksParams,
} from "@/services/tasks.service";

export const tasksKeys = {
  all: ["tasks"] as const,
  adminList: (params?: GetTasksParams) =>
    ["tasks", "adminList", params ?? {}] as const,
  myList: (params?: GetTasksParams) =>
    ["tasks", "myList", params ?? {}] as const,
  byId: (id: string) => ["tasks", "byId", id] as const,
};

export function useTasksAdmin(params?: GetTasksParams) {
  return useQuery({
    queryKey: tasksKeys.adminList(params),
    queryFn: () => getTasksAdmin(params),
    placeholderData: (prev) => prev,
  });
}

export function useMyTasks(params?: GetTasksParams) {
  return useQuery({
    queryKey: tasksKeys.myList(params),
    queryFn: () => getMyTasks(params),
    placeholderData: (prev) => prev,
  });
}

export function useTask(taskId: string | null | undefined) {
  return useQuery({
    queryKey: tasksKeys.byId(taskId ?? ""),
    queryFn: () => getTask(taskId as string),
    enabled: Boolean(taskId),
  });
}

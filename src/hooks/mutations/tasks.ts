import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  type CreateTaskPayload,
  type UpdateTaskPayload,
  type TaskStatus,
} from "@/services/tasks.service";
import { tasksKeys } from "@/hooks/queries/tasks";

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => createTask(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: tasksKeys.all }),
    meta: { silent: true },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { taskId: string; payload: UpdateTaskPayload }) =>
      updateTask(args.taskId, args.payload),
    onSuccess: (_d, args) => {
      qc.invalidateQueries({ queryKey: tasksKeys.byId(args.taskId) });
      qc.invalidateQueries({ queryKey: tasksKeys.all });
    },
    meta: { silent: true },
  });
}

export function useUpdateTaskStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { taskId: string; status: TaskStatus }) =>
      updateTaskStatus(args.taskId, args.status),
    onSuccess: (_d, args) => {
      qc.invalidateQueries({ queryKey: tasksKeys.byId(args.taskId) });
      qc.invalidateQueries({ queryKey: tasksKeys.all });
    },
    meta: { silent: true },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => deleteTask(taskId),
    onSuccess: () => qc.invalidateQueries({ queryKey: tasksKeys.all }),
    meta: { silent: true },
  });
}

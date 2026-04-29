import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  approveEditorApplication,
  rejectEditorApplication,
} from "@/services/dashboard.service";
import { dashboardKeys } from "@/hooks/queries/dashboard";

export function useApproveEditorApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approveEditorApplication(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboard", "editor-applications"] });
      qc.invalidateQueries({ queryKey: ["dashboard", "editor-applications-full"] });
      qc.invalidateQueries({ queryKey: dashboardKeys.alerts() });
      qc.invalidateQueries({ queryKey: dashboardKeys.usersByRole() });
    },
  });
}

export function useRejectEditorApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rejectEditorApplication(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboard", "editor-applications"] });
      qc.invalidateQueries({ queryKey: ["dashboard", "editor-applications-full"] });
      qc.invalidateQueries({ queryKey: dashboardKeys.alerts() });
    },
  });
}

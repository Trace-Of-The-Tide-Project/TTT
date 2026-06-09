import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deactivateAccount,
  deleteAccount,
  exportAccountData,
  revokeSession,
  type AccountExport,
} from "@/services/account.service";
import { accountKeys } from "@/hooks/queries/account";

export function useRevokeSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => revokeSession(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: accountKeys.sessions() }),
  });
}

export function useDeactivateAccount() {
  return useMutation({
    mutationFn: (password: string) => deactivateAccount(password),
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: (password: string) => deleteAccount(password),
  });
}

/** Fetches the export payload then triggers a client-side JSON download. The
 * downloaded filename is kept ASCII so it is safe across locales. */
export function useExportAccountData() {
  return useMutation({
    mutationFn: exportAccountData,
    onSuccess: (data: AccountExport) => {
      if (typeof window === "undefined") return;
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const stamp = (data.exported_at || new Date().toISOString()).slice(0, 10);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tott-account-export-${stamp}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    },
  });
}

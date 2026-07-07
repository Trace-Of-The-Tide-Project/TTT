"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { AlertTriangleIcon } from "@/components/ui/icons";
import { useAuth } from "@/components/providers/AuthProvider";
import { useDeactivateAccount, useDeleteAccount } from "@/hooks/mutations/account";
import { accountErrorMessage } from "@/services/account.service";
import { PasswordConfirmModal } from "./PasswordConfirmModal";

type DangerRowProps = {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
};

function DangerRow({ title, description, actionLabel, onAction }: DangerRowProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-red-900/30 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-sm text-[var(--tott-muted)]">{description}</p>
      </div>
      <button
        type="button"
        onClick={onAction}
        className="inline-flex shrink-0 items-center justify-center rounded-lg border border-red-900/60 bg-red-950/40 px-4 py-2 text-sm font-medium text-red-200 transition-colors hover:bg-red-950/70"
      >
        {actionLabel}
      </button>
    </div>
  );
}

export function AccountDangerZone() {
  const t = useTranslations("Dashboard.account");
  const router = useRouter();
  const { logout } = useAuth();

  const deactivateMutation = useDeactivateAccount();
  const deleteMutation = useDeleteAccount();

  const [openModal, setOpenModal] = useState<null | "deactivate" | "delete">(null);
  const [error, setError] = useState<string | null>(null);

  const busy = deactivateMutation.isPending || deleteMutation.isPending;

  const closeModal = useCallback(() => {
    if (busy) return;
    setOpenModal(null);
    setError(null);
  }, [busy]);

  const handleDeactivate = useCallback(
    (password: string) => {
      setError(null);
      deactivateMutation.mutate(password, {
        onSuccess: async () => {
          // Deactivation hides the account; the user is signed out and returned to login.
          await logout();
          router.push("/auth/login");
          router.refresh();
        },
        onError: (e) => setError(accountErrorMessage(e, t("danger.genericError"))),
      });
    },
    [deactivateMutation, logout, router, t],
  );

  const handleDelete = useCallback(
    (password: string) => {
      setError(null);
      deleteMutation.mutate(password, {
        onSuccess: async () => {
          await logout();
          router.push("/auth/login");
          router.refresh();
        },
        onError: (e) => setError(accountErrorMessage(e, t("danger.genericError"))),
      });
    },
    [deleteMutation, logout, router, t],
  );

  return (
    <section
      className="rounded-xl border border-red-900/60 bg-red-950/10 p-6 sm:p-8"
      style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset" }}
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="text-[var(--tott-dash-negative)]">
          <AlertTriangleIcon />
        </span>
        <h2 className="text-lg font-bold text-[var(--tott-dash-negative)]">{t("danger.title")}</h2>
      </div>
      <p className="mb-4 text-sm text-[var(--tott-muted)]">{t("danger.subtitle")}</p>

      <div>
        <DangerRow
          title={t("danger.deactivateTitle")}
          description={t("danger.deactivateDescription")}
          actionLabel={t("danger.deactivateAction")}
          onAction={() => {
            setError(null);
            setOpenModal("deactivate");
          }}
        />
        <DangerRow
          title={t("danger.deleteTitle")}
          description={t("danger.deleteDescription")}
          actionLabel={t("danger.deleteAction")}
          onAction={() => {
            setError(null);
            setOpenModal("delete");
          }}
        />
      </div>

      <PasswordConfirmModal
        open={openModal === "deactivate"}
        title={t("danger.deactivateModalTitle")}
        description={t("danger.deactivateModalDescription")}
        confirmLabel={t("danger.deactivateAction")}
        confirmBusyLabel={t("danger.deactivating")}
        busy={deactivateMutation.isPending}
        error={error}
        onClose={closeModal}
        onConfirm={handleDeactivate}
      />

      <PasswordConfirmModal
        open={openModal === "delete"}
        title={t("danger.deleteModalTitle")}
        description={t("danger.deleteModalDescription")}
        confirmLabel={t("danger.deleteAction")}
        confirmBusyLabel={t("danger.deleting")}
        typeToConfirm={t("danger.deleteConfirmPhrase")}
        busy={deleteMutation.isPending}
        error={error}
        onClose={closeModal}
        onConfirm={handleDelete}
      />
    </section>
  );
}

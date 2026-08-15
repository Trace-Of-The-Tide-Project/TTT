"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ChamferedPanel } from "@/components/ui/ChamferedPanel";
import { ChamferedTable, type ChamferedTableColumn } from "@/components/ui/ChamferedTable";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatApiError } from "@/lib/api/error-message";
import { usePendingGifts } from "@/hooks/queries/gifting";
import { useApproveGift } from "@/hooks/mutations/gifting";
import type { GiftGrant } from "@/services/gifting.service";

function formatDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function GiftsQueueContent() {
  const t = useTranslations("Dashboard.gifts");
  const pendingQuery = usePendingGifts("pending");
  const items = pendingQuery.data ?? [];
  const approveMutation = useApproveGift();
  const [approveTarget, setApproveTarget] = useState<GiftGrant | null>(null);
  const [approveError, setApproveError] = useState<string | null>(null);

  function closeDialog() {
    if (approveMutation.isPending) return;
    setApproveTarget(null);
    setApproveError(null);
  }

  function confirmApprove() {
    if (!approveTarget) return;
    const target = approveTarget;
    setApproveError(null);
    approveMutation.mutate(
      { id: target.id },
      {
        onSuccess: () => {
          toast.success(t("toasts.approved"));
          setApproveTarget(null);
        },
        onError: (e) => setApproveError(formatApiError(e, t("toasts.approveFailed"))),
      },
    );
  }

  const columns: ChamferedTableColumn<GiftGrant>[] = [
    {
      key: "type",
      header: t("table.type"),
      width: "0.8fr",
      cell: (row) => (
        <span className="text-sm text-foreground">{t(`type.${row.type}`)}</span>
      ),
    },
    {
      key: "scope",
      header: t("table.scope"),
      width: "1fr",
      cell: (row) => (
        <span className="text-sm text-[var(--tott-muted)]">
          {t(`scope.${row.scope_type}`)}
          {row.scope_id ? ` — ${row.scope_id.slice(0, 8)}` : ""}
        </span>
      ),
    },
    {
      key: "detail",
      header: t("table.detail"),
      width: "1.4fr",
      cell: (row) => (
        <span className="line-clamp-2 text-sm text-[var(--tott-muted)]">
          {row.in_kind_description || row.note || "—"}
        </span>
      ),
    },
    {
      key: "date",
      header: t("table.submitted"),
      width: "0.7fr",
      cell: (row) => (
        <span className="text-xs text-[var(--tott-muted)]">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "6rem",
      align: "end",
      cell: (row) => (
        <button
          type="button"
          onClick={() => {
            setApproveError(null);
            setApproveTarget(row);
          }}
          className="rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-colors hover:bg-foreground/80"
        >
          {t("table.approve")}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 px-3 py-4 sm:px-4 sm:py-6">
      <ConfirmDialog
        open={approveTarget != null}
        title={t("approveDialog.title")}
        description={
          approveTarget
            ? t("approveDialog.description", {
                type: t(`type.${approveTarget.type}`),
              })
            : undefined
        }
        confirmLabel={t("approveDialog.confirm")}
        confirmBusyLabel={t("approveDialog.confirmBusy")}
        busy={approveMutation.isPending}
        error={approveError}
        onClose={closeDialog}
        onConfirm={confirmApprove}
      />

      <div>
        <h1 className="text-lg font-semibold text-foreground">{t("heading")}</h1>
        <p className="text-sm text-[var(--tott-muted)]">{t("subheading")}</p>
      </div>

      <ChamferedPanel className="px-4 py-4 sm:px-6 sm:py-5">
        <ChamferedTable
          className="w-full"
          columns={columns}
          rows={items}
          rowKey={(row) => row.id}
          loading={pendingQuery.isPending}
          loadingLabel={t("loading")}
          emptyLabel={t("empty")}
        />
      </ChamferedPanel>
    </div>
  );
}

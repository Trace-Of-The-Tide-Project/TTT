"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ChamferedPanel } from "@/components/ui/ChamferedPanel";
import { ChamferedTable, type ChamferedTableColumn } from "@/components/ui/ChamferedTable";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatApiError } from "@/lib/api/error-message";
import { useOpinionSubmissionsAdmin } from "@/hooks/queries/opinion-submissions-admin";
import { useUpdateOpinionSubmissionStatus } from "@/hooks/mutations/opinion-submissions-admin";
import type {
  OpinionSubmission,
  OpinionSubmissionStatus,
} from "@/services/opinion-submissions-admin.service";

const STATUS_TABS: OpinionSubmissionStatus[] = ["new", "reviewing", "accepted", "rejected"];

function formatDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function OpinionSubmissionsQueueContent() {
  const t = useTranslations("Dashboard.opinionSubmissions");
  const [status, setStatus] = useState<OpinionSubmissionStatus>("new");
  const query = useOpinionSubmissionsAdmin(status);
  const items = query.data ?? [];
  const updateStatus = useUpdateOpinionSubmissionStatus();

  const [target, setTarget] = useState<{ row: OpinionSubmission; next: OpinionSubmissionStatus } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  function closeDialog() {
    if (updateStatus.isPending) return;
    setTarget(null);
    setError(null);
  }

  function confirm() {
    if (!target) return;
    setError(null);
    updateStatus.mutate(
      { id: target.row.id, status: target.next },
      {
        onSuccess: () => {
          toast.success(t(`toasts.${target.next}`));
          setTarget(null);
        },
        onError: (e) => setError(formatApiError(e, t("toasts.failed"))),
      },
    );
  }

  const columns: ChamferedTableColumn<OpinionSubmission>[] = [
    {
      key: "title",
      header: t("table.title"),
      width: "1.4fr",
      cell: (row) => (
        <span className="line-clamp-2 text-sm text-foreground">{row.title}</span>
      ),
    },
    {
      key: "author",
      header: t("table.author"),
      width: "1fr",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="text-sm text-foreground">{row.author_name}</span>
          <span className="text-xs text-[var(--tott-muted)]">{row.author_email}</span>
        </div>
      ),
    },
    {
      key: "language",
      header: t("table.language"),
      width: "0.5fr",
      cell: (row) => <span className="text-xs uppercase text-[var(--tott-muted)]">{row.language}</span>,
    },
    {
      key: "submitted",
      header: t("table.submitted"),
      width: "0.7fr",
      cell: (row) => <span className="text-xs text-[var(--tott-muted)]">{formatDate(row.createdAt)}</span>,
    },
    {
      key: "actions",
      header: "",
      width: "12rem",
      align: "end",
      cell: (row) =>
        status === "new" || status === "reviewing" ? (
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setTarget({ row, next: "accepted" });
              }}
              className="rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-colors hover:bg-foreground/80"
            >
              {t("table.accept")}
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setTarget({ row, next: "rejected" });
              }}
              className="rounded-lg border border-[var(--tott-card-border)] px-3 py-1.5 text-xs font-medium text-[var(--tott-muted)] transition-colors hover:text-foreground"
            >
              {t("table.reject")}
            </button>
          </div>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6 px-3 py-4 sm:px-4 sm:py-6">
      <ConfirmDialog
        open={target != null}
        title={target?.next === "accepted" ? t("acceptDialog.title") : t("rejectDialog.title")}
        description={
          target
            ? target.next === "accepted"
              ? t("acceptDialog.description", { title: target.row.title })
              : t("rejectDialog.description", { title: target.row.title })
            : undefined
        }
        confirmLabel={target?.next === "accepted" ? t("acceptDialog.confirm") : t("rejectDialog.confirm")}
        confirmBusyLabel={t("confirmBusy")}
        destructive={target?.next === "rejected"}
        busy={updateStatus.isPending}
        error={error}
        onClose={closeDialog}
        onConfirm={confirm}
      />

      <div>
        <h1 className="text-lg font-semibold text-foreground">{t("heading")}</h1>
        <p className="text-sm text-[var(--tott-muted)]">{t("subheading")}</p>
      </div>

      <div className="flex gap-2">
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
            style={{
              backgroundColor: status === s ? "var(--tott-accent-gold)" : "transparent",
              color: status === s ? "#000" : "var(--tott-muted)",
              border: status === s ? "none" : "1px solid var(--tott-card-border)",
            }}
          >
            {t(`tabs.${s}`)}
          </button>
        ))}
      </div>

      <ChamferedPanel className="px-4 py-4 sm:px-6 sm:py-5">
        <ChamferedTable
          className="w-full"
          columns={columns}
          rows={items}
          rowKey={(row) => row.id}
          loading={query.isPending}
          loadingLabel={t("loading")}
          emptyLabel={t("empty")}
        />
      </ChamferedPanel>
    </div>
  );
}

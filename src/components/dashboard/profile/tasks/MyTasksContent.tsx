"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  ChamferedTable,
  type ChamferedTableColumn,
} from "@/components/ui/ChamferedTable";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useMyTasks } from "@/hooks/queries/tasks";
import { useUpdateTaskStatus } from "@/hooks/mutations/tasks";
import { taskPersonName, type Task, type TaskStatus, type TasksListMeta } from "@/services/tasks.service";
import { formatApiError } from "@/lib/api/error-message";
import { StatusBadge, PriorityBadge } from "@/components/dashboard/admin/tasks/badges";

const PAGE_LIMIT = 10;

const emptyMeta: TasksListMeta = { total: 0, page: 1, limit: PAGE_LIMIT, totalPages: 1 };

// Which status transitions the assignee can perform themselves, per current status.
const NEXT_STATUS: Partial<Record<TaskStatus, TaskStatus[]>> = {
  pending: ["in_progress", "cancelled"],
  in_progress: ["completed", "cancelled"],
};

export function MyTasksContent() {
  const t = useTranslations("Dashboard.tasks.myTasks");
  const [filter, setFilter] = useState<TaskStatus | "all">("all");
  const [page, setPage] = useState(1);

  const queryParams = useMemo(
    () => ({
      page,
      limit: PAGE_LIMIT,
      status: filter === "all" ? undefined : filter,
    }),
    [page, filter],
  );

  const tasksQuery = useMyTasks(queryParams);
  const tasks = tasksQuery.data?.tasks ?? [];
  const meta = tasksQuery.data?.meta ?? emptyMeta;
  const loading = tasksQuery.isPending;
  const loadError = tasksQuery.error
    ? formatApiError(tasksQuery.error, t("errors.loadFailed"))
    : null;

  const statusMutation = useUpdateTaskStatus();
  const setTaskStatus = (task: Task, status: TaskStatus) => {
    statusMutation.mutate(
      { taskId: task.id, status },
      {
        onSuccess: () => toast.success(t(`toasts.${status}`)),
        onError: (e) => toast.error(formatApiError(e, t("errors.updateFailed"))),
      },
    );
  };

  const totalPages = Math.max(1, meta.totalPages);
  const effectivePage = Math.min(page, totalPages);
  if (meta.total > 0 && page > totalPages) {
    setPage(totalPages);
  }

  const columns = useMemo<ChamferedTableColumn<Task>[]>(
    () => [
      {
        key: "title",
        header: t("headers.title"),
        width: "28%",
        cellClassName: "px-5 py-3 flex min-w-0 flex-col justify-center",
        cell: (task) => (
          <>
            <p className="truncate text-sm font-medium text-[var(--tott-dash-gold-text)]">
              {task.title}
            </p>
            {task.description ? (
              <p className="truncate text-xs text-[var(--tott-muted)]">{task.description}</p>
            ) : null}
          </>
        ),
      },
      {
        key: "assigner",
        header: t("headers.assignedBy"),
        width: "16%",
        cellClassName: "px-5 py-3 text-sm text-foreground flex items-center min-w-0",
        cell: (task) => <span className="truncate">{taskPersonName(task.assigner)}</span>,
      },
      {
        key: "priority",
        header: t("headers.priority"),
        width: "12%",
        cellClassName: "px-5 py-3 flex items-center",
        cell: (task) => (
          <PriorityBadge priority={task.priority} label={t(`priority.${task.priority}`)} />
        ),
      },
      {
        key: "due_date",
        header: t("headers.dueDate"),
        width: "14%",
        cellClassName: "px-5 py-3 text-sm text-[var(--tott-muted)] flex items-center",
        cell: (task) => (task.due_date ? new Date(task.due_date).toLocaleDateString() : "—"),
      },
      {
        key: "status",
        header: t("headers.status"),
        width: "14%",
        cellClassName: "px-5 py-3 flex items-center",
        cell: (task) => <StatusBadge status={task.status} label={t(`status.${task.status}`)} />,
      },
      {
        key: "actions",
        header: "",
        width: "16%",
        align: "end",
        cellClassName: "flex items-center justify-end gap-2 px-3 py-3",
        cell: (task) => {
          const options = NEXT_STATUS[task.status] ?? [];
          if (options.length === 0) return null;
          return (
            <>
              {options.map((next) => (
                <button
                  key={next}
                  type="button"
                  disabled={statusMutation.isPending}
                  onClick={() => setTaskStatus(task, next)}
                  className="rounded-lg border border-[var(--tott-gold)]/60 bg-[var(--tott-gold)]/10 px-2.5 py-1 text-xs font-medium text-[var(--tott-gold)] hover:bg-[var(--tott-gold)]/20 disabled:opacity-40 transition-colors"
                >
                  {t(`actions.${next}`)}
                </button>
              ))}
            </>
          );
        },
      },
    ],
    [t, statusMutation.isPending],
  );

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-foreground">{t("pageTitle")}</h1>

      <SegmentedControl
        ariaLabel={t("filterLabel")}
        value={filter}
        onChange={(v) => {
          setFilter(v);
          setPage(1);
        }}
        options={[
          { id: "all", label: t("filters.all") },
          { id: "pending", label: t("status.pending") },
          { id: "in_progress", label: t("status.in_progress") },
          { id: "completed", label: t("status.completed") },
          { id: "cancelled", label: t("status.cancelled") },
        ]}
      />

      {loadError && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-3 text-sm text-red-200">
          <span>{loadError}</span>
          <button
            type="button"
            onClick={() => tasksQuery.refetch()}
            className="shrink-0 underline hover:no-underline"
          >
            {t("tryAgain")}
          </button>
        </div>
      )}

      <ChamferedTable
        columns={columns}
        rows={tasks}
        rowKey={(task) => task.id}
        loading={loading}
        loadingLabel={t("loading")}
        emptyLabel={t("empty")}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-3 text-xs">
          <button
            type="button"
            disabled={loading || effectivePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-[var(--tott-gold)]/60 bg-[var(--tott-gold)]/10 px-3 py-1.5 font-medium text-[var(--tott-gold)] transition-colors hover:bg-[var(--tott-gold)]/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[var(--tott-gold)]/10"
          >
            {t("pagination.previous")}
          </button>
          <span className="text-[var(--tott-muted)]">
            {t("pagination.pageOf", { page: effectivePage, totalPages })}
          </span>
          <button
            type="button"
            disabled={loading || effectivePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-lg border border-[var(--tott-gold)]/60 bg-[var(--tott-gold)]/10 px-3 py-1.5 font-medium text-[var(--tott-gold)] transition-colors hover:bg-[var(--tott-gold)]/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[var(--tott-gold)]/10"
          >
            {t("pagination.next")}
          </button>
        </div>
      )}
    </div>
  );
}

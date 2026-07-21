"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PlusIcon, TrashIcon, PenLineIcon } from "@/components/ui/icons";
import {
  ChamferedTable,
  type ChamferedTableColumn,
} from "@/components/ui/ChamferedTable";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useTasksAdmin } from "@/hooks/queries/tasks";
import { useDeleteTask } from "@/hooks/mutations/tasks";
import { taskPersonName, type Task, type TaskStatus, type TaskPriority, type TasksListMeta } from "@/services/tasks.service";
import { formatApiError } from "@/lib/api/error-message";
import { StatusBadge, PriorityBadge } from "./badges";

const PAGE_LIMIT = 10;
const STATUSES: TaskStatus[] = ["pending", "in_progress", "completed", "cancelled"];
const PRIORITIES: TaskPriority[] = ["low", "medium", "high"];

const emptyMeta: TasksListMeta = { total: 0, page: 1, limit: PAGE_LIMIT, totalPages: 1 };

export function TasksManagementContent() {
  const t = useTranslations("Dashboard.tasks.management");

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<TaskStatus | "">("");
  const [priority, setPriority] = useState<TaskPriority | "">("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const [prevFilters, setPrevFilters] = useState({ debouncedSearch, status, priority });
  if (
    prevFilters.debouncedSearch !== debouncedSearch ||
    prevFilters.status !== status ||
    prevFilters.priority !== priority
  ) {
    setPrevFilters({ debouncedSearch, status, priority });
    setPage(1);
  }

  const queryParams = useMemo(
    () => ({
      page,
      limit: PAGE_LIMIT,
      search: debouncedSearch || undefined,
      status: status || undefined,
      priority: priority || undefined,
    }),
    [page, debouncedSearch, status, priority],
  );

  const tasksQuery = useTasksAdmin(queryParams);
  const tasks = tasksQuery.data?.tasks ?? [];
  const meta = tasksQuery.data?.meta ?? emptyMeta;
  const loading = tasksQuery.isPending;
  const loadError = tasksQuery.error
    ? formatApiError(tasksQuery.error, t("errors.loadFailed"))
    : null;

  const deleteMutation = useDeleteTask();
  const deleteBusy = deleteMutation.isPending;

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setDeleteError(null);
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
      onError: (e) => setDeleteError(formatApiError(e, t("errors.deleteFailed"))),
    });
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
        key: "assignee",
        header: t("headers.assignee"),
        width: "18%",
        cellClassName: "px-5 py-3 text-sm text-foreground flex items-center min-w-0",
        cell: (task) => <span className="truncate">{taskPersonName(task.assignee)}</span>,
      },
      {
        key: "status",
        header: t("headers.status"),
        width: "16%",
        cellClassName: "px-5 py-3 flex items-center",
        cell: (task) => <StatusBadge status={task.status} label={t(`status.${task.status}`)} />,
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
        cell: (task) =>
          task.due_date ? new Date(task.due_date).toLocaleDateString() : "—",
      },
      {
        key: "actions",
        header: "",
        width: "12%",
        align: "center",
        cellClassName: "flex items-center justify-center gap-2 px-3 py-3",
        cell: (task) => (
          <>
            <Link
              href={`/admin/tasks/${task.id}/edit`}
              className="rounded p-1 text-[var(--tott-muted)] hover:text-foreground"
              title={t("edit")}
            >
              <PenLineIcon />
            </Link>
            <button
              type="button"
              onClick={() => {
                setDeleteError(null);
                setDeleteTarget(task);
              }}
              className="rounded p-1 text-[var(--tott-muted)] hover:text-red-400"
              title={t("delete.confirm")}
            >
              <TrashIcon />
            </button>
          </>
        ),
      },
    ],
    [t],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-foreground">{t("pageTitle")}</h1>
        <Link
          href="/admin/tasks/create"
          className="flex items-center gap-1.5 rounded-lg border border-[var(--tott-gold)]/60 bg-[var(--tott-gold)]/10 px-3 py-1.5 text-xs font-medium text-[var(--tott-gold)] hover:bg-[var(--tott-gold)]/20 transition-colors"
        >
          <PlusIcon />
          {t("addNew")}
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder={t("searchPlaceholder")}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full max-w-sm rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground placeholder:text-[var(--tott-muted)] outline-none focus:border-[var(--tott-card-border)]"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as TaskStatus | "")}
          className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground outline-none"
        >
          <option value="">{t("filters.allStatuses")}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`status.${s}`)}
            </option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as TaskPriority | "")}
          className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground outline-none"
        >
          <option value="">{t("filters.allPriorities")}</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {t(`priority.${p}`)}
            </option>
          ))}
        </select>
      </div>

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
        emptyLabel={debouncedSearch ? t("empty.noMatch") : t("empty.none")}
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

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t("delete.title")}
        description={deleteTarget ? t("delete.description", { title: deleteTarget.title }) : undefined}
        confirmLabel={t("delete.confirm")}
        confirmBusyLabel={t("delete.confirmBusy")}
        cancelLabel={t("delete.cancel")}
        destructive
        busy={deleteBusy}
        error={deleteError}
        onClose={() => {
          if (deleteBusy) return;
          setDeleteTarget(null);
          setDeleteError(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

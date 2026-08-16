"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import { PlusIcon, TrashIcon, PenLineIcon } from "@/components/ui/icons";
import {
  ChamferedTable,
  type ChamferedTableColumn,
} from "@/components/ui/ChamferedTable";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useSessionsAdmin } from "@/hooks/queries/sessions";
import { useDeleteSession } from "@/hooks/mutations/sessions";
import type { EventSession, SessionsListMeta } from "@/services/sessions.service";
import { formatApiError } from "@/lib/api/error-message";

const PAGE_LIMIT = 10;

const emptyMeta: SessionsListMeta = {
  total: 0,
  page: 1,
  limit: PAGE_LIMIT,
  totalPages: 1,
};

function formatStartsAt(d: string | null | undefined): string {
  if (!d) return "—";
  const date = new Date(d);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function SessionsManagementContent() {
  const t = useTranslations("Dashboard.sessions");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [spaceFilter, setSpaceFilter] = useState<string>("");
  const [deleteTarget, setDeleteTarget] = useState<EventSession | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const [prevDebounced, setPrevDebounced] = useState(debouncedSearch);
  if (prevDebounced !== debouncedSearch) {
    setPrevDebounced(debouncedSearch);
    setPage(1);
  }

  const queryParams = useMemo(
    () => ({
      page,
      limit: PAGE_LIMIT,
      search: debouncedSearch || undefined,
      space: spaceFilter || undefined,
    }),
    [page, debouncedSearch, spaceFilter],
  );

  const sessionsQuery = useSessionsAdmin(queryParams);
  const sessions = sessionsQuery.data?.sessions ?? [];
  const meta = sessionsQuery.data?.meta ?? emptyMeta;
  const loading = sessionsQuery.isPending;
  const loadError = sessionsQuery.error
    ? formatApiError(sessionsQuery.error, t("list.errors.loadFailed"))
    : null;

  const deleteMutation = useDeleteSession();
  const deleteBusy = deleteMutation.isPending;

  const openDelete = useCallback((s: EventSession) => {
    setDeleteError(null);
    setDeleteTarget(s);
  }, []);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
        toast.success(t("list.toasts.deleted"));
      },
      onError: (e) => setDeleteError(formatApiError(e, t("list.errors.deleteFailed"))),
    });
  };

  const totalPages = Math.max(1, meta.totalPages);
  const effectivePage = Math.min(page, totalPages);
  if (meta.total > 0 && page > totalPages) setPage(totalPages);

  const columns = useMemo<ChamferedTableColumn<EventSession>[]>(
    () => [
      {
        key: "title",
        header: t("list.headers.title"),
        width: "28%",
        cellClassName: "flex min-w-0 flex-col justify-center gap-0.5 px-5 py-3",
        cell: (s) => (
          <>
            <p className="truncate text-sm font-medium text-[var(--tott-dash-gold-text)]">
              {s.title}
            </p>
            <span className="text-xs text-[var(--tott-muted)]">
              {s.space === "writing_room" ? t("list.space.writingRoom") : t("list.space.waqamh")}
            </span>
          </>
        ),
      },
      {
        key: "starts_at",
        header: t("list.headers.startsAt"),
        width: "18%",
        cellClassName: "px-5 py-3 text-sm text-[var(--tott-muted)] flex items-center",
        cell: (s) => <span dir="ltr">{formatStartsAt(s.starts_at)}</span>,
      },
      {
        key: "capacity",
        header: t("list.headers.capacity"),
        width: "14%",
        cellClassName: "px-5 py-3 text-sm text-[var(--tott-muted)] flex items-center",
        cell: (s) => <span dir="ltr">{s.capacity ?? t("list.unlimited")}</span>,
      },
      {
        key: "status",
        header: t("list.headers.status"),
        width: "16%",
        cellClassName: "px-5 py-3 text-sm flex items-center",
        cell: (s) => (
          <span className="rounded-full border border-[var(--tott-card-border)] px-2 py-0.5 text-xs text-[var(--tott-muted)]">
            {t(`list.status.${s.status}`)}
          </span>
        ),
      },
      {
        key: "actions",
        header: "",
        width: "24%",
        align: "end",
        cellClassName: "flex items-center justify-end gap-2 px-3 py-3",
        cell: (s) => (
          <>
            <Link
              href={`/admin/sessions/${s.id}/edit`}
              className="rounded p-1 text-[var(--tott-muted)] hover:text-foreground"
              title={t("list.edit")}
            >
              <PenLineIcon />
            </Link>
            <button
              type="button"
              onClick={() => openDelete(s)}
              className="rounded p-1 text-[var(--tott-muted)] hover:text-red-400"
              title={t("list.delete")}
            >
              <TrashIcon />
            </button>
          </>
        ),
      },
    ],
    [openDelete, t],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-foreground">{t("list.pageTitle")}</h1>
        <Link
          href="/admin/sessions/create"
          className="flex items-center gap-1.5 rounded-lg border border-[var(--tott-gold)]/60 bg-[var(--tott-gold)]/10 px-3 py-1.5 text-xs font-medium text-[var(--tott-gold)] hover:bg-[var(--tott-gold)]/20 transition-colors"
        >
          <PlusIcon />
          {t("list.addNew")}
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder={t("list.searchPlaceholder")}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full max-w-sm rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground placeholder:text-[var(--tott-muted)] outline-none focus:border-[var(--tott-card-border)]"
        />
        <select
          value={spaceFilter}
          onChange={(e) => {
            setSpaceFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--tott-card-border)]"
        >
          <option value="">{t("list.space.all")}</option>
          <option value="writing_room">{t("list.space.writingRoom")}</option>
          <option value="waqamh">{t("list.space.waqamh")}</option>
        </select>
      </div>

      {loadError && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-3 text-sm text-red-200">
          <span>{loadError}</span>
          <button
            type="button"
            onClick={() => sessionsQuery.refetch()}
            className="shrink-0 underline hover:no-underline"
          >
            {t("list.tryAgain")}
          </button>
        </div>
      )}

      <ChamferedTable
        columns={columns}
        rows={sessions}
        rowKey={(s) => s.id}
        loading={loading}
        loadingLabel={t("list.loading")}
        emptyLabel={debouncedSearch ? t("list.empty.noMatch") : t("list.empty.none")}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 text-xs text-[var(--tott-muted)]">
          <button
            type="button"
            disabled={loading || effectivePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="disabled:opacity-40"
          >
            {t("list.pagination.previous")}
          </button>
          <span>
            {effectivePage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={loading || effectivePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="disabled:opacity-40"
          >
            {t("list.pagination.next")}
          </button>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t("list.deleteModal.title")}
        description={
          deleteTarget ? t("list.deleteModal.description", { title: deleteTarget.title }) : undefined
        }
        confirmLabel={t("list.deleteModal.confirm")}
        confirmBusyLabel={t("list.deleteModal.confirmBusy")}
        cancelLabel={t("list.deleteModal.cancel")}
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

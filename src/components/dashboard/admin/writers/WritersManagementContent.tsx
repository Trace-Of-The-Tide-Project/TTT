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
import { useWritersAdmin } from "@/hooks/queries/writers";
import {
  useUpdateWriterProfile,
  useDeleteWriterProfile,
} from "@/hooks/mutations/writers";
import {
  writerAvatar,
  writerDisplayName,
  type WriterProfile,
  type WritersListMeta,
} from "@/services/writers.service";
import { formatApiError } from "@/lib/api/error-message";
import { nameInitials } from "./initials";

const PAGE_LIMIT = 10;

const KNOWN_KINDS = new Set(["musician", "writer", "visual_artist", "filmmaker"]);

const emptyMeta: WritersListMeta = {
  total: 0,
  page: 1,
  limit: PAGE_LIMIT,
  totalPages: 1,
};

/** Pen name → joined user's name → legacy display_name → "—". */
function writerRowName(w: WriterProfile): string {
  return (
    w.pen_name?.trim() ||
    writerDisplayName(w) ||
    "—"
  );
}

export function WritersManagementContent() {
  const t = useTranslations("Dashboard.writersManagement.list");
  const tKinds = useTranslations("Dashboard.writersManagement.form.kinds");

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WriterProfile | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedSearch(searchInput.trim()),
      400,
    );
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
    }),
    [page, debouncedSearch],
  );

  const writersQuery = useWritersAdmin(queryParams);
  const writers = writersQuery.data?.writers ?? [];
  const meta = writersQuery.data?.meta ?? emptyMeta;
  const loading = writersQuery.isPending;
  const loadError = writersQuery.error
    ? formatApiError(writersQuery.error, t("errors.loadFailed"))
    : null;

  const updateMutation = useUpdateWriterProfile();
  const deleteMutation = useDeleteWriterProfile();
  const deleteBusy = deleteMutation.isPending;

  const toggleFeatured = useCallback(
    (w: WriterProfile) => {
      setActionError(null);
      const next = !w.featured;
      updateMutation.mutate(
        { writerId: w.id, payload: { featured: next } },
        {
          onSuccess: () =>
            toast.success(next ? t("toasts.featuredOn") : t("toasts.featuredOff")),
          onError: (e) =>
            setActionError(formatApiError(e, t("errors.updateFailed"))),
        },
      );
    },
    [updateMutation, t],
  );

  const openDelete = useCallback((w: WriterProfile) => {
    setDeleteError(null);
    setDeleteTarget(w);
  }, []);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
      onError: (e) =>
        setDeleteError(formatApiError(e, t("errors.deleteFailed"))),
    });
  };

  const totalPages = Math.max(1, meta.totalPages);
  const effectivePage = Math.min(page, totalPages);
  if (meta.total > 0 && page > totalPages) {
    setPage(totalPages);
  }

  const columns = useMemo<ChamferedTableColumn<WriterProfile>[]>(
    () => [
      {
        key: "writer",
        header: t("headers.writer"),
        width: "26%",
        cellClassName: "flex min-w-0 items-center gap-3 px-5 py-3",
        cell: (w) => {
          const avatar = writerAvatar(w);
          return (
            <>
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element -- small admin thumbnail, varied hosts
                <img
                  src={avatar}
                  alt=""
                  className="h-9 w-9 shrink-0 rounded-full object-cover border border-[var(--tott-card-border)]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--tott-elevated)] text-xs font-semibold text-[var(--tott-gold)]"
                >
                  {nameInitials(writerRowName(w))}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium" style={{ color: "#DBC99E" }}>
                  {writerRowName(w)}
                </p>
                <p className="mt-0.5 truncate text-xs text-[var(--tott-muted)]">
                  {w.user?.username || w.user?.full_name || "—"}
                </p>
              </div>
            </>
          );
        },
      },
      {
        key: "headline",
        header: t("headers.headline"),
        width: "24%",
        cellClassName:
          "px-5 py-3 text-sm text-[var(--tott-muted)] flex items-center min-w-0",
        cell: (w) => (
          <span className="truncate">{w.headline?.trim() || "—"}</span>
        ),
      },
      {
        key: "kind",
        header: t("headers.kind"),
        width: "12%",
        cell: (w) =>
          w.creator_kind ? (
            <span className="inline-flex max-w-full rounded-full bg-[var(--tott-elevated)] px-2.5 py-1 text-xs font-medium text-foreground">
              <span className="truncate">
                {KNOWN_KINDS.has(w.creator_kind)
                  ? tKinds(w.creator_kind as "musician")
                  : w.creator_kind}
              </span>
            </span>
          ) : (
            <span className="text-sm text-[var(--tott-muted)]">—</span>
          ),
      },
      {
        key: "location",
        header: t("headers.location"),
        width: "14%",
        cellClassName:
          "px-5 py-3 text-sm text-[var(--tott-muted)] flex items-center min-w-0",
        cell: (w) => (
          <span className="truncate">{w.location?.trim() || "—"}</span>
        ),
      },
      {
        key: "featured",
        header: t("headers.featured"),
        width: "12%",
        align: "center",
        cellClassName: "px-5 py-3 flex items-center justify-center",
        cell: (w) => (
          <button
            type="button"
            onClick={() => toggleFeatured(w)}
            disabled={updateMutation.isPending}
            title={w.featured ? t("featuredOn") : t("featuredOff")}
            aria-label={w.featured ? t("featuredOn") : t("featuredOff")}
            className={[
              "relative h-5 w-9 rounded-full transition-colors disabled:opacity-50",
              w.featured
                ? "bg-[var(--tott-gold)]"
                : "border border-[var(--tott-card-border)] bg-[var(--tott-elevated)]",
            ].join(" ")}
          >
            <span
              className={[
                "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all",
                w.featured ? "start-4" : "start-0.5",
              ].join(" ")}
            />
          </button>
        ),
      },
      {
        key: "actions",
        header: "",
        width: "12%",
        align: "end",
        cellClassName: "flex items-center justify-end gap-2 px-3 py-3",
        cell: (w) => (
          <>
            <Link
              href={`/admin/writers/${w.id}/edit`}
              className="rounded p-1 text-gray-400 hover:text-foreground"
              title={t("edit")}
            >
              <PenLineIcon />
            </Link>
            <button
              type="button"
              onClick={() => openDelete(w)}
              className="rounded p-1 text-gray-400 hover:text-red-400"
              title={t("delete.confirm")}
            >
              <TrashIcon />
            </button>
          </>
        ),
      },
    ],
    [t, tKinds, toggleFeatured, openDelete, updateMutation.isPending],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-foreground">
          {t("pageTitle")}
        </h1>
        <Link
          href="/admin/writers/create"
          className="flex items-center gap-1.5 rounded-lg border border-[var(--tott-gold)]/60 bg-[var(--tott-gold)]/10 px-3 py-1.5 text-xs font-medium text-[var(--tott-gold)] hover:bg-[var(--tott-gold)]/20 transition-colors"
        >
          <PlusIcon />
          {t("addNew")}
        </Link>
      </div>

      <input
        type="text"
        placeholder={t("searchPlaceholder")}
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="w-full max-w-sm rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground placeholder-gray-500 outline-none focus:border-gray-500"
      />

      {loadError && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-3 text-sm text-red-200">
          <span>{loadError}</span>
          <button
            type="button"
            onClick={() => writersQuery.refetch()}
            className="shrink-0 underline hover:no-underline"
          >
            {t("tryAgain")}
          </button>
        </div>
      )}
      {actionError && (
        <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-3 text-sm text-red-200">
          {actionError}
        </div>
      )}

      <ChamferedTable
        columns={columns}
        rows={writers}
        rowKey={(w) => w.id}
        loading={loading}
        loadingLabel={t("loading")}
        emptyLabel={debouncedSearch ? t("empty.noMatch") : t("empty.none")}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 text-xs text-gray-400">
          <button
            type="button"
            disabled={loading || effectivePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="disabled:opacity-40"
          >
            {t("pagination.previous")}
          </button>
          <span>
            {t("pagination.pageOf", { page: effectivePage, totalPages })}
          </span>
          <button
            type="button"
            disabled={loading || effectivePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="disabled:opacity-40"
          >
            {t("pagination.next")}
          </button>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div
            className="w-full max-w-sm rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-6 shadow-xl"
          >
            <h2 className="mb-2 text-base font-semibold">
              {t("delete.title")}
            </h2>
            <p className="mb-4 text-sm text-gray-400">
              {t("delete.description", { name: writerRowName(deleteTarget) })}
            </p>
            {deleteError && (
              <p className="mb-3 text-xs text-red-400">{deleteError}</p>
            )}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  if (deleteBusy) return;
                  setDeleteTarget(null);
                  setDeleteError(null);
                }}
                disabled={deleteBusy}
                className="rounded-lg px-4 py-1.5 text-sm text-gray-400 hover:text-foreground disabled:opacity-40"
              >
                {t("delete.cancel")}
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleteBusy}
                className="rounded-lg bg-red-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-40"
              >
                {deleteBusy ? t("delete.confirmBusy") : t("delete.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

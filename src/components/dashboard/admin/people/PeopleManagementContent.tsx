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
import { usePeopleAdmin } from "@/hooks/queries/people";
import { useDeletePerson } from "@/hooks/mutations/people";
import { personPortrait, type PersonProfile, type PeopleListMeta } from "@/services/people.service";
import { formatApiError } from "@/lib/api/error-message";
import { resolveArticleMediaSrc } from "@/lib/content/article-media-url";

const PAGE_LIMIT = 10;

const emptyMeta: PeopleListMeta = {
  total: 0,
  page: 1,
  limit: PAGE_LIMIT,
  totalPages: 1,
};

function nameInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  const year = new Date(d).getFullYear();
  return Number.isNaN(year) ? "—" : String(year);
}

export function PeopleManagementContent() {
  const t = useTranslations("Dashboard.people");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PersonProfile | null>(null);
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
    () => ({ page, limit: PAGE_LIMIT, search: debouncedSearch || undefined }),
    [page, debouncedSearch],
  );

  const peopleQuery = usePeopleAdmin(queryParams);
  const people = peopleQuery.data?.people ?? [];
  const meta = peopleQuery.data?.meta ?? emptyMeta;
  const loading = peopleQuery.isPending;
  const loadError = peopleQuery.error ? formatApiError(peopleQuery.error, t("list.errors.loadFailed")) : null;

  const deleteMutation = useDeletePerson();
  const deleteBusy = deleteMutation.isPending;

  const openDelete = useCallback((p: PersonProfile) => {
    setDeleteError(null);
    setDeleteTarget(p);
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

  const columns = useMemo<ChamferedTableColumn<PersonProfile>[]>(
    () => [
      {
        key: "person",
        header: t("list.headers.person"),
        width: "30%",
        cellClassName: "flex min-w-0 items-center gap-3 px-5 py-3",
        cell: (p) => {
          const portrait = personPortrait(p);
          const src = portrait ? resolveArticleMediaSrc(portrait) : null;
          return (
            <>
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={src}
                  alt=""
                  className="h-9 w-9 shrink-0 rounded-full object-cover border border-[var(--tott-card-border)]"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              ) : (
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--tott-elevated)] text-xs font-semibold text-[var(--tott-gold)]">
                  {nameInitials(p.full_name)}
                </span>
              )}
              <p className="truncate text-sm font-medium text-[var(--tott-dash-gold-text)]">
                {p.full_name}
              </p>
            </>
          );
        },
      },
      {
        key: "dates",
        header: t("list.headers.lifespan"),
        width: "16%",
        cellClassName: "px-5 py-3 text-sm text-[var(--tott-muted)] flex items-center",
        cell: (p) => (
          <span dir="ltr">
            {formatDate(p.birth_date)}
            {p.death_date ? ` – ${formatDate(p.death_date)}` : ""}
          </span>
        ),
      },
      {
        key: "bio",
        header: t("list.headers.biography"),
        width: "42%",
        cellClassName: "px-5 py-3 text-sm text-[var(--tott-muted)] flex items-center min-w-0",
        cell: (p) => (
          <span className="truncate">{p.biography?.trim() || "—"}</span>
        ),
      },
      {
        key: "actions",
        header: "",
        width: "12%",
        align: "end",
        cellClassName: "flex items-center justify-end gap-2 px-3 py-3",
        cell: (p) => (
          <>
            <Link
              href={`/admin/people/${p.id}/edit`}
              className="rounded p-1 text-[var(--tott-muted)] hover:text-foreground"
              title={t("list.edit")}
            >
              <PenLineIcon />
            </Link>
            <button
              type="button"
              onClick={() => openDelete(p)}
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
          href="/admin/people/create"
          className="flex items-center gap-1.5 rounded-lg border border-[var(--tott-gold)]/60 bg-[var(--tott-gold)]/10 px-3 py-1.5 text-xs font-medium text-[var(--tott-gold)] hover:bg-[var(--tott-gold)]/20 transition-colors"
        >
          <PlusIcon />
          {t("list.addNew")}
        </Link>
      </div>

      <input
        type="text"
        placeholder={t("list.searchPlaceholder")}
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="w-full max-w-sm rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground placeholder:text-[var(--tott-muted)] outline-none focus:border-[var(--tott-card-border)]"
      />

      {loadError && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-3 text-sm text-red-200">
          <span>{loadError}</span>
          <button type="button" onClick={() => peopleQuery.refetch()} className="shrink-0 underline hover:no-underline">
            {t("list.tryAgain")}
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
        rows={people}
        rowKey={(p) => p.id}
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

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div
            className="w-full max-w-sm rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-6 shadow-xl"
          >
            <h2 className="mb-2 text-base font-semibold">{t("list.deleteModal.title")}</h2>
            <p className="mb-4 text-sm text-[var(--tott-muted)]">
              {t("list.deleteModal.description", { name: deleteTarget.full_name })}
            </p>
            {deleteError && <p className="mb-3 text-xs text-red-400">{deleteError}</p>}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => { if (!deleteBusy) { setDeleteTarget(null); setDeleteError(null); } }}
                disabled={deleteBusy}
                className="rounded-lg px-4 py-1.5 text-sm text-[var(--tott-muted)] hover:text-foreground disabled:opacity-40"
              >
                {t("list.deleteModal.cancel")}
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleteBusy}
                className="rounded-lg bg-red-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-40"
              >
                {deleteBusy ? t("list.deleteModal.confirmBusy") : t("list.deleteModal.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

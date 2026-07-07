"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import {
  PlusIcon,
  TrashIcon,
  PenLineIcon,
  ChevronRightIcon,
} from "@/components/ui/icons";
import {
  ChamferedTable,
  type ChamferedTableColumn,
} from "@/components/ui/ChamferedTable";
import { useWritersAdmin } from "@/hooks/queries/writers";
import {
  useSetWriterEditorialBoard,
  useSetWriterFeatured,
  useLinkWriterAccount,
  useDeleteWriterProfile,
} from "@/hooks/mutations/writers";
import { useCreateAdminUser } from "@/hooks/mutations/users";
import {
  writerAvatar,
  writerDisplayName,
  type WriterProfile,
  type WritersListMeta,
} from "@/services/writers.service";
import { formatApiError } from "@/lib/api/error-message";
import { nameInitials } from "./initials";
import { CreateAccountModal } from "./CreateAccountModal";

const PAGE_LIMIT = 10;

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

/** A writer row plus its translation-group role for flat rendering. */
type DisplayWriter = WriterProfile & {
  isPrimary: boolean;
  isChild: boolean;
  /** Count of other language versions; 0 on child rows and untranslated writers. */
  siblingCount: number;
  /** True on the primary when no version matches the admin's UI language. */
  missingLocale: boolean;
  groupExpanded: boolean;
  groupId: string;
};

export function WritersManagementContent() {
  const t = useTranslations("Dashboard.writersManagement.list");
  const locale = useLocale();

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WriterProfile | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [accountTarget, setAccountTarget] = useState<WriterProfile | null>(null);

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

  // Cluster the page's rows by translation group (client-side), so a writer with
  // several language versions shows as one collapsible row. The same admin
  // session that adds a writer's languages creates them together, so
  // createdAt-DESC order keeps a group's rows on one page.
  // ponytail: per-page grouping; true page-by-group paging needs the server to
  // dedupe (dedupe=group) — do that when the backend change ships.
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const toggleGroup = useCallback((gid: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(gid)) next.delete(gid);
      else next.add(gid);
      return next;
    });
  }, []);

  const displayWriters = useMemo<DisplayWriter[]>(() => {
    const byGroup = new Map<string, WriterProfile[]>();
    for (const w of writers) {
      const gid = w.translation_group_id ?? w.id;
      if (!byGroup.has(gid)) byGroup.set(gid, []);
      byGroup.get(gid)!.push(w);
    }
    const stamp = (w: WriterProfile) => w.updatedAt ?? w.createdAt ?? "";
    const out: DisplayWriter[] = [];
    for (const [gid, members] of byGroup) {
      // Prefer the version in the admin's UI language; fall back to the newest.
      const localeMatch = members.find((m) => m.language === locale);
      const newest = [...members].sort((a, b) =>
        stamp(b).localeCompare(stamp(a)),
      )[0];
      const primary = localeMatch ?? newest;
      const children = members.filter((m) => m.id !== primary.id);
      const expanded = expandedGroups.has(gid);
      out.push({
        ...primary,
        // Board + Homepage toggles and the account link are group-level: show
        // ON / linked when ANY version is, so a mixed group doesn't read wrong.
        editorial_board: members.some((m) => m.editorial_board),
        featured: members.some((m) => m.featured),
        user_id: members.find((m) => m.user_id)?.user_id ?? primary.user_id,
        isPrimary: true,
        isChild: false,
        siblingCount: children.length,
        missingLocale: !localeMatch,
        groupExpanded: expanded,
        groupId: gid,
      });
      if (expanded) {
        for (const child of children) {
          out.push({
            ...child,
            isPrimary: false,
            isChild: true,
            siblingCount: 0,
            missingLocale: false,
            groupExpanded: expanded,
            groupId: gid,
          });
        }
      }
    }
    return out;
  }, [writers, expandedGroups, locale]);

  const deleteMutation = useDeleteWriterProfile();
  const createAccountMutation = useCreateAdminUser();
  const linkAccountMutation = useLinkWriterAccount();
  const deleteBusy = deleteMutation.isPending;

  const featuredMutation = useSetWriterFeatured();
  const toggleFeatured = useCallback(
    (w: WriterProfile) => {
      setActionError(null);
      const next = !w.featured;
      // Sets the flag on every language version of the writer in one call.
      featuredMutation.mutate(
        { writerId: w.id, value: next },
        {
          onSuccess: () =>
            toast.success(next ? t("toasts.featuredOn") : t("toasts.featuredOff")),
          onError: (e) =>
            setActionError(formatApiError(e, t("errors.updateFailed"))),
        },
      );
    },
    [featuredMutation, t],
  );

  const boardMutation = useSetWriterEditorialBoard();
  const toggleBoard = useCallback(
    (w: WriterProfile) => {
      setActionError(null);
      const next = !w.editorial_board;
      // Sets the flag on every language version of the writer in one call.
      boardMutation.mutate(
        { writerId: w.id, value: next },
        {
          onSuccess: () =>
            toast.success(next ? t("toasts.boardOn") : t("toasts.boardOff")),
          onError: (e) =>
            setActionError(formatApiError(e, t("errors.updateFailed"))),
        },
      );
    },
    [boardMutation, t],
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

  const columns = useMemo<ChamferedTableColumn<DisplayWriter>[]>(
    () => [
      {
        key: "writer",
        header: t("headers.writer"),
        width: "30%",
        cellClassName: "flex min-w-0 items-center gap-2 px-5 py-3",
        cell: (w) => {
          const avatar = writerAvatar(w);
          return (
            <>
              {w.isPrimary && w.siblingCount > 0 ? (
                <button
                  type="button"
                  onClick={() => toggleGroup(w.groupId)}
                  aria-expanded={w.groupExpanded}
                  aria-label={t("translations.toggle")}
                  className={`shrink-0 rounded p-1 text-[var(--tott-dash-gold-label)] transition-transform hover:bg-[var(--tott-dash-ghost-hover)] ${
                    w.groupExpanded ? "rotate-90" : "rtl:-scale-x-100"
                  }`}
                >
                  <ChevronRightIcon />
                </button>
              ) : (
                <span
                  className="shrink-0"
                  style={{ width: w.isChild ? "1.75rem" : "1.5rem" }}
                />
              )}
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
                <p
                  className={`truncate text-sm font-medium ${
                    w.isChild
                      ? "text-[var(--tott-muted)]"
                      : "text-[var(--tott-dash-gold-text)]"
                  }`}
                >
                  {writerRowName(w)}
                </p>
                <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-[var(--tott-muted)]">
                  {w.language ? (
                    <span className="shrink-0 rounded bg-[var(--tott-elevated)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                      {w.language}
                    </span>
                  ) : null}
                  {w.isPrimary && w.siblingCount > 0 ? (
                    <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider">
                      {t("translations.count", { count: w.siblingCount })}
                    </span>
                  ) : null}
                  {w.isPrimary && w.missingLocale ? (
                    <span
                      className="shrink-0 rounded bg-[var(--tott-status-coral)]/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--tott-status-coral)]"
                      title={t("translations.needsTranslationTooltip", { locale })}
                    >
                      {t("translations.needsTranslation")}
                    </span>
                  ) : null}
                  {w.user?.username || w.user?.full_name ? (
                    <span className="truncate">
                      {w.user?.username || w.user?.full_name}
                    </span>
                  ) : null}
                </div>
              </div>
            </>
          );
        },
      },
      {
        key: "headline",
        header: t("headers.headline"),
        width: "20%",
        cellClassName:
          "px-5 py-3 text-sm text-[var(--tott-muted)] flex items-center min-w-0",
        cell: (w) => (
          <span className="truncate">{w.headline?.trim() || "—"}</span>
        ),
      },
      {
        key: "location",
        header: t("headers.location"),
        width: "12%",
        cellClassName:
          "px-5 py-3 text-sm text-[var(--tott-muted)] flex items-center min-w-0",
        cell: (w) => (
          <span className="truncate">{w.location?.trim() || "—"}</span>
        ),
      },
      {
        key: "account",
        header: t("headers.account"),
        width: "12%",
        cellClassName: "px-5 py-3 flex items-center min-w-0",
        // One account per writer (translation group) — all versions share it.
        // Show the cell on the primary row only; the account links to the
        // whole group at once.
        cell: (w) =>
          w.isChild ? null : w.user_id ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
              {t("account.linked")}
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setAccountTarget(w)}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tott-gold)]/60 bg-[var(--tott-gold)]/10 px-2.5 py-1 text-xs font-medium text-[var(--tott-gold)] hover:bg-[var(--tott-gold)]/20 transition-colors"
            >
              {t("account.createAction")}
            </button>
          ),
      },
      {
        key: "featured",
        header: t("headers.featured"),
        width: "8%",
        align: "center",
        cellClassName: "px-5 py-3 flex items-center justify-center",
        // Group-level toggle on the primary row only — flags every language
        // version at once; child rows leave the cell empty.
        cell: (w) =>
          w.isChild ? null : (
            <button
              type="button"
              onClick={() => toggleFeatured(w)}
              disabled={featuredMutation.isPending}
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
                  "absolute top-0.5 h-4 w-4 rounded-full bg-[var(--tott-dash-surface)] transition-all",
                  w.featured ? "start-4" : "start-0.5",
                ].join(" ")}
              />
            </button>
          ),
      },
      {
        key: "editorial_board",
        header: t("headers.editorialBoard"),
        width: "8%",
        align: "center",
        cellClassName: "px-5 py-3 flex items-center justify-center",
        // One toggle per writer (translation group), shown on the primary row
        // only — it flags every language version at once. Child rows leave the
        // cell empty so admins don't flip each version by hand.
        cell: (w) =>
          w.isChild ? null : (
            <button
              type="button"
              onClick={() => toggleBoard(w)}
              disabled={boardMutation.isPending}
              title={w.editorial_board ? t("boardOn") : t("boardOff")}
              aria-label={w.editorial_board ? t("boardOn") : t("boardOff")}
              className={[
                "relative h-5 w-9 rounded-full transition-colors disabled:opacity-50",
                w.editorial_board
                  ? "bg-[var(--tott-gold)]"
                  : "border border-[var(--tott-card-border)] bg-[var(--tott-elevated)]",
              ].join(" ")}
            >
              <span
                className={[
                  "absolute top-0.5 h-4 w-4 rounded-full bg-[var(--tott-dash-surface)] transition-all",
                  w.editorial_board ? "start-4" : "start-0.5",
                ].join(" ")}
              />
            </button>
          ),
      },
      {
        key: "actions",
        header: "",
        width: "8%",
        align: "center",
        cellClassName: "flex items-center justify-center gap-2 px-3 py-3",
        cell: (w) => (
          <>
            <Link
              href={`/admin/writers/${w.id}/edit`}
              className="rounded p-1 text-[var(--tott-muted)] hover:text-foreground"
              title={t("edit")}
            >
              <PenLineIcon />
            </Link>
            <button
              type="button"
              onClick={() => openDelete(w)}
              className="rounded p-1 text-[var(--tott-muted)] hover:text-red-400"
              title={t("delete.confirm")}
            >
              <TrashIcon />
            </button>
          </>
        ),
      },
    ],
    [t, toggleFeatured, toggleBoard, openDelete, toggleGroup, featuredMutation.isPending, boardMutation.isPending],
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
        className="w-full max-w-sm rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground placeholder:text-[var(--tott-muted)] outline-none focus:border-[var(--tott-card-border)]"
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
        rows={displayWriters}
        rowKey={(w) => w.id}
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

      {accountTarget && (
        <CreateAccountModal
          writer={accountTarget}
          busy={createAccountMutation.isPending || linkAccountMutation.isPending}
          onClose={() => setAccountTarget(null)}
          onSubmit={async ({ full_name, email, password }) => {
            const user = await createAccountMutation.mutateAsync({
              full_name,
              email,
              password,
            });
            // Links the new account to every language version at once.
            await linkAccountMutation.mutateAsync({
              writerId: accountTarget.id,
              userId: user.id,
            });
            toast.success(t("account.created"));
            setAccountTarget(null);
          }}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div
            className="w-full max-w-sm rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-6 shadow-xl"
          >
            <h2 className="mb-2 text-base font-semibold">
              {t("delete.title")}
            </h2>
            <p className="mb-4 text-sm text-[var(--tott-muted)]">
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
                className="rounded-lg px-4 py-1.5 text-sm text-[var(--tott-muted)] hover:text-foreground disabled:opacity-40"
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

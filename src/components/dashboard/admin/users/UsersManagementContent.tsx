"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { SearchIcon } from "@/components/ui/icons";
import { FilterDropdown } from "./FilterDropdown";
import { UserActionsDropdown } from "./UserActionsDropdown";
import { ViewProfileModal, EditUserModal, ChangeRoleModal } from "./UserModals";
import { theme } from "@/lib/theme";
import {
  formatContributionsCount,
  formatUserLastActiveRelativeLocalized,
  formatUserRoleLabel,
  formatUserStatusLabel,
} from "@/lib/dashboard/user-table-formatters";
import { USER_STATUS_COLORS, KNOWN_ROLE_SLUGS as KNOWN_ROLE_SLUG_LIST } from "@/lib/dashboard/users-management-constants";
import { USERS_CSV_EXPORT_EVENT } from "@/lib/dashboard/users-export-events";
import { downloadUsersCsv } from "@/lib/export/users-csv";
import {
  getAllUsersForExport,
  type AdminUserListItem,
  type UsersListMeta,
} from "@/services/users.service";
import { useUsers } from "@/hooks/queries/users";
import { useUpdateUserStatus } from "@/hooks/mutations/users";
import { formatApiError } from "@/lib/api/error-message";
import { toast } from "sonner";
import { ChamferedPanel } from "@/components/ui/ChamferedPanel";
import {
  ChamferedTable,
  type ChamferedTableColumn,
} from "@/components/ui/ChamferedTable";

const PAGE_LIMIT = 10;

function displayName(u: AdminUserListItem): string {
  const n = u.full_name?.trim();
  if (n) return n;
  return u.username?.trim() || "—";
}

function initialsFromUser(u: AdminUserListItem): string {
  const source = u.full_name?.trim() || u.username?.trim() || u.email || "";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase() || "?";
}

function statusColor(status: string): string {
  const key = status.trim().toLowerCase();
  return USER_STATUS_COLORS[key] ?? "#9CA3AF";
}

const emptyMeta: UsersListMeta = { total: 0, page: 1, limit: PAGE_LIMIT, totalPages: 1 };

const API_USER_STATUSES = new Set(["active", "pending", "suspended", "inactive"]);

function formatJoinedDateLocal(iso: string | null | undefined, locale: string): string {
  if (!iso?.trim()) return "—";
  const d = new Date(iso.trim());
  if (Number.isNaN(d.getTime())) return "—";
  const loc = locale.startsWith("ar") ? "ar" : "en-US";
  return d.toLocaleDateString(loc, { month: "short", day: "numeric", year: "numeric" });
}

function displayUserStatus(status: string, t: (key: string) => string): string {
  const key = status.trim().toLowerCase();
  if (!key) return "—";
  if (API_USER_STATUSES.has(key)) {
    return t(`statusLabels.${key}`);
  }
  return formatUserStatusLabel(status);
}

const KNOWN_ROLE_SLUGS = new Set<string>(KNOWN_ROLE_SLUG_LIST);

function displayRoleLabel(role: string, tRoles: (key: string) => string): string {
  const slug = role.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (!slug) return formatUserRoleLabel(role);
  if (KNOWN_ROLE_SLUGS.has(slug)) {
    return tRoles(slug);
  }
  return formatUserRoleLabel(role);
}

export function UsersManagementContent() {
  const t = useTranslations("Dashboard.usersManagement");
  const tRoles = useTranslations("Dashboard.adminHome.usersByRole.roles");
  const updateUserStatusMutation = useUpdateUserStatus();
  const [actionError, setActionError] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<null | {
    kind: "view" | "edit" | "role";
    userId: string;
  }>(null);
  const loadFailedMessage = t("errors.loadFailed");

  const statusOptions = useMemo(
    () =>
      (["all", "active", "pending", "suspended", "inactive"] as const).map((value) => ({
        value,
        label: t(`status.${value}`),
      })),
    [t],
  );
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [sortBy] = useState<string>("username");
  const [order, setOrder] = useState<"ASC" | "DESC">("ASC");
  const [page, setPage] = useState(1);

  const roleOptions = useMemo(() => {
    const base = [{ value: "all", label: t("status.all") }];
    return [
      ...base,
      ...Array.from(KNOWN_ROLE_SLUGS).map((slug) => ({
        value: slug,
        label: tRoles(slug),
      })),
    ];
  }, [t, tRoles]);

  const [exportError, setExportError] = useState<string | null>(null);
  const exportBusyRef = useRef(false);
  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    setNowMs(Date.now());
    const id = window.setInterval(() => setNowMs(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  const prevDebouncedRef = useRef(debouncedSearch);
  useEffect(() => {
    if (prevDebouncedRef.current !== debouncedSearch) {
      prevDebouncedRef.current = debouncedSearch;
      setPage(1);
    }
  }, [debouncedSearch]);

  const queryParams = useMemo(
    () => ({
      page,
      limit: PAGE_LIMIT,
      search: debouncedSearch || undefined,
      status:
        statusFilter === "all"
          ? undefined
          : (statusFilter as "active" | "suspended" | "inactive" | "pending"),
      sortBy,
      order,
    }),
    [page, debouncedSearch, statusFilter, sortBy, order],
  );

  // Advanced filter state — driven by the funnel popover, applied client-side
  // (the API doesn't support these fields, so we filter the visible page).
  const [advFilterEmail, setAdvFilterEmail] = useState("");
  const [advFilterMinContrib, setAdvFilterMinContrib] = useState("");
  const [advFilterJoinedAfter, setAdvFilterJoinedAfter] = useState("");

  const usersQuery = useUsers(queryParams, { silent: true });
  // Memoize so the downstream `useMemo` filter pipeline sees a stable
  // reference between renders.
  const allUsers: AdminUserListItem[] = useMemo(
    () => usersQuery.data?.users ?? [],
    [usersQuery.data?.users],
  );
  // Role filter + advanced filters apply on the client because the API only
  // supports status / search / sort.
  const users = useMemo(() => {
    let list = allUsers;
    if (roleFilter !== "all") {
      list = list.filter((u) => u.role.trim().toLowerCase() === roleFilter);
    }
    const emailNeedle = advFilterEmail.trim().toLowerCase();
    if (emailNeedle) {
      list = list.filter((u) => (u.email ?? "").toLowerCase().includes(emailNeedle));
    }
    const minContrib = advFilterMinContrib.trim() ? Number(advFilterMinContrib) : null;
    if (minContrib !== null && Number.isFinite(minContrib)) {
      list = list.filter((u) => (u.contributions_count ?? 0) >= minContrib);
    }
    const joinedAfterDate = advFilterJoinedAfter.trim()
      ? new Date(advFilterJoinedAfter)
      : null;
    if (joinedAfterDate && !Number.isNaN(joinedAfterDate.getTime())) {
      list = list.filter((u) => {
        const j = u.joined_at ? new Date(u.joined_at) : null;
        return j && !Number.isNaN(j.getTime()) && j.getTime() >= joinedAfterDate.getTime();
      });
    }
    return list;
  }, [allUsers, roleFilter, advFilterEmail, advFilterMinContrib, advFilterJoinedAfter]);
  const meta: UsersListMeta = usersQuery.data?.meta ?? emptyMeta;
  const loading = usersQuery.isPending;
  const error = usersQuery.error ? formatApiError(usersQuery.error, loadFailedMessage) : null;

  // Resolve the modal's target from the freshest list so the Change Role /
  // Edit modals reflect updates after a mutation invalidates the query.
  const selectedUser = useMemo(
    () => (activeModal ? allUsers.find((u) => u.id === activeModal.userId) ?? null : null),
    [activeModal, allUsers],
  );

  const totalPages = Math.max(1, meta.totalPages);
  useEffect(() => {
    if (meta.total > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [meta.total, page, totalPages]);

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };
  const handleOrderChange = (value: string) => {
    setOrder(value === "DESC" ? "DESC" : "ASC");
    setPage(1);
  };

  const runExport = useCallback(async () => {
    if (exportBusyRef.current) return;
    exportBusyRef.current = true;
    setExportError(null);
    try {
      const list = await getAllUsersForExport({
        search: debouncedSearch || undefined,
        status:
          statusFilter === "all"
            ? undefined
            : (statusFilter as "active" | "suspended" | "inactive" | "pending"),
        sortBy,
        order,
      });
      downloadUsersCsv(list, "trace-users");
    } catch (e) {
      setExportError(formatApiError(e, loadFailedMessage));
    } finally {
      exportBusyRef.current = false;
    }
  }, [debouncedSearch, statusFilter, sortBy, order, loadFailedMessage]);

  useEffect(() => {
    const onExportRequest = () => {
      void runExport();
    };
    window.addEventListener(USERS_CSV_EXPORT_EVENT, onExportRequest);
    return () => window.removeEventListener(USERS_CSV_EXPORT_EVENT, onExportRequest);
  }, [runExport]);

  const handleRowAction = useCallback(
    (actionId: string, userId: string) => {
      setActionError(null);
      switch (actionId) {
        case "view":
          setActiveModal({ kind: "view", userId });
          return;
        case "edit":
          setActiveModal({ kind: "edit", userId });
          return;
        case "role":
          setActiveModal({ kind: "role", userId });
          return;
        case "verify":
          updateUserStatusMutation.mutate(
            { id: userId, status: "active" },
            {
              onSuccess: () => toast.success(t("toasts.verified")),
              onError: (e) => setActionError(formatApiError(e, loadFailedMessage)),
            },
          );
          return;
        case "suspend":
          updateUserStatusMutation.mutate(
            { id: userId, status: "suspended" },
            {
              onSuccess: () => toast.success(t("toasts.suspended")),
              onError: (e) => setActionError(formatApiError(e, loadFailedMessage)),
            },
          );
          return;
      }
    },
    [updateUserStatusMutation, loadFailedMessage, t],
  );

  const locale = useLocale();
  const columns = useMemo<ChamferedTableColumn<AdminUserListItem>[]>(
    () => [
      {
        key: "contributor",
        header: t("table.contributor"),
        width: "28%",
        cellClassName: "flex min-w-0 items-center gap-3 px-5 py-3",
        cell: (user) => (
          <>
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
              style={{ backgroundColor: "var(--tott-gold-chip-bg)", color: theme.bgDark }}
            >
              {initialsFromUser(user)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium" style={{ color: "var(--tott-dash-gold-text)" }}>
                {displayName(user)}
              </p>
              <p
                className="mt-0.5 truncate text-xs text-[var(--tott-muted)]"
                title={user.email}
              >
                {user.email || "—"}
              </p>
            </div>
          </>
        ),
      },
      {
        key: "role",
        header: t("table.role"),
        width: "12%",
        cell: (user) => (
          <span className="inline-flex max-w-full rounded-full bg-[var(--tott-elevated)] px-2.5 py-1 text-xs font-medium text-foreground">
            <span className="truncate">{displayRoleLabel(user.role, tRoles)}</span>
          </span>
        ),
      },
      {
        key: "status",
        header: t("table.status"),
        width: "12%",
        cell: (user) => {
          const color = statusColor(user.status);
          return (
            <span className="flex min-w-0 items-center gap-1.5">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="truncate text-sm" style={{ color }}>
                {displayUserStatus(user.status, t)}
              </span>
            </span>
          );
        },
      },
      {
        key: "joined",
        header: t("table.joined"),
        width: "13%",
        headerClassName:
          "px-5 py-3 text-sm font-medium text-[var(--tott-dash-gold-label)] flex items-center justify-start text-start whitespace-nowrap",
        cellClassName:
          "px-5 py-3 text-sm flex items-center whitespace-nowrap text-[var(--tott-muted)]",
        cell: (user) => formatJoinedDateLocal(user.joined_at, locale),
      },
      {
        key: "lastActive",
        header: t("table.lastActive"),
        width: "13%",
        headerClassName:
          "px-5 py-3 text-sm font-medium text-[var(--tott-dash-gold-label)] flex items-center justify-start text-start whitespace-nowrap",
        cellClassName:
          "px-5 py-3 text-sm flex items-center whitespace-nowrap text-[var(--tott-muted)]",
        cell: (user) =>
          formatUserLastActiveRelativeLocalized(user.last_active_at, nowMs, locale),
      },
      {
        key: "contributions",
        header: t("table.contributions"),
        width: "12%",
        align: "center",
        cellClassName:
          "px-5 py-3 text-sm text-foreground flex items-center justify-center text-center tabular-nums",
        cell: (user) => formatContributionsCount(user.contributions_count),
      },
      {
        key: "actions",
        header: "",
        width: "10%",
        align: "end",
        cellClassName: "flex items-center justify-end px-3 py-3",
        cell: (user) => (
          <UserActionsDropdown userId={user.id} onAction={handleRowAction} />
        ),
      },
    ],
    [t, tRoles, locale, nowMs, handleRowAction],
  );

  const effectivePage = Math.min(page, totalPages);
  const startItem = users.length === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
  const endItem = users.length === 0 ? 0 : (meta.page - 1) * meta.limit + users.length;

  return (
    <div className="mx-auto max-w-full space-y-4 px-3 py-4 sm:space-y-6 sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-8">
      <ChamferedPanel className="px-4 py-4 sm:px-6 sm:py-5">
      <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
        <div className="relative min-w-0 flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tott-muted)]">
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full min-w-0 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] py-2.5 pl-10 pr-3 text-sm text-foreground placeholder:text-[var(--tott-muted)] focus:border-[var(--tott-muted)] focus:outline-none sm:pr-4"
          />
        </div>
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-stretch sm:gap-2 lg:flex-nowrap lg:items-center">
          <FilterDropdown
            options={statusOptions}
            value={statusFilter}
            onChange={handleStatusChange}
          />
          <FilterDropdown
            options={roleOptions}
            value={roleFilter}
            onChange={(v) => {
              setRoleFilter(v);
              setPage(1);
            }}
          />
          <AdvancedFilterPopover
            order={order}
            onOrderChange={handleOrderChange}
            email={advFilterEmail}
            onEmailChange={setAdvFilterEmail}
            minContrib={advFilterMinContrib}
            onMinContribChange={setAdvFilterMinContrib}
            joinedAfter={advFilterJoinedAfter}
            onJoinedAfterChange={setAdvFilterJoinedAfter}
            ascLabel={t("order.ASC")}
            descLabel={t("order.DESC")}
          />
        </div>
      </div>

      {exportError ? (
        <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-3 text-sm text-red-200 sm:px-4">
          <p className="wrap-break-word">{exportError}</p>
          <button
            type="button"
            onClick={() => void runExport()}
            className="mt-2 text-xs font-medium text-amber-400 underline hover:text-amber-300"
          >
            {t("tryExportAgain")}
          </button>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-3 text-sm text-red-200 sm:px-4">
          <p className="wrap-break-word">{error}</p>
          <button
            type="button"
            onClick={() => void usersQuery.refetch()}
            className="mt-2 text-xs font-medium text-amber-400 underline hover:text-amber-300"
          >
            {t("tryAgain")}
          </button>
        </div>
      ) : null}

      {actionError ? (
        <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-3 text-sm text-red-200 sm:px-4">
          <p className="wrap-break-word">{actionError}</p>
        </div>
      ) : null}

      <div className="mt-6 sm:mt-8">
        <ChamferedTable
          columns={columns}
          rows={users}
          rowKey={(u) => u.id}
          loading={loading}
          loadingLabel={t("loading")}
          emptyLabel={t("empty")}
          renderNarrow={(user) => (
            <UserCardNarrow
              user={user}
              nowMs={nowMs}
              t={t}
              tRoles={tRoles}
              onAction={handleRowAction}
            />
          )}
        />
      </div>

      <div className="mt-4 flex flex-col items-stretch justify-between gap-3 sm:mt-5 sm:flex-row sm:items-center">
        <p className="text-center text-sm text-[var(--tott-muted)] sm:text-left">
          {t("pagination.showing", {
            start: meta.total === 0 ? 0 : startItem,
            end: endItem,
            total: meta.total,
          })}
        </p>
        <div className="flex items-center justify-center gap-2 sm:justify-end">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={loading || effectivePage <= 1 || meta.total === 0}
            className="min-h-[44px] rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--tott-dash-control-hover)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[var(--tott-dash-surface-inset)] sm:min-h-0"
          >
            {t("pagination.previous")}
          </button>
          <span className="min-w-26 shrink-0 text-center text-xs text-[var(--tott-muted)] sm:min-w-0">
            {t("pagination.pageOf", { page: effectivePage, totalPages })}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={loading || effectivePage >= totalPages || meta.total === 0}
            className="min-h-[44px] rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--tott-dash-control-hover)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[var(--tott-dash-surface-inset)] sm:min-h-0"
          >
            {t("pagination.next")}
          </button>
        </div>
      </div>
      </ChamferedPanel>

      <ViewProfileModal
        user={activeModal?.kind === "view" ? selectedUser : null}
        onClose={() => setActiveModal(null)}
      />
      <EditUserModal
        user={activeModal?.kind === "edit" ? selectedUser : null}
        onClose={() => setActiveModal(null)}
      />
      <ChangeRoleModal
        user={activeModal?.kind === "role" ? selectedUser : null}
        onClose={() => setActiveModal(null)}
      />
    </div>
  );
}

/**
 * "Premium" multi-condition filter popover — visual trigger is
 * `Button-4.svg` (40×40 funnel). Click opens a panel of advanced filter
 * conditions that work on top of the outside Status / Role / Sort By
 * pills: email contains, minimum contributions, joined-after date, and
 * the sort direction (ASC / DESC). The active filter count shows as a
 * badge on the trigger. All surfaces use theme tokens, so the popover
 * works in light and dark themes without extra plumbing.
 */
function AdvancedFilterPopover({
  order,
  onOrderChange,
  email,
  onEmailChange,
  minContrib,
  onMinContribChange,
  joinedAfter,
  onJoinedAfterChange,
  ascLabel,
  descLabel,
}: {
  order: "ASC" | "DESC";
  onOrderChange: (v: "ASC" | "DESC") => void;
  email: string;
  onEmailChange: (v: string) => void;
  minContrib: string;
  onMinContribChange: (v: string) => void;
  joinedAfter: string;
  onJoinedAfterChange: (v: string) => void;
  ascLabel: string;
  descLabel: string;
}) {
  const t = useTranslations("Dashboard.usersManagement");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const activeCount =
    (email.trim() ? 1 : 0) +
    (minContrib.trim() ? 1 : 0) +
    (joinedAfter.trim() ? 1 : 0) +
    (order !== "ASC" ? 1 : 0);

  const clearAll = () => {
    onEmailChange("");
    onMinContribChange("");
    onJoinedAfterChange("");
    onOrderChange("ASC");
  };

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={t("filters.title")}
        title={t("filters.title")}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] text-foreground transition-colors hover:bg-[var(--tott-dash-control-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--tott-muted)]"
        style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 40 40"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M13.334 13.334H26.6673V15.144C26.6672 15.586 26.4916 16.0098 26.179 16.3223L22.5007 20.0007V25.834L17.5007 27.5007V20.4173L13.7673 16.3107C13.4885 16.0039 13.334 15.6043 13.334 15.1898V13.334Z" />
        </svg>
        {activeCount > 0 ? (
          <span
            aria-hidden
            className="absolute -end-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold"
            style={{
              backgroundColor: "var(--tott-dark-pill)",
              color: "var(--tott-dark-pill-fg)",
            }}
          >
            {activeCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label={t("filters.title")}
          className="absolute end-0 top-full z-30 mt-2 w-80 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-2)] p-4 shadow-lg"
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">{t("filters.title")}</p>
            {activeCount > 0 ? (
              <button
                type="button"
                onClick={clearAll}
                className="text-xs font-medium text-[var(--tott-muted)] transition-colors hover:text-foreground"
              >
                {t("filters.clearAll")}
              </button>
            ) : null}
          </div>

          <FilterField label={t("filters.emailContains")}>
            <input
              type="text"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder={t("filters.emailPlaceholder")}
              className={FILTER_INPUT_CLASS}
            />
          </FilterField>

          <FilterField label={t("filters.minContributions")}>
            <input
              type="number"
              min={0}
              value={minContrib}
              onChange={(e) => onMinContribChange(e.target.value)}
              placeholder="0"
              className={FILTER_INPUT_CLASS}
            />
          </FilterField>

          <FilterField label={t("filters.joinedAfter")}>
            <input
              type="date"
              value={joinedAfter}
              onChange={(e) => onJoinedAfterChange(e.target.value)}
              className={FILTER_INPUT_CLASS}
            />
          </FilterField>

          <FilterField label={t("filters.sortOrder")}>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onOrderChange("ASC")}
                className={`rounded-md border px-3 py-2 text-xs font-medium transition-colors ${
                  order === "ASC"
                    ? "border-[var(--tott-dash-gold-label)] bg-[var(--tott-elevated)] text-foreground"
                    : "border-[var(--tott-card-border)] bg-transparent text-[var(--tott-muted)] hover:bg-[var(--tott-dash-control-hover)]"
                }`}
              >
                {ascLabel}
              </button>
              <button
                type="button"
                onClick={() => onOrderChange("DESC")}
                className={`rounded-md border px-3 py-2 text-xs font-medium transition-colors ${
                  order === "DESC"
                    ? "border-[var(--tott-dash-gold-label)] bg-[var(--tott-elevated)] text-foreground"
                    : "border-[var(--tott-card-border)] bg-transparent text-[var(--tott-muted)] hover:bg-[var(--tott-dash-control-hover)]"
                }`}
              >
                {descLabel}
              </button>
            </div>
          </FilterField>

          <div className="mt-1 flex justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-[var(--tott-dash-control-hover)]"
            >
              {t("filters.done")}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const FILTER_INPUT_CLASS =
  "w-full rounded-md border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] px-3 py-2 text-sm text-foreground placeholder:text-[var(--tott-muted)] focus:border-[var(--tott-muted)] focus:outline-none";

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3 flex flex-col gap-1.5">
      <label className="text-[11px] font-medium uppercase tracking-wide text-[var(--tott-dash-gold-label)]">
        {label}
      </label>
      {children}
    </div>
  );
}

function UserCardNarrow({
  user,
  nowMs,
  t,
  tRoles,
  onAction,
}: {
  user: AdminUserListItem;
  nowMs: number;
  t: ReturnType<typeof useTranslations>;
  tRoles: ReturnType<typeof useTranslations>;
  onAction: (actionId: string, userId: string) => void;
}) {
  const locale = useLocale();
  const color = statusColor(user.status);
  return (
    <div className="px-3 py-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
            style={{ backgroundColor: "var(--tott-gold-chip-bg)", color: theme.bgDark }}
          >
            {initialsFromUser(user)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium" style={{ color: "var(--tott-dash-gold-text)" }}>
              {displayName(user)}
            </p>
            <p className="mt-0.5 truncate text-xs text-[var(--tott-muted)]" title={user.email}>
              {user.email || "—"}
            </p>
          </div>
        </div>
        <UserActionsDropdown userId={user.id} onAction={onAction} />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
        <div className="flex flex-col gap-0.5">
          <dt className="text-[10px] uppercase text-[var(--tott-dash-gold-label)]">{t("table.role")}</dt>
          <dd className="text-foreground">{displayRoleLabel(user.role, tRoles)}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-[10px] uppercase text-[var(--tott-dash-gold-label)]">{t("table.status")}</dt>
          <dd className="flex items-center gap-1.5">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
            <span style={{ color }}>{displayUserStatus(user.status, t)}</span>
          </dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-[10px] uppercase text-[var(--tott-dash-gold-label)]">{t("table.joined")}</dt>
          <dd className="text-[var(--tott-muted)]">{formatJoinedDateLocal(user.joined_at, locale)}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-[10px] uppercase text-[var(--tott-dash-gold-label)]">{t("table.lastActive")}</dt>
          <dd className="text-[var(--tott-muted)]">
            {formatUserLastActiveRelativeLocalized(user.last_active_at, nowMs, locale)}
          </dd>
        </div>
        <div className="col-span-2 flex flex-col gap-0.5">
          <dt className="text-[10px] uppercase text-[var(--tott-dash-gold-label)]">
            {t("table.contributions")}
          </dt>
          <dd className="tabular-nums text-foreground">
            {formatContributionsCount(user.contributions_count)}
          </dd>
        </div>
      </dl>
    </div>
  );
}

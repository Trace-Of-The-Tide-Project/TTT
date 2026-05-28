"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { SearchIcon, EyeIcon, XIcon, RefreshCwIcon } from "@/components/ui/icons";
import { ChamferedPanel } from "@/components/ui/ChamferedPanel";

const TABS = ["all", "pending", "approved", "rejected"] as const;
const STATUS_KEYS = ["pending", "approved", "rejected", "draft"];
const ROWS_PER_PAGE = 8;

type Tab = (typeof TABS)[number];

const STATUS_COLOR: Record<string, string> = {
  pending: "#E67E22",
  approved: "#2ECC71",
  rejected: "#ef4444",
  draft: "#3498DB",
};

export function normStatus(s: string | null | undefined): string {
  return (s ?? "pending").toLowerCase();
}

function formatDate(iso: string | null | undefined, locale: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export type ApplicationReviewListProps<T> = {
  /** i18n namespace, e.g. "Dashboard.residency". */
  ns: string;
  items: T[];
  isLoading: boolean;
  errorMessage: string | null;
  onRetry: () => void;
  acting: boolean;
  getId: (item: T) => string;
  getStatus: (item: T) => string;
  getPrimary: (item: T) => string;
  getSecondary: (item: T) => string;
  getDate: (item: T) => string | null | undefined;
  /** Lowercased text used by the search box. */
  searchText: (item: T) => string;
  detailTitle: (item: T) => string;
  /** Detail-modal body (field rows). Rendered above the action buttons. */
  renderDetail: (item: T) => ReactNode;
  /** Approve / reject. Resolve to refresh + close on success. */
  onSetStatus: (item: T, status: "approved" | "rejected") => void;
};

export function ApplicationReviewList<T>({
  ns,
  items,
  isLoading,
  errorMessage,
  onRetry,
  acting,
  getId,
  getStatus,
  getPrimary,
  getSecondary,
  getDate,
  searchText,
  detailTitle,
  renderDetail,
  onSetStatus,
}: ApplicationReviewListProps<T>) {
  const t = useTranslations(ns);
  const locale = useLocale();
  const statusLabel = (s: string) =>
    STATUS_KEYS.includes(s) ? t(`statuses.${s}`) : s;

  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<T | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items.length };
    for (const it of items) {
      const s = normStatus(getStatus(it));
      c[s] = (c[s] ?? 0) + 1;
    }
    return c;
  }, [items, getStatus]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((it) => {
      if (tab !== "all" && normStatus(getStatus(it)) !== tab) return false;
      if (!q) return true;
      return searchText(it).toLowerCase().includes(q);
    });
  }, [items, tab, search, getStatus, searchText]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (safePage - 1) * ROWS_PER_PAGE,
    safePage * ROWS_PER_PAGE,
  );

  const StatusBadge = ({ s }: { s: string }) => (
    <span
      className="rounded-full px-2 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: `${STATUS_COLOR[s] ?? "#9CA3AF"}20`,
        color: STATUS_COLOR[s] ?? "#9CA3AF",
      }}
    >
      {statusLabel(s)}
    </span>
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-foreground">{t("title")}</h1>
        <p className="mt-0.5 text-sm text-[var(--tott-muted)]">{t("subtitle")}</p>
      </div>

      <div className="flex w-full flex-wrap gap-1 rounded-xl bg-[var(--tott-elevated)] p-1">
        {TABS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setTab(id);
              setPage(1);
            }}
            className={`flex-1 rounded-md px-3 py-2.5 text-sm font-medium transition-all ${
              tab === id
                ? "bg-[var(--tott-dash-control-bg)] text-foreground"
                : "bg-transparent text-[var(--tott-tab-inactive)] hover:text-[var(--tott-tab-inactive-hover)]"
            }`}
          >
            {t(`tabs.${id}`)}
            <span className="ms-1.5 text-xs opacity-60">{counts[id] ?? 0}</span>
          </button>
        ))}
      </div>

      {errorMessage ? (
        <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-200">
          <p>{errorMessage}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-amber-400 underline hover:text-amber-300"
          >
            <span className="[&_svg]:h-3.5 [&_svg]:w-3.5">
              <RefreshCwIcon />
            </span>
            {t("list.retry")}
          </button>
        </div>
      ) : null}

      <ChamferedPanel className="px-3 pb-4 pt-4 min-[504px]:px-6 min-[504px]:pb-6 min-[504px]:pt-6">
        <div className="relative mb-4">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <SearchIcon />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={t("list.searchPlaceholder")}
            className="w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] py-2.5 pl-10 pr-4 text-sm text-foreground placeholder-gray-500 outline-none focus:border-gray-500"
          />
        </div>

        {isLoading ? (
          <div className="px-5 py-12 text-center text-sm text-gray-500">
            {t("list.loading")}
          </div>
        ) : pageRows.length === 0 ? (
          <div className="border border-[var(--tott-card-border)] px-5 py-12 text-center text-sm text-gray-500">
            {search.trim() || tab !== "all" ? t("list.noMatch") : t("list.empty")}
          </div>
        ) : (
          <>
            <div className="hidden sm:block">
              <div className="grid grid-cols-[28%_28%_18%_14%_12%] border border-[var(--tott-card-border)]">
                {["primary", "secondary", "date", "status", ""].map((h, i) => (
                  <div
                    key={i}
                    className="px-4 py-3 text-start text-sm font-medium text-[var(--tott-dash-gold-label)]"
                  >
                    {h ? t(`list.headers.${h}`) : ""}
                  </div>
                ))}
              </div>
              {pageRows.map((it) => {
                const s = normStatus(getStatus(it));
                return (
                  <div
                    key={getId(it)}
                    className="grid grid-cols-[28%_28%_18%_14%_12%] border-x border-b border-[var(--tott-card-border)] transition-colors hover:bg-[var(--tott-elevated)]"
                  >
                    <div className="truncate px-4 py-3 text-sm font-medium text-foreground">
                      {getPrimary(it)}
                    </div>
                    <div className="truncate px-4 py-3 text-sm text-[var(--tott-muted)]">
                      {getSecondary(it) || "—"}
                    </div>
                    <div className="px-4 py-3 text-sm text-[var(--tott-muted)]">
                      {formatDate(getDate(it), locale)}
                    </div>
                    <div className="px-4 py-3">
                      <StatusBadge s={s} />
                    </div>
                    <div className="flex items-center justify-end px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setSelected(it)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-[var(--tott-dash-control-hover)]"
                      >
                        <span className="[&_svg]:h-3.5 [&_svg]:w-3.5">
                          <EyeIcon />
                        </span>
                        {t("list.review")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2 sm:hidden">
              {pageRows.map((it) => {
                const s = normStatus(getStatus(it));
                return (
                  <button
                    key={getId(it)}
                    type="button"
                    onClick={() => setSelected(it)}
                    className="block w-full rounded-lg border border-[var(--tott-card-border)] p-3 text-start"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {getPrimary(it)}
                      </span>
                      <StatusBadge s={s} />
                    </div>
                    <p className="mt-1 truncate text-xs text-[var(--tott-muted)]">
                      {(getSecondary(it) || "—") +
                        " · " +
                        formatDate(getDate(it), locale)}
                    </p>
                  </button>
                );
              })}
            </div>

            {filtered.length > ROWS_PER_PAGE ? (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="text-gray-500">
                  {t("list.pagination", {
                    from: (safePage - 1) * ROWS_PER_PAGE + 1,
                    to: Math.min(safePage * ROWS_PER_PAGE, filtered.length),
                    total: filtered.length,
                  })}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={safePage <= 1}
                    onClick={() => setPage((x) => x - 1)}
                    className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-4 py-2 text-gray-400 transition-colors hover:text-foreground disabled:opacity-40"
                  >
                    {t("list.previous")}
                  </button>
                  <button
                    type="button"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((x) => x + 1)}
                    className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-4 py-2 text-gray-400 transition-colors hover:text-foreground disabled:opacity-40"
                  >
                    {t("list.next")}
                  </button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </ChamferedPanel>

      {selected ? (
        <ReviewModal
          ns={ns}
          title={detailTitle(selected)}
          status={normStatus(getStatus(selected))}
          statusLabel={statusLabel}
          acting={acting}
          onClose={() => setSelected(null)}
          onApprove={() => onSetStatus(selected, "approved")}
          onReject={() => onSetStatus(selected, "rejected")}
        >
          {renderDetail(selected)}
        </ReviewModal>
      ) : null}
    </div>
  );
}

function ReviewModal({
  ns,
  title,
  status,
  statusLabel,
  acting,
  onClose,
  onApprove,
  onReject,
  children,
}: {
  ns: string;
  title: string;
  status: string;
  statusLabel: (s: string) => string;
  acting: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  children: ReactNode;
}) {
  const t = useTranslations(ns);
  const isPending = status === "pending" || status === "draft";

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4">
      <button
        type="button"
        aria-label={t("detail.close")}
        onClick={() => !acting && onClose()}
        className="absolute inset-0 bg-black/45 backdrop-blur-md"
      />
      <div className="relative mx-4 w-full max-w-lg rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-base font-bold text-foreground">{title}</h2>
          <button
            type="button"
            onClick={() => !acting && onClose()}
            disabled={acting}
            className="shrink-0 rounded-lg p-1 text-gray-400 transition-colors hover:bg-[var(--tott-dash-ghost-hover)] hover:text-foreground disabled:opacity-40"
            aria-label={t("detail.close")}
          >
            <XIcon />
          </button>
        </div>

        <dl className="space-y-3 text-sm">
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-xs font-medium text-[var(--tott-dash-gold-label)]">
              {t("detail.status")}
            </dt>
            <dd>
              <span
                className="rounded-full px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: `${STATUS_COLOR[status] ?? "#9CA3AF"}20`,
                  color: STATUS_COLOR[status] ?? "#9CA3AF",
                }}
              >
                {statusLabel(status)}
              </span>
            </dd>
          </div>
          {children}
        </dl>

        {isPending ? (
          <div className="mt-5 flex justify-end gap-2 border-t border-[var(--tott-card-border)] pt-5">
            <button
              type="button"
              onClick={onReject}
              disabled={acting}
              className="rounded-lg border border-red-900/60 bg-red-950/40 px-4 py-2 text-sm font-medium text-red-200 transition-colors hover:bg-red-950/70 disabled:opacity-50"
            >
              {t("detail.reject")}
            </button>
            <button
              type="button"
              onClick={onApprove}
              disabled={acting}
              className="rounded-lg border border-[#2ECC71]/40 bg-[#2ECC71]/20 px-4 py-2 text-sm font-medium text-[#2ECC71] transition-colors hover:bg-[#2ECC71]/30 disabled:opacity-50"
            >
              {t("detail.approve")}
            </button>
          </div>
        ) : (
          <div className="mt-5 border-t border-[var(--tott-card-border)] pt-4 text-xs text-gray-500">
            {t("detail.alreadyHandled")}
          </div>
        )}
      </div>
    </div>
  );
}

/** Shared detail-field row for use inside `renderDetail`. */
export function DetailRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-xs font-medium text-[var(--tott-dash-gold-label)]">
        {label}
      </dt>
      <dd className="text-end text-sm text-foreground">{children}</dd>
    </div>
  );
}

/** Shared multi-line detail block for use inside `renderDetail`. */
export function DetailBlock({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <dt className="mb-1 text-xs font-medium text-[var(--tott-dash-gold-label)]">
        {label}
      </dt>
      <dd className="whitespace-pre-wrap rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground">
        {children}
      </dd>
    </div>
  );
}

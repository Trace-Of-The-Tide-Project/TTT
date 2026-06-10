"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { SearchIcon, EyeIcon, XIcon, RefreshCwIcon } from "@/components/ui/icons";
import { mutationToast } from "@/hooks/useMutationToast";
import { ChamferedPanel } from "@/components/ui/ChamferedPanel";
import { formatApiError } from "@/lib/api/error-message";
import {
  ensureMagazineIssueType,
  MAGAZINE_ISSUE_TYPE_NAME,
  type ContributionListItem,
} from "@/services/contributions.service";
import { useContributions } from "@/hooks/queries/contributions";
import {
  useApproveIssueProposal,
  useRejectIssueProposal,
} from "@/hooks/mutations/magazine-intake";

const KINDS = ["article", "essay", "collection", "slides"] as const;
const TABS = ["all", "pending", "published", "archived"] as const;
const STATUS_KEYS = ["pending", "published", "archived", "rejected", "draft"];
const ROWS_PER_PAGE = 8;

type Tab = (typeof TABS)[number];

/** Status colors resolve to theme-aware CSS vars (defined in
 *  `globals.css` with light + dark variants). */
const statusColor: Record<string, string> = {
  pending: "var(--tott-status-amber)",
  published: "var(--tott-status-emerald)",
  archived: "var(--tott-muted)",
  rejected: "var(--tott-status-coral)",
  draft: "var(--tott-status-blue)",
};
const STATUS_FALLBACK = "var(--tott-muted)";

function normStatus(s: string | null | undefined): string {
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

export function MagazineIssuesManagementContent() {
  const t = useTranslations("Dashboard.magazineIssues");
  const locale = useLocale();
  const statusLabel = (s: string) =>
    STATUS_KEYS.includes(s) ? t(`statuses.${s}`) : s;

  // One-time bootstrap: make sure the dedicated contribution type exists
  // so public "Start an Issue" submissions get tagged correctly. Admin is
  // authenticated here, so creating it (if missing) is allowed.
  useEffect(() => {
    ensureMagazineIssueType().catch(() => {
      /* non-fatal: list still works, public form falls back to "Other" */
    });
  }, []);

  const query = useContributions(1, 100);
  const proposals = useMemo(() => {
    const items = query.data?.items ?? [];
    return items.filter(
      (c) =>
        (c.type?.name ?? "").toLowerCase() ===
        MAGAZINE_ISSUE_TYPE_NAME.toLowerCase(),
    );
  }, [query.data]);

  const approve = useApproveIssueProposal();
  const reject = useRejectIssueProposal();

  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ContributionListItem | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: proposals.length };
    for (const p of proposals) {
      const s = normStatus(p.status);
      c[s] = (c[s] ?? 0) + 1;
    }
    return c;
  }, [proposals]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return proposals.filter((p) => {
      if (tab !== "all" && normStatus(p.status) !== tab) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        (p.contributor_name ?? "").toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q)
      );
    });
  }, [proposals, tab, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (safePage - 1) * ROWS_PER_PAGE,
    safePage * ROWS_PER_PAGE,
  );

  const resetPage = () => setPage(1);

  const loadError = query.error
    ? formatApiError(query.error, t("list.loadError"))
    : null;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-foreground">{t("title")}</h1>
        <p className="mt-0.5 text-sm text-[var(--tott-muted)]">{t("subtitle")}</p>
      </div>

      {/* Status tabs */}
      <div className="flex w-full flex-wrap gap-1 rounded-xl bg-[var(--tott-elevated)] p-1">
        {TABS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setTab(id);
              resetPage();
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

      {loadError ? (
        <div
          className="rounded-lg border px-4 py-3 text-sm"
          style={{
            borderColor: "color-mix(in srgb, var(--tott-status-coral) 40%, transparent)",
            backgroundColor: "color-mix(in srgb, var(--tott-status-coral) 12%, transparent)",
            color: "var(--tott-status-coral)",
          }}
        >
          <p>{loadError}</p>
          <button
            type="button"
            onClick={() => void query.refetch()}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium underline hover:opacity-80"
            style={{ color: "var(--tott-accent-gold)" }}
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
          <span
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--tott-muted)" }}
          >
            <SearchIcon />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetPage();
            }}
            placeholder={t("list.searchPlaceholder")}
            className="w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] py-2.5 pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-[var(--tott-muted)] focus:border-[var(--tott-accent-gold)]"
          />
        </div>

        {query.isLoading ? (
          <div
            className="px-5 py-12 text-center text-sm"
            style={{ color: "var(--tott-muted)" }}
          >
            {t("list.loading")}
          </div>
        ) : pageRows.length === 0 ? (
          <div
            className="border border-[var(--tott-card-border)] px-5 py-12 text-center text-sm"
            style={{ color: "var(--tott-muted)" }}
          >
            {search.trim() || tab !== "all"
              ? t("list.noMatch")
              : t("list.empty")}
          </div>
        ) : (
          <>
            {/* Wide table ≥640px */}
            <div className="hidden sm:block">
              <div className="grid grid-cols-[34%_18%_20%_16%_12%] border border-[var(--tott-card-border)]">
                {["title", "submittedBy", "date", "status", ""].map((h, i) => (
                  <div
                    key={i}
                    className="px-4 py-3 text-start text-sm font-medium text-[var(--tott-dash-gold-label)]"
                  >
                    {h ? t(`list.headers.${h}`) : ""}
                  </div>
                ))}
              </div>
              {pageRows.map((p) => {
                const s = normStatus(p.status);
                return (
                  <div
                    key={p.id}
                    className="grid grid-cols-[34%_18%_20%_16%_12%] border-x border-b border-[var(--tott-card-border)] transition-colors hover:bg-[var(--tott-elevated)]"
                  >
                    <div className="px-4 py-3 text-sm font-medium text-foreground">
                      {p.title}
                    </div>
                    <div className="px-4 py-3 text-sm text-[var(--tott-muted)]">
                      {p.contributor_name || p.user?.full_name || "—"}
                    </div>
                    <div className="px-4 py-3 text-sm text-[var(--tott-muted)]">
                      {formatDate(p.submission_date || p.createdAt, locale)}
                    </div>
                    <div className="px-4 py-3">
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: `color-mix(in srgb, ${statusColor[s] ?? STATUS_FALLBACK} 12%, transparent)`,
                          color: statusColor[s] ?? STATUS_FALLBACK,
                        }}
                      >
                        {statusLabel(s)}
                      </span>
                    </div>
                    <div className="flex items-center justify-end px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setSelected(p)}
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

            {/* Stacked cards <640px */}
            <div className="space-y-2 sm:hidden">
              {pageRows.map((p) => {
                const s = normStatus(p.status);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelected(p)}
                    className="block w-full rounded-lg border border-[var(--tott-card-border)] p-3 text-start"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {p.title}
                      </span>
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: `color-mix(in srgb, ${statusColor[s] ?? STATUS_FALLBACK} 12%, transparent)`,
                          color: statusColor[s] ?? STATUS_FALLBACK,
                        }}
                      >
                        {statusLabel(s)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[var(--tott-muted)]">
                      {(p.contributor_name || p.user?.full_name || "—") +
                        " · " +
                        formatDate(p.submission_date || p.createdAt, locale)}
                    </p>
                  </button>
                );
              })}
            </div>

            {filtered.length > ROWS_PER_PAGE ? (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
                <span style={{ color: "var(--tott-muted)" }}>
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
                    className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-4 py-2 text-[var(--tott-muted)] transition-colors hover:text-foreground disabled:opacity-40"
                  >
                    {t("list.previous")}
                  </button>
                  <button
                    type="button"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((x) => x + 1)}
                    className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-4 py-2 text-[var(--tott-muted)] transition-colors hover:text-foreground disabled:opacity-40"
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
          item={selected}
          approving={approve.isPending}
          rejecting={reject.isPending}
          onClose={() => setSelected(null)}
          onApprove={(kind) => {
            mutationToast(
              () => approve.mutateAsync({ contribution: selected, kind }),
              {
                loading: "Publishing issue…",
                success: t("toast.approved"),
                error: t("toast.approveError"),
              },
            )
              .then(() => setSelected(null))
              .catch(() => {});
          }}
          onReject={() => {
            mutationToast(
              () => reject.mutateAsync(selected.id),
              {
                loading: "Rejecting proposal…",
                success: t("toast.rejected"),
                error: t("toast.rejectError"),
              },
            )
              .then(() => setSelected(null))
              .catch(() => {});
          }}
        />
      ) : null}
    </div>
  );
}

type ReviewModalProps = {
  item: ContributionListItem;
  approving: boolean;
  rejecting: boolean;
  onClose: () => void;
  onApprove: (kind: string) => void;
  onReject: () => void;
};

function ReviewModal({
  item,
  approving,
  rejecting,
  onClose,
  onApprove,
  onReject,
}: ReviewModalProps) {
  const t = useTranslations("Dashboard.magazineIssues");
  const statusLabel = (s: string) =>
    STATUS_KEYS.includes(s) ? t(`statuses.${s}`) : s;
  const [kind, setKind] = useState<string>("article");
  const busy = approving || rejecting;
  const s = normStatus(item.status);
  const isPending = s === "pending" || s === "draft";

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4">
      <button
        type="button"
        aria-label={t("detail.close")}
        onClick={() => !busy && onClose()}
        className="absolute inset-0 backdrop-blur-md"
        style={{ backgroundColor: "var(--tott-overlay)" }}
      />
      <div className="relative mx-4 w-full max-w-lg rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-base font-bold text-foreground">{item.title}</h2>
          <button
            type="button"
            onClick={() => !busy && onClose()}
            disabled={busy}
            className="shrink-0 rounded-lg p-1 text-[var(--tott-muted)] transition-colors hover:bg-[var(--tott-dash-ghost-hover)] hover:text-foreground disabled:opacity-40"
            aria-label={t("detail.close")}
          >
            <XIcon />
          </button>
        </div>

        <dl className="space-y-3 text-sm">
          <Row label={t("detail.submitter")}>
            {item.contributor_name || item.user?.full_name || "—"}
          </Row>
          <Row label={t("detail.email")}>
            {item.contributor_email || item.user?.email || "—"}
          </Row>
          {item.contributor_phone || item.phone_number ? (
            <Row label={t("detail.phone")}>
              {item.contributor_phone || item.phone_number}
            </Row>
          ) : null}
          <Row label={t("detail.status")}>
            <span
              className="rounded-full px-2 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: `color-mix(in srgb, ${statusColor[s] ?? STATUS_FALLBACK} 12%, transparent)`,
                color: statusColor[s] ?? STATUS_FALLBACK,
              }}
            >
              {statusLabel(s)}
            </span>
          </Row>
          <div>
            <dt className="mb-1 text-xs font-medium text-[var(--tott-dash-gold-label)]">
              {t("detail.description")}
            </dt>
            <dd className="whitespace-pre-wrap rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground">
              {item.description || "—"}
            </dd>
          </div>
        </dl>

        {isPending ? (
          <div className="mt-5 border-t border-[var(--tott-card-border)] pt-5">
            <label className="mb-1.5 block text-xs font-medium text-foreground">
              {t("detail.kindLabel")}
            </label>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              disabled={busy}
              className="w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-4 py-2.5 text-sm text-foreground outline-none focus:border-[var(--tott-accent-gold)] disabled:opacity-50"
            >
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {t(`kinds.${k}`)}
                </option>
              ))}
            </select>
            <p
              className="mt-2 text-xs"
              style={{ color: "var(--tott-muted)" }}
            >
              {t("detail.approveHint")}
            </p>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={onReject}
                disabled={busy}
                className="rounded-lg border px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{
                  borderColor: "color-mix(in srgb, var(--tott-status-coral) 60%, transparent)",
                  backgroundColor: "color-mix(in srgb, var(--tott-status-coral) 18%, transparent)",
                  color: "var(--tott-status-coral)",
                }}
              >
                {rejecting ? t("detail.rejecting") : t("detail.reject")}
              </button>
              <button
                type="button"
                onClick={() => onApprove(kind)}
                disabled={busy}
                className="rounded-lg border px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{
                  borderColor: "color-mix(in srgb, var(--tott-status-emerald) 60%, transparent)",
                  backgroundColor: "color-mix(in srgb, var(--tott-status-emerald) 18%, transparent)",
                  color: "var(--tott-status-emerald)",
                }}
              >
                {approving ? t("detail.approving") : t("detail.approve")}
              </button>
            </div>
          </div>
        ) : (
          <div
            className="mt-5 border-t border-[var(--tott-card-border)] pt-4 text-xs"
            style={{ color: "var(--tott-muted)" }}
          >
            {t("detail.alreadyHandled")}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
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

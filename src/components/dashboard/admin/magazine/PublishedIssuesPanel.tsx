"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  SearchIcon,
  PlusIcon,
  PenLineIcon,
  TrashIcon,
  RefreshCwIcon,
  StarIcon,
} from "@/components/ui/icons";
import { mutationToast } from "@/hooks/useMutationToast";
import { ChamferedPanel } from "@/components/ui/ChamferedPanel";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatApiError } from "@/lib/api/error-message";
import { resolveArticleMediaSrc } from "@/lib/content/article-media-url";
import { useMagazineIssues } from "@/hooks/queries/magazine-issues";
import {
  useDeleteMagazineIssue,
  useSetCurrentIssue,
} from "@/hooks/mutations/magazine-issues";
import type { MagazineIssue } from "@/services/magazine-issues.service";

const KINDS = ["editorial", "crowdfunded"] as const;
const TABS = ["all", "published", "draft", "archived"] as const;
const STATUS_KEYS = ["pending", "published", "archived", "rejected", "draft"];
const ROWS_PER_PAGE = 9;
const ISSUE_BASE = "/admin/magazine-issues";

type Tab = (typeof TABS)[number];

const statusColor: Record<string, string> = {
  pending: "var(--tott-status-amber)",
  published: "var(--tott-status-emerald)",
  archived: "var(--tott-muted)",
  rejected: "var(--tott-status-coral)",
  draft: "var(--tott-status-blue)",
};
const STATUS_FALLBACK = "var(--tott-muted)";

function normStatus(s: string | null | undefined): string {
  return (s ?? "draft").toLowerCase();
}

export function PublishedIssuesPanel() {
  const t = useTranslations("Dashboard.magazineIssues");
  const statusLabel = (s: string) =>
    STATUS_KEYS.includes(s) ? t(`statuses.${s}`) : s;
  const kindLabel = (k: string | null | undefined) => {
    const v = (k ?? "").toLowerCase();
    return (KINDS as readonly string[]).includes(v) ? t(`kinds.${v}`) : k || "—";
  };

  // Admin sees every issue regardless of status (public only requests published).
  const query = useMagazineIssues({ limit: 100 });
  const issues = useMemo(() => query.data ?? [], [query.data]);

  const remove = useDeleteMagazineIssue();
  const setCurrent = useSetCurrentIssue();

  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<MagazineIssue | null>(null);
  const [makingCurrent, setMakingCurrent] = useState<MagazineIssue | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: issues.length };
    for (const it of issues) {
      const s = normStatus(it.status);
      c[s] = (c[s] ?? 0) + 1;
    }
    return c;
  }, [issues]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return issues.filter((it) => {
      if (tab !== "all" && normStatus(it.status) !== tab) return false;
      if (!q) return true;
      return (
        it.title.toLowerCase().includes(q) ||
        (it.category ?? "").toLowerCase().includes(q) ||
        (it.edition ?? "").toLowerCase().includes(q) ||
        (it.kind ?? "").toLowerCase().includes(q)
      );
    });
  }, [issues, tab, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (safePage - 1) * ROWS_PER_PAGE,
    safePage * ROWS_PER_PAGE,
  );
  const resetPage = () => setPage(1);

  const loadError = query.error
    ? formatApiError(query.error, t("published.list.loadError"))
    : null;

  return (
    <div className="space-y-4">
      {/* Status tabs + New button */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-1 flex-wrap gap-1 rounded-xl bg-[var(--tott-elevated)] p-1">
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
              {t(`published.tabs.${id}`)}
              <span className="ms-1.5 text-xs opacity-60">{counts[id] ?? 0}</span>
            </button>
          ))}
        </div>
        <Link
          href={`${ISSUE_BASE}/create`}
          className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
          style={{
            borderColor: "color-mix(in srgb, var(--tott-accent-gold) 50%, transparent)",
            backgroundColor: "color-mix(in srgb, var(--tott-accent-gold) 14%, transparent)",
            color: "var(--tott-accent-gold)",
          }}
        >
          <span className="[&_svg]:h-4 [&_svg]:w-4">
            <PlusIcon />
          </span>
          {t("published.new")}
        </Link>
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
            {t("published.list.retry")}
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
            placeholder={t("published.list.searchPlaceholder")}
            className="w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] py-2.5 pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-[var(--tott-muted)] focus:border-[var(--tott-accent-gold)]"
          />
        </div>

        {query.isLoading ? (
          <div className="px-5 py-12 text-center text-sm" style={{ color: "var(--tott-muted)" }}>
            {t("published.list.loading")}
          </div>
        ) : pageRows.length === 0 ? (
          <div
            className="border border-[var(--tott-card-border)] px-5 py-12 text-center text-sm"
            style={{ color: "var(--tott-muted)" }}
          >
            {search.trim() || tab !== "all"
              ? t("published.list.noMatch")
              : t("published.list.empty")}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pageRows.map((it) => (
                <IssueCard
                  key={it.id}
                  issue={it}
                  statusLabel={statusLabel}
                  kindLabel={kindLabel}
                  currentBadge={t("published.card.currentBadge")}
                  editLabel={t("published.list.edit")}
                  deleteLabel={t("published.list.delete")}
                  setCurrentLabel={t("published.card.setCurrent")}
                  onSetCurrent={() => setMakingCurrent(it)}
                  onDelete={() => setDeleting(it)}
                />
              ))}
            </div>

            {filtered.length > ROWS_PER_PAGE ? (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
                <span style={{ color: "var(--tott-muted)" }}>
                  {t("published.list.pagination", {
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
                    {t("published.list.previous")}
                  </button>
                  <button
                    type="button"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((x) => x + 1)}
                    className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-4 py-2 text-[var(--tott-muted)] transition-colors hover:text-foreground disabled:opacity-40"
                  >
                    {t("published.list.next")}
                  </button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </ChamferedPanel>

      <ConfirmDialog
        open={Boolean(makingCurrent)}
        title={t("published.card.setCurrentTitle")}
        description={
          makingCurrent
            ? t("published.card.setCurrentBody", { title: makingCurrent.title })
            : undefined
        }
        confirmLabel={t("published.card.setCurrent")}
        confirmBusyLabel={t("published.card.settingCurrent")}
        busy={setCurrent.isPending}
        onClose={() => !setCurrent.isPending && setMakingCurrent(null)}
        onConfirm={() => {
          if (!makingCurrent) return;
          mutationToast(() => setCurrent.mutateAsync(makingCurrent.id), {
            loading: t("published.card.settingCurrent"),
            success: t("published.card.setCurrentDone"),
            error: t("published.card.setCurrentError"),
          })
            .then(() => setMakingCurrent(null))
            .catch(() => {});
        }}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title={t("published.delete.title")}
        description={deleting ? t("published.delete.body", { title: deleting.title }) : undefined}
        confirmLabel={t("published.delete.confirm")}
        confirmBusyLabel={t("published.delete.deleting")}
        destructive
        busy={remove.isPending}
        onClose={() => !remove.isPending && setDeleting(null)}
        onConfirm={() => {
          if (!deleting) return;
          mutationToast(() => remove.mutateAsync(deleting.id), {
            loading: t("published.toast.deleting"),
            success: t("published.toast.deleted"),
            error: t("published.toast.deleteError"),
          })
            .then(() => setDeleting(null))
            .catch(() => {});
        }}
      />
    </div>
  );
}

function IssueCard({
  issue,
  statusLabel,
  kindLabel,
  currentBadge,
  editLabel,
  deleteLabel,
  setCurrentLabel,
  onSetCurrent,
  onDelete,
}: {
  issue: MagazineIssue;
  statusLabel: (s: string) => string;
  kindLabel: (k: string | null | undefined) => string;
  currentBadge: string;
  editLabel: string;
  deleteLabel: string;
  setCurrentLabel: string;
  onSetCurrent: () => void;
  onDelete: () => void;
}) {
  const s = normStatus(issue.status);
  const cover = issue.cover_image ? resolveArticleMediaSrc(issue.cover_image) : "";
  const isPublished = s === "published";

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)]">
      <div className="relative aspect-[16/10] bg-[var(--tott-elevated)]">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt=""
            className="h-full w-full object-cover"
            onError={(e) => ((e.target as HTMLImageElement).style.opacity = "0")}
          />
        ) : null}
        {issue.is_current ? (
          <span
            className="absolute start-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold shadow [&_svg]:h-3 [&_svg]:w-3"
            style={{
              backgroundColor: "var(--tott-accent-gold)",
              color: "var(--tott-well-bg)",
            }}
          >
            <StarIcon />
            {currentBadge}
          </span>
        ) : null}
        <span
          className="absolute end-2 top-2 rounded-full px-2 py-0.5 text-[11px] font-medium"
          style={{
            backgroundColor: `color-mix(in srgb, ${statusColor[s] ?? STATUS_FALLBACK} 85%, black)`,
            color: "white",
          }}
        >
          {statusLabel(s)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--tott-dash-gold-label)]">
          {[issue.edition ? `#${issue.edition}` : null, kindLabel(issue.kind)]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-foreground">
          {issue.title}
        </h3>

        <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-[var(--tott-card-border)] pt-3">
          <Link
            href={`${ISSUE_BASE}/edit/${issue.id}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-[var(--tott-dash-control-hover)] [&_svg]:h-3.5 [&_svg]:w-3.5"
          >
            <PenLineIcon />
            {editLabel}
          </Link>
          {isPublished && !issue.is_current ? (
            <button
              type="button"
              onClick={onSetCurrent}
              className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-opacity hover:opacity-90 [&_svg]:h-3.5 [&_svg]:w-3.5"
              style={{
                borderColor: "color-mix(in srgb, var(--tott-accent-gold) 50%, transparent)",
                color: "var(--tott-accent-gold)",
              }}
            >
              <StarIcon />
              {setCurrentLabel}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onDelete}
            aria-label={deleteLabel}
            className="ms-auto inline-flex items-center justify-center rounded-lg border p-1.5 transition-opacity hover:opacity-90 [&_svg]:h-3.5 [&_svg]:w-3.5"
            style={{
              borderColor: "color-mix(in srgb, var(--tott-status-coral) 40%, transparent)",
              color: "var(--tott-status-coral)",
            }}
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

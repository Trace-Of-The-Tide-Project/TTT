"use client";

import { useCallback, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ChamferedPanel } from "@/components/ui/ChamferedPanel";
import { PlusIcon, PenLineIcon, ChevronRightIcon, TrashIcon } from "@/components/ui/icons";
import { useArticles } from "@/hooks/queries/articles";
import { useMagazineIssues } from "@/hooks/queries/magazine-issues";
import { useDeleteArticle, useUpdateArticle } from "@/hooks/mutations/articles";
import { mutationToast } from "@/hooks/useMutationToast";
import { ConfirmDeleteArticleModal } from "@/components/dashboard/admin/articles/articles-editor/modals/ConfirmDeleteArticleModal";
import { formatApiError } from "@/lib/api/error-message";
import type { ArticleListItem, ArticleProduct } from "@/services/articles.service";

const CREATE_HREF = "/admin/magazine/articles/create";

const STATUS_FALLBACK = "var(--tott-muted)";
const statusColor: Record<string, string> = {
  published: "var(--tott-status-emerald)",
  draft: "var(--tott-muted)",
  pending_review: "var(--tott-status-amber)",
  in_editing: "var(--tott-status-amber)",
  needs_revision: "var(--tott-status-coral)",
  scheduled: "var(--tott-accent-tide)",
  archived: "var(--tott-muted)",
  flagged: "var(--tott-status-coral)",
};

/** The magazine article pool: every product=magazine article, assigned to an
 * issue or loose. Loose articles can be attached to an issue later from the
 * issue's Articles panel. */
/** Article row plus its translation-group role for flat rendering. */
type DisplayArticle = ArticleListItem & {
  isPrimary: boolean;
  isChild: boolean;
  /** Count of other language versions; 0 on child rows and untranslated articles. */
  siblingCount: number;
  /** True on the primary when no version matches the admin's UI language. */
  missingLocale: boolean;
  groupExpanded: boolean;
  groupId: string;
};

export function MagazineArticlesContent() {
  const t = useTranslations("Dashboard.magazineArticles");
  const locale = useLocale();

  const articlesQuery = useArticles(
    { product: "magazine" satisfies ArticleProduct, limit: 100 },
    { silent: true },
  );
  const issuesQuery = useMagazineIssues({ limit: 100 });

  const issueTitleById = useMemo(() => {
    const map = new Map<string, string>();
    for (const it of issuesQuery.data ?? []) map.set(it.id, it.title);
    return map;
  }, [issuesQuery.data]);

  const rawArticles = articlesQuery.data?.data ?? [];
  const loading = articlesQuery.isPending;
  const error = articlesQuery.error
    ? formatApiError(articlesQuery.error, t("loadError"))
    : null;

  // Cluster rows by translation group so an article with several language
  // versions shows as one collapsible row, matching writers/books lists.
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const toggleGroup = useCallback((gid: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(gid)) next.delete(gid);
      else next.add(gid);
      return next;
    });
  }, []);

  const articles = useMemo<DisplayArticle[]>(() => {
    const byGroup = new Map<string, ArticleListItem[]>();
    for (const a of rawArticles) {
      const gid = a.translation_group_id || a.translation_of || a.id;
      if (!byGroup.has(gid)) byGroup.set(gid, []);
      byGroup.get(gid)!.push(a);
    }
    const stamp = (a: ArticleListItem) => a.updatedAt ?? a.createdAt ?? "";
    const out: DisplayArticle[] = [];
    for (const [gid, members] of byGroup) {
      const localeMatch = members.find((m) => m.language === locale);
      const newest = [...members].sort((a, b) => stamp(b).localeCompare(stamp(a)))[0];
      const primary = localeMatch ?? newest;
      const children = members.filter((m) => m.id !== primary.id);
      const expanded = expandedGroups.has(gid);
      out.push({
        ...primary,
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
  }, [rawArticles, expandedGroups, locale]);

  const [deleteTarget, setDeleteTarget] = useState<DisplayArticle | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const deleteMutation = useDeleteArticle({ silent: true });
  const deleteBusy = deleteMutation.isPending;

  const updateMutation = useUpdateArticle();
  const [featureBusyId, setFeatureBusyId] = useState<string | null>(null);
  const toggleFeatured = useCallback(
    (a: DisplayArticle) => {
      const next = !a.is_featured;
      // Only published articles surface on the magazine homepage. Never flag a
      // non-published one; unflagging stays allowed.
      if (next && (a.status ?? "draft").toLowerCase() !== "published") return;
      setFeatureBusyId(a.id);
      void mutationToast(
        () => updateMutation.mutateAsync({ articleId: a.id, payload: { is_featured: next } }),
        {
          loading: t("feature.loading"),
          success: next ? t("feature.featured") : t("feature.unfeatured"),
          error: t("feature.failed"),
        },
      ).finally(() => setFeatureBusyId(null));
    },
    [updateMutation, t],
  );

  const closeDeleteModal = useCallback(() => {
    if (deleteBusy) return;
    setDeleteTarget(null);
    setDeleteError(null);
  }, [deleteBusy]);

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    setDeleteError(null);
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
        articlesQuery.refetch();
      },
      onError: (e) => setDeleteError(formatApiError(e, t("deleteError"))),
    });
  }, [deleteTarget, deleteMutation, articlesQuery, t]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-foreground">{t("title")}</h1>
          <p className="mt-1 text-sm text-[var(--tott-muted)]">{t("subtitle")}</p>
        </div>
        <Link
          href={CREATE_HREF}
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
          {t("newArticle")}
        </Link>
      </div>

      {error ? (
        <div
          className="rounded-lg border px-4 py-3 text-sm"
          style={{
            borderColor: "color-mix(in srgb, var(--tott-status-coral) 40%, transparent)",
            backgroundColor: "color-mix(in srgb, var(--tott-status-coral) 12%, transparent)",
            color: "var(--tott-status-coral)",
          }}
        >
          {error}
        </div>
      ) : null}

      <ChamferedPanel className="px-3 pb-4 pt-4 min-[504px]:px-6 min-[504px]:pb-6 min-[504px]:pt-6">
        {loading ? (
          <div className="px-5 py-12 text-center text-sm text-[var(--tott-muted)]">
            {t("loading")}
          </div>
        ) : articles.length === 0 ? (
          <div className="border border-[var(--tott-card-border)] px-5 py-12 text-center text-sm text-[var(--tott-muted)]">
            {t("empty")}
          </div>
        ) : (
          <div className="grid grid-cols-[38%_16%_26%_20%] border border-[var(--tott-card-border)]">
            {["title", "status", "issue", ""].map((h, i) => (
              <div
                key={i}
                className="px-4 py-3 text-start text-sm font-medium text-[var(--tott-dash-gold-label)]"
              >
                {h ? t(`columns.${h}`) : ""}
              </div>
            ))}
            {articles.map((a) => {
              const s = (a.status ?? "draft").toLowerCase();
              const issueTitle = a.issue_id ? issueTitleById.get(a.issue_id) : null;
              return (
                <div key={a.id} className="contents">
                  <div
                    className="flex items-center gap-2 border-t border-[var(--tott-card-border)] px-4 py-3 text-sm font-medium text-foreground"
                    style={a.isChild ? { paddingInlineStart: "2rem" } : undefined}
                  >
                    {a.isPrimary && a.siblingCount > 0 ? (
                      <button
                        type="button"
                        onClick={() => toggleGroup(a.groupId)}
                        aria-expanded={a.groupExpanded}
                        aria-label={t("translations.toggle")}
                        className={`shrink-0 rounded p-1 text-[var(--tott-dash-gold-label)] transition-transform hover:bg-[var(--tott-dash-ghost-hover)] ${
                          a.groupExpanded ? "rotate-90" : "rtl:-scale-x-100"
                        }`}
                      >
                        <ChevronRightIcon />
                      </button>
                    ) : null}
                    <span className={a.isChild ? "text-[var(--tott-muted)]" : undefined}>
                      {a.title}
                    </span>
                    {a.language ? (
                      <span className="shrink-0 rounded bg-[var(--tott-elevated)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--tott-muted)]">
                        {a.language}
                      </span>
                    ) : null}
                    {a.isPrimary && a.siblingCount > 0 ? (
                      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-[var(--tott-muted)]">
                        {t("translations.count", { count: a.siblingCount })}
                      </span>
                    ) : null}
                    {a.isPrimary && a.missingLocale ? (
                      <span
                        className="shrink-0 rounded bg-[var(--tott-status-coral)]/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--tott-status-coral)]"
                        title={t("translations.needsTranslationTooltip", { locale })}
                      >
                        {t("translations.needsTranslation")}
                      </span>
                    ) : null}
                  </div>
                  <div className="border-t border-[var(--tott-card-border)] px-4 py-3">
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${statusColor[s] ?? STATUS_FALLBACK} 12%, transparent)`,
                        color: statusColor[s] ?? STATUS_FALLBACK,
                      }}
                    >
                      {s}
                    </span>
                  </div>
                  <div className="border-t border-[var(--tott-card-border)] px-4 py-3 text-sm text-[var(--tott-muted)]">
                    {a.issue_id
                      ? (issueTitle ?? t("issueUnknown"))
                      : t("unassigned")}
                  </div>
                  <div className="flex items-center justify-end gap-2 border-t border-[var(--tott-card-border)] px-4 py-3">
                    <button
                      type="button"
                      aria-label={a.is_featured ? t("feature.unfeature") : t("feature.feature")}
                      aria-pressed={Boolean(a.is_featured)}
                      title={
                        !a.is_featured && s !== "published"
                          ? t("feature.disabledTooltip")
                          : a.is_featured
                            ? t("feature.unfeature")
                            : t("feature.feature")
                      }
                      disabled={featureBusyId === a.id || (!a.is_featured && s !== "published")}
                      onClick={() => toggleFeatured(a)}
                      className="inline-flex items-center justify-center rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] p-1.5 text-sm leading-none transition-colors hover:bg-[var(--tott-dash-control-hover)] disabled:cursor-not-allowed disabled:opacity-40"
                      style={a.is_featured ? { color: "var(--tott-accent-gold)" } : { color: "var(--tott-muted)" }}
                    >
                      {a.is_featured ? "★" : "☆"}
                    </button>
                    <Link
                      href={`/admin/magazine/articles/edit/${encodeURIComponent(a.id)}`}
                      aria-label={t("edit")}
                      className="inline-flex items-center justify-center rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] p-1.5 text-foreground transition-colors hover:bg-[var(--tott-dash-control-hover)] [&_svg]:h-3.5 [&_svg]:w-3.5"
                    >
                      <PenLineIcon />
                    </Link>
                    <button
                      type="button"
                      aria-label={t("delete")}
                      disabled={deleteBusy && deleteTarget?.id === a.id}
                      onClick={() => {
                        setDeleteError(null);
                        setDeleteTarget(a);
                      }}
                      className="inline-flex items-center justify-center rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] p-1.5 text-foreground transition-colors hover:bg-red-950/40 hover:text-red-300 disabled:opacity-40 [&_svg]:h-3.5 [&_svg]:w-3.5"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ChamferedPanel>

      <ConfirmDeleteArticleModal
        open={deleteTarget != null}
        articleTitle={deleteTarget?.title ?? ""}
        busy={deleteBusy}
        error={deleteError}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

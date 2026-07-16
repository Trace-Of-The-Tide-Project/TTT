"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useArticles } from "@/hooks/queries/articles";
import { useIssueArticles } from "@/hooks/queries/issue-articles";
import {
  useAssignArticleToIssue,
  useReorderIssueArticles,
  useUnassignArticleFromIssue,
} from "@/hooks/mutations/issue-articles";
import type { ArticleProduct } from "@/services/articles.service";

const inputClass =
  "w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground outline-none placeholder:text-[var(--tott-muted)] focus:border-[var(--tott-accent-gold)]";

/** Assign existing articles to an issue and order them for the public read. */
export function IssueArticlesPanel({
  issueId,
  magazineId,
}: {
  issueId: string;
  magazineId: string | null;
}) {
  const t = useTranslations("Dashboard.magazineIssues.published.form.articles");
  const { data: assigned = [], isPending } = useIssueArticles(issueId);
  const assign = useAssignArticleToIssue(issueId);
  const unassign = useUnassignArticleFromIssue(issueId);
  const reorder = useReorderIssueArticles(issueId);

  const [search, setSearch] = useState("");
  // Attach only from the magazine pool (product=magazine), and only articles
  // not already in an issue — a magazine article lives in one issue at a time.
  const searchQuery = useArticles(
    search.trim()
      ? { search: search.trim(), limit: 8, product: "magazine" satisfies ArticleProduct }
      : undefined,
    { silent: true },
  );

  const assignedIds = useMemo(() => new Set(assigned.map((a) => a.id)), [assigned]);
  const searchResults = (searchQuery.data?.data ?? []).filter(
    (a) => !assignedIds.has(a.id) && !a.issue_id,
  );

  const [localOrder, setLocalOrder] = useState<string[] | null>(null);
  const orderedIds = localOrder ?? assigned.map((a) => a.id);
  const byId = useMemo(() => new Map(assigned.map((a) => [a.id, a])), [assigned]);

  function move(index: number, delta: number) {
    const next = [...orderedIds];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setLocalOrder(next);
    reorder.mutate(next, { onSettled: () => setLocalOrder(null) });
  }

  const createHref = `/admin/magazine/articles/create?issue_id=${encodeURIComponent(issueId)}${
    magazineId ? `&magazine_id=${encodeURIComponent(magazineId)}` : ""
  }&return=${encodeURIComponent("/admin/magazine-issues")}`;

  return (
    <div className="space-y-3 rounded-lg border border-[var(--tott-card-border)] p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-[var(--tott-dash-gold-label)]">{t("label")}</p>
        <Link
          href={createHref}
          className="shrink-0 rounded-md border border-[var(--tott-card-border)] px-2 py-1 text-xs text-[var(--tott-gold)] hover:bg-[var(--tott-elevated)]"
        >
          {t("createNew")}
        </Link>
      </div>

      {isPending ? (
        <p className="text-xs text-[var(--tott-muted)]">{t("loading")}</p>
      ) : orderedIds.length === 0 ? (
        <p className="text-xs text-[var(--tott-muted)]">{t("empty")}</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {orderedIds.map((id, index) => {
            const article = byId.get(id);
            if (!article) return null;
            return (
              <li
                key={id}
                className="flex items-center justify-between gap-2 rounded-lg border border-[var(--tott-card-border)] px-3 py-2"
              >
                <span className="min-w-0 truncate text-sm text-foreground">{article.title}</span>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0 || reorder.isPending}
                    aria-label={t("moveUp")}
                    className="rounded-md border border-[var(--tott-card-border)] px-1.5 py-1 text-xs text-[var(--tott-muted)] hover:text-foreground disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === orderedIds.length - 1 || reorder.isPending}
                    aria-label={t("moveDown")}
                    className="rounded-md border border-[var(--tott-card-border)] px-1.5 py-1 text-xs text-[var(--tott-muted)] hover:text-foreground disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => unassign.mutate(id)}
                    disabled={unassign.isPending}
                    className="ms-1 text-xs text-[var(--tott-gold)] hover:underline disabled:opacity-40"
                  >
                    {t("remove")}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="border-t border-[var(--tott-card-border)] pt-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className={inputClass}
        />
        {search.trim() ? (
          <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-[var(--tott-card-border)]">
            {searchQuery.isPending ? (
              <p className="px-3 py-2 text-xs text-[var(--tott-muted)]">{t("searching")}</p>
            ) : searchResults.length === 0 ? (
              <p className="px-3 py-2 text-xs text-[var(--tott-muted)]">{t("noResults")}</p>
            ) : (
              searchResults.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => {
                    assign.mutate({ articleId: a.id, magazineId });
                    setSearch("");
                  }}
                  disabled={assign.isPending}
                  className="flex w-full items-center justify-between gap-2 border-b border-[var(--tott-card-border)] px-3 py-2 text-start text-sm text-foreground last:border-b-0 hover:bg-[var(--tott-elevated)] disabled:opacity-40"
                >
                  <span className="min-w-0 truncate">{a.title}</span>
                  <span className="shrink-0 text-xs text-[var(--tott-gold)]">{t("add")}</span>
                </button>
              ))
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

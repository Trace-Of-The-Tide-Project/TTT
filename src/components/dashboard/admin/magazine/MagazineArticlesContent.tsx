"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ChamferedPanel } from "@/components/ui/ChamferedPanel";
import { PlusIcon, PenLineIcon } from "@/components/ui/icons";
import { useArticles } from "@/hooks/queries/articles";
import { useMagazineIssues } from "@/hooks/queries/magazine-issues";
import { formatApiError } from "@/lib/api/error-message";

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
export function MagazineArticlesContent() {
  const t = useTranslations("Dashboard.magazineArticles");

  const articlesQuery = useArticles({ product: "magazine", limit: 100 }, { silent: true });
  const issuesQuery = useMagazineIssues({ limit: 100 });

  const issueTitleById = useMemo(() => {
    const map = new Map<string, string>();
    for (const it of issuesQuery.data ?? []) map.set(it.id, it.title);
    return map;
  }, [issuesQuery.data]);

  const articles = articlesQuery.data?.data ?? [];
  const loading = articlesQuery.isPending;
  const error = articlesQuery.error
    ? formatApiError(articlesQuery.error, t("loadError"))
    : null;

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
          <div className="grid grid-cols-[40%_18%_28%_14%] border border-[var(--tott-card-border)]">
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
                  <div className="border-t border-[var(--tott-card-border)] px-4 py-3 text-sm font-medium text-foreground">
                    {a.title}
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
                  <div className="flex items-center justify-end border-t border-[var(--tott-card-border)] px-4 py-3">
                    <Link
                      href={`/admin/magazine/articles/edit/${encodeURIComponent(a.id)}`}
                      aria-label={t("edit")}
                      className="inline-flex items-center justify-center rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] p-1.5 text-foreground transition-colors hover:bg-[var(--tott-dash-control-hover)] [&_svg]:h-3.5 [&_svg]:w-3.5"
                    >
                      <PenLineIcon />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ChamferedPanel>
    </div>
  );
}

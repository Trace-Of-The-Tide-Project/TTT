"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  ArticlesTable,
  ArticleCardsSection,
  type ArticleRow,
} from "@/components/dashboard/admin/articles/articles-main";
import { articleTabs } from "@/lib/dashboard/articles-constants";
import {
  articleListItemDisplayTitle,
  formatArticleListDate,
  formatScheduledSubtitle,
  isArticleListItemScheduled,
  mapArticleListItemToTableRow,
  normalizeAdminArticleListStatus,
} from "@/lib/dashboard/map-articles-list";
import {
  commitAdminArticlesList,
  invalidateAdminArticlesListCache,
  peekValidAdminArticlesList,
  removeArticleFromAdminArticlesListCache,
} from "@/lib/dashboard/admin-articles-list-cache";
import type { ArticleListItem } from "@/services/articles.service";
import { useArticles } from "@/hooks/queries/articles";
import { useDeleteArticle } from "@/hooks/mutations/articles";
import { previewHrefForContentType } from "@/lib/content/public-article-preview-href";
import { formatApiError } from "@/lib/api/error-message";
import type { ArticleCardItem } from "@/components/dashboard/admin/articles/articles-main/ArticleCardsSection";
import {
  ChevronRightIcon,
  ContributeIcon,
  XIcon,
  ShareIcon,
  EyeIcon,
  ClockIcon,
  CalendarIcon,
} from "@/components/ui/icons";

/** Figma `Icon.svg` — drafted-article hex icon (32×40 hex shell + document glyph + inner highlight). */
function DraftedHexIcon() {
  const filterId = "draftedHexInnerShadow";
  return (
    <svg
      width="32"
      height="40"
      viewBox="0 0 32 40"
      fill="none"
      className="shrink-0 text-[var(--tott-muted)]"
      aria-hidden
    >
      <defs>
        <filter
          id={filterId}
          x="0"
          y="1.43555"
          width="32"
          height="38.1289"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feMorphology radius="1" operator="erode" in="SourceAlpha" result="effect1_innerShadow" />
          <feOffset dy="1" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.08 0"
          />
          <feBlend mode="normal" in2="shape" result="effect1_innerShadow" />
        </filter>
      </defs>
      <g filter={`url(#${filterId})`}>
        <path
          d="M11.7586 2.65203C14.3535 1.02955 17.6465 1.02954 20.2414 2.65203L28.2413 7.65426C30.5796 9.11633 32 11.6796 32 14.4374V25.5626C32 28.3204 30.5796 30.8837 28.2414 32.3457L20.2414 37.348C17.6465 38.9705 14.3535 38.9705 11.7586 37.348L3.75865 32.3457C1.42038 30.8837 0 28.3204 0 25.5626V14.4374C0 11.6796 1.42037 9.11633 3.75865 7.65426L11.7586 2.65203Z"
          fill="var(--tott-dash-icon-bg)"
          stroke="var(--tott-card-border)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </g>
      <path
        d="M17.7143 11V15C17.7143 15.2652 17.8046 15.5196 17.9653 15.7071C18.1261 15.8946 18.3441 16 18.5714 16H22M17.7143 11H11.7143C11.2596 11 10.8236 11.2107 10.5021 11.5858C10.1806 11.9609 10 12.4696 10 13V27C10 27.5304 10.1806 28.0391 10.5021 28.4142C10.8236 28.7893 11.2596 29 11.7143 29H20.2857C20.7404 29 21.1764 28.7893 21.4979 28.4142C21.8194 28.0391 22 27.5304 22 27V16M17.7143 11L22 16M16 20.496V22L16.8571 23M12.5714 22C12.5714 23.0609 12.9327 24.0783 13.5756 24.8284C14.2186 25.5786 15.0907 26 16 26C16.9093 26 17.7814 25.5786 18.4244 24.8284C19.0673 24.0783 19.4286 23.0609 19.4286 22C19.4286 20.9391 19.0673 19.9217 18.4244 19.1716C17.7814 18.4214 16.9093 18 16 18C15.0907 18 14.2186 18.4214 13.5756 19.1716C12.9327 19.9217 12.5714 20.9391 12.5714 22Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Figma `Icon-2.svg` — scheduled-article hex icon (32×40 hex shell + calendar/clock glyph). */
function ScheduledHexIcon() {
  const filterId = "scheduledHexInnerShadow";
  return (
    <svg
      width="32"
      height="40"
      viewBox="0 0 32 40"
      fill="none"
      className="shrink-0 text-[var(--tott-muted)]"
      aria-hidden
    >
      <defs>
        <filter
          id={filterId}
          x="0"
          y="1.43555"
          width="32"
          height="38.1289"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feMorphology radius="1" operator="erode" in="SourceAlpha" result="effect1_innerShadow" />
          <feOffset dy="1" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.08 0"
          />
          <feBlend mode="normal" in2="shape" result="effect1_innerShadow" />
        </filter>
      </defs>
      <g filter={`url(#${filterId})`}>
        <path
          d="M11.7586 2.65203C14.3535 1.02955 17.6465 1.02954 20.2414 2.65203L28.2413 7.65426C30.5796 9.11633 32 11.6796 32 14.4374V25.5626C32 28.3204 30.5796 30.8837 28.2414 32.3457L20.2414 37.348C17.6465 38.9705 14.3535 38.9705 11.7586 37.348L3.75865 32.3457C1.42038 30.8837 0 28.3204 0 25.5626V14.4374C0 11.6796 1.42037 9.11633 3.75865 7.65426L11.7586 2.65203Z"
          fill="var(--tott-dash-icon-bg)"
          stroke="var(--tott-card-border)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </g>
      <path
        d="M15.5547 25.3684H11.2632C10.9281 25.3684 10.6069 25.2353 10.37 24.9984C10.1331 24.7616 10 24.4403 10 24.1053V16.5263C10 16.1913 10.1331 15.87 10.37 15.6331C10.6069 15.3962 10.9281 15.2632 11.2632 15.2632H18.8421C19.1771 15.2632 19.4984 15.3962 19.7353 15.6331C19.9722 15.87 20.1053 16.1913 20.1053 16.5263V19.0526H10M17.5789 14V16.5263M12.5263 14V16.5263M19.4737 22.5238V23.4737L20.1053 24.1053M16.9474 23.4737C16.9474 24.1437 17.2135 24.7863 17.6873 25.2601C18.1611 25.7338 18.8037 26 19.4737 26C20.1437 26 20.7863 25.7338 21.2601 25.2601C21.7338 24.7863 22 24.1437 22 23.4737C22 22.8037 21.7338 22.1611 21.2601 21.6873C20.7863 21.2135 20.1437 20.9474 19.4737 20.9474C18.8037 20.9474 18.1611 21.2135 17.6873 21.6873C17.2135 22.1611 16.9474 22.8037 16.9474 23.4737Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
import { ConfirmDeleteArticleModal } from "@/components/dashboard/admin/articles/articles-editor/modals/ConfirmDeleteArticleModal";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";

const CREATE_HREF = "/admin/articles/create";

function editArticleHref(id: string): string {
  return `/admin/articles/edit/${encodeURIComponent(id)}`;
}

function toDraftCards(
  items: ArticleListItem[],
  t: (key: string) => string,
  locale: string,
): ArticleCardItem[] {
  return items.map((a) => ({
    id: a.id,
    icon: <DraftedHexIcon />,
    statusLabel: t("cards.draftStatus"),
    title: articleListItemDisplayTitle(a),
    subtitle: formatArticleListDate(a.updatedAt, locale, t("table.justNow")),
    subtitleIcon: <ClockIcon />,
    useHexIcon: false,
    compact: true,
    actions: [
      {
        label: t("cards.continueWriting"),
        icon: <ChevronRightIcon />,
        href: editArticleHref(a.id),
        variant: "primary" as const,
      },
    ],
  }));
}

function toScheduledIconCards(
  items: ArticleListItem[],
  onRequestDelete: (item: ArticleListItem) => void,
  t: (key: string) => string,
  locale: string,
): ArticleCardItem[] {
  return items.map((a) => ({
    id: a.id,
    icon: <ScheduledHexIcon />,
    statusLabel: t("cards.scheduledStatus"),
    title: a.title,
    subtitle: formatScheduledSubtitle(a.scheduled_at, locale),
    subtitleIcon: <CalendarIcon />,
    useHexIcon: false,
    compact: true,
    actions: [
      {
        icon: <ContributeIcon />,
        ariaLabel: t("cards.editArticle"),
        href: editArticleHref(a.id),
      },
      {
        icon: <XIcon />,
        ariaLabel: t("cards.deleteScheduledArticle"),
        onClick: () => onRequestDelete(a),
      },
    ],
  }));
}

function toScheduledShareCards(
  items: ArticleListItem[],
  t: (key: string) => string,
  locale: string,
): ArticleCardItem[] {
  const fmtViews = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));
  return items.map((a) => ({
    id: `${a.id}-share`,
    icon: <ScheduledHexIcon />,
    statusLabel: t("cards.scheduledStatus"),
    title: a.title,
    subtitle: formatScheduledSubtitle(a.scheduled_at, locale),
    subtitleIcon: <CalendarIcon />,
    views: fmtViews(a.view_count ?? 0),
    useHexIcon: false,
    compact: true,
    actions: [
      {
        icon: <ContributeIcon />,
        ariaLabel: t("cards.editArticle"),
        href: editArticleHref(a.id),
      },
      { label: t("cards.share"), icon: <ShareIcon />, onClick: () => {} },
      {
        label: t("cards.view"),
        icon: <EyeIcon />,
        href: previewHrefForContentType(a.content_type, a.id),
      },
    ],
  }));
}

export function AdminArticlesPageContent() {
  const t = useTranslations("Dashboard.articles.list");
  const locale = useLocale();

  // product=all: the admin library manages both main-site and magazine articles.
  const articlesQuery = useArticles({ product: "all" }, { silent: true });
  const articleList: ArticleListItem[] = useMemo(() => {
    const fromQuery = articlesQuery.data?.data;
    if (Array.isArray(fromQuery)) return fromQuery;
    return peekValidAdminArticlesList() ?? [];
  }, [articlesQuery.data]);
  const loading = articlesQuery.isPending && !peekValidAdminArticlesList();
  const error = articlesQuery.error
    ? formatApiError(articlesQuery.error, t("errors.loadFailed"))
    : null;

  // Sync the query result into the snapshot cache (used by other code paths).
  useEffect(() => {
    const fromQuery = articlesQuery.data?.data;
    if (Array.isArray(fromQuery)) commitAdminArticlesList(fromQuery);
    if (articlesQuery.error) invalidateAdminArticlesListCache();
  }, [articlesQuery.data, articlesQuery.error]);

  const [scheduledDeleteTarget, setScheduledDeleteTarget] = useState<ArticleListItem | null>(null);
  const [scheduledDeleteError, setScheduledDeleteError] = useState<string | null>(null);

  const deleteMutation = useDeleteArticle({ silent: true });
  const scheduledDeleteBusy = deleteMutation.isPending;

  const onArticleRemoved = useCallback((id: string) => {
    removeArticleFromAdminArticlesListCache(id);
  }, []);

  const openScheduledDelete = useCallback((item: ArticleListItem) => {
    setScheduledDeleteError(null);
    setScheduledDeleteTarget(item);
  }, []);

  const closeScheduledDelete = useCallback(() => {
    if (scheduledDeleteBusy) return;
    setScheduledDeleteTarget(null);
    setScheduledDeleteError(null);
  }, [scheduledDeleteBusy]);

  const confirmScheduledDelete = useCallback(() => {
    if (!scheduledDeleteTarget) return;
    setScheduledDeleteError(null);
    const id = scheduledDeleteTarget.id;
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setScheduledDeleteTarget(null);
        onArticleRemoved(id);
      },
      onError: (e) => {
        setScheduledDeleteError(formatApiError(e, t("errors.deleteFailed")));
      },
    });
  }, [scheduledDeleteTarget, onArticleRemoved, t, deleteMutation]);

  const rows: ArticleRow[] = useMemo(
    () => articleList.map(mapArticleListItemToTableRow),
    [articleList],
  );

  const draftCards = useMemo(() => {
    const drafts = articleList.filter((a) => normalizeAdminArticleListStatus(a.status) === "draft");
    return toDraftCards(drafts.slice(0, 8), t, locale);
  }, [articleList, t, locale]);

  const { scheduledIconCards, scheduledShareCards } = useMemo(() => {
    const scheduled = articleList.filter(isArticleListItemScheduled);
    const mid = Math.ceil(scheduled.length / 2) || scheduled.length;
    return {
      scheduledIconCards: toScheduledIconCards(scheduled.slice(0, mid), openScheduledDelete, t, locale),
      scheduledShareCards: toScheduledShareCards(scheduled.slice(mid), t, locale),
    };
  }, [articleList, openScheduledDelete, t, locale]);

  const fallback = useMemo(
    () => (
      <div className="relative px-5 py-12 text-center text-sm text-[var(--tott-muted)]">
        <ChamferedFrame />
        {t("loading")}
      </div>
    ),
    [t],
  );

  if (loading) {
    return <div className="space-y-8 my-4 mx-10">{fallback}</div>;
  }

  return (
    <div className="space-y-8 my-4 mx-10">
      <ConfirmDeleteArticleModal
        open={scheduledDeleteTarget != null}
        articleTitle={
          scheduledDeleteTarget ? articleListItemDisplayTitle(scheduledDeleteTarget) : ""
        }
        busy={scheduledDeleteBusy}
        error={scheduledDeleteError}
        onClose={closeScheduledDelete}
        onConfirm={() => void confirmScheduledDelete()}
      />

      {error ? (
        <div className="relative px-4 py-4 text-sm text-red-200">
          <ChamferedFrame borderColor="rgb(127 29 29 / 0.7)" />
          <p>{error}</p>
          <button
            type="button"
            onClick={() => void articlesQuery.refetch()}
            className="mt-2 text-xs font-medium text-amber-400 underline hover:text-amber-300"
          >
            {t("tryAgain")}
          </button>
        </div>
      ) : null}

      <ArticlesTable
        tabs={articleTabs}
        rows={rows}
        addNewHref={CREATE_HREF}
        onArticleDeleted={onArticleRemoved}
      />

      <ArticleCardsSection items={draftCards} compactGap />

      <ArticleCardsSection items={scheduledIconCards} compactGap />

      <ArticleCardsSection items={scheduledShareCards} compactGap />
    </div>
  );
}

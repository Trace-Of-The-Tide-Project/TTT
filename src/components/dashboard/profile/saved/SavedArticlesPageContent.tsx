"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { theme } from "@/lib/theme";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";
import { PersonIcon, CalendarIcon, XIcon } from "@/components/ui/icons";
import { useBookmarks } from "@/hooks/queries/bookmarks";
import { useRemoveBookmark } from "@/hooks/mutations/bookmarks";
import { mutationToast } from "@/hooks/useMutationToast";
import { previewHrefForContentType } from "@/lib/content/public-article-preview-href";
import { formatApiError } from "@/lib/api/error-message";
import type { Bookmark } from "@/services/bookmarks.service";

function SavedArticleCard({ bookmark }: { bookmark: Bookmark }) {
  const t = useTranslations("Dashboard.savedArticles");
  const bookmarkT = useTranslations("Content.bookmark");
  const locale = useLocale();
  const article = bookmark.article;
  const remove = useRemoveBookmark(bookmark.article_id);

  function onRemove() {
    void mutationToast(() => remove.mutateAsync(), {
      loading: bookmarkT("removing"),
      success: bookmarkT("removed"),
      error: bookmarkT("removeFailed"),
    });
  }

  if (!article) return null;

  const href = previewHrefForContentType(article.content_type, article.id, article.slug);
  const date = article.published_at
    ? new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "numeric" }).format(
        new Date(article.published_at),
      )
    : "—";

  return (
    <div className="relative flex gap-4 p-4">
      <ChamferedFrame />
      {article.cover_image && (
        <Link href={href} className="relative h-20 w-28 shrink-0 overflow-hidden rounded">
          <Image
            src={article.cover_image}
            alt={article.title}
            fill
            className="object-cover"
            style={{ filter: "grayscale(40%)" }}
            sizes="112px"
          />
        </Link>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Link href={href} className="truncate text-sm font-semibold hover:underline">
          {article.title}
        </Link>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--tott-home-text-muted)]">
          <span className="flex items-center gap-1">
            <span className="[&_svg]:h-3 [&_svg]:w-3" style={{ color: theme.accentGold }}>
              <PersonIcon />
            </span>
            {article.author?.full_name || article.author?.username || "—"}
          </span>
          <span className="flex items-center gap-1">
            <span className="[&_svg]:h-3 [&_svg]:w-3" style={{ color: theme.accentGold }}>
              <CalendarIcon />
            </span>
            {date}
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        disabled={remove.isPending}
        aria-label={t("remove")}
        className="shrink-0 self-start rounded-full p-1.5 text-[var(--tott-home-text-muted)] transition-colors hover:text-[var(--tott-status-coral)] disabled:opacity-50 [&_svg]:h-4 [&_svg]:w-4"
      >
        <XIcon />
      </button>
    </div>
  );
}

export function SavedArticlesPageContent() {
  const t = useTranslations("Dashboard.savedArticles");
  const bookmarksQuery = useBookmarks();
  const loading = bookmarksQuery.isPending;
  const bookmarks = bookmarksQuery.data?.rows ?? [];
  const error = bookmarksQuery.error ? formatApiError(bookmarksQuery.error, t("loadFailed")) : null;

  if (loading) {
    return (
      <div className="relative mx-10 my-4 px-5 py-12 text-center text-sm text-[var(--tott-muted)]">
        <ChamferedFrame />
        {t("loading")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative mx-10 my-4 px-4 py-4 text-sm text-red-200">
        <ChamferedFrame borderColor="rgb(127 29 29 / 0.7)" />
        <p>{error}</p>
        <button
          type="button"
          onClick={() => void bookmarksQuery.refetch()}
          className="mt-2 text-xs font-medium text-amber-400 underline hover:text-amber-300"
        >
          {t("tryAgain")}
        </button>
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="relative mx-10 my-4 px-5 py-12 text-center text-sm text-[var(--tott-muted)]">
        <ChamferedFrame />
        {t("empty")}
      </div>
    );
  }

  return (
    <div className="mx-10 my-4 flex flex-col gap-3">
      {bookmarks.map((b) => (
        <SavedArticleCard key={b.id} bookmark={b} />
      ))}
    </div>
  );
}

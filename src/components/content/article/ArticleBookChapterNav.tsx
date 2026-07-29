"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useArticleBooks } from "@/hooks/queries/article-books";
import { useBookChapters } from "@/hooks/queries/book-chapters";

/**
 * Minimal previous/next footer for an article that is a chapter of a
 * serialized book, driven by chapter_order. Not a general series system —
 * an article belonging to more than one book only gets nav for the first.
 * Unreleased neighbors are omitted; the status gate would 404 them anyway.
 */
export function ArticleBookChapterNav({ articleId }: { articleId: string }) {
  const t = useTranslations("Content.article.bookNav");
  const { data: books = [] } = useArticleBooks(articleId);
  const bookId = books[0]?.book_id;
  const { data: chapters = [] } = useBookChapters(bookId);

  if (!bookId || chapters.length < 2) return null;

  const ordered = [...chapters].sort((a, b) => a.chapter_order - b.chapter_order);
  const index = ordered.findIndex((c) => c.article_id === articleId);
  if (index === -1) return null;

  const prev = index > 0 ? ordered[index - 1] : null;
  const next = index < ordered.length - 1 ? ordered[index + 1] : null;
  const isReadable = (c: (typeof ordered)[number]) => c.article?.status === "published";

  return (
    <nav
      className="mt-8 flex items-center justify-between gap-4 border-t pt-4 text-sm"
      style={{ borderColor: "var(--tott-card-border)" }}
    >
      {prev && isReadable(prev) ? (
        <Link href={`/content/article/${prev.article?.slug}`} className="min-w-0 truncate hover:underline">
          {t("previous")}: {prev.chapter_title || prev.article?.title}
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        isReadable(next) ? (
          <Link
            href={`/content/article/${next.article?.slug}`}
            className="min-w-0 truncate text-end hover:underline"
          >
            {t("next")}: {next.chapter_title || next.article?.title}
          </Link>
        ) : (
          <span className="min-w-0 truncate text-end text-[var(--tott-muted)]">{t("nextLocked")}</span>
        )
      ) : (
        <span />
      )}
    </nav>
  );
}

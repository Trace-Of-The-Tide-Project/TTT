"use client";

import { useTranslations } from "next-intl";
import { useArticleBooks } from "@/hooks/queries/article-books";

/** Which book (if any) an article is a chapter of, shown inline in the
 *  articles list — mirrors the existing magazine/featured badges. One query
 *  per row, cached per articleId by TanStack Query; acceptable at admin
 *  table page sizes (paginated, not a bulk feed). */
export function ArticleBookBadge({ articleId }: { articleId: string }) {
  const t = useTranslations("Dashboard.articles.table");
  const { data: books = [] } = useArticleBooks(articleId);
  if (books.length === 0) return null;
  const label = books[0].book_title || t("bookBadge");
  return (
    <span
      className="shrink-0 rounded bg-[var(--tott-accent-gold)]/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--tott-accent-gold)]"
      title={label}
    >
      {t("bookBadge")}: {label}
    </span>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCollections } from "@/hooks/queries/collections";
import { useArticleBooks } from "@/hooks/queries/article-books";

/**
 * Read-only "what does this article belong to" display. Resolves ids to
 * names and links to where each association is actually edited — this does
 * NOT write anything. Book association is book-owned (book_chapters), there
 * is no scalar book_id on the article to edit from here; collection_id
 * write path is untouched (see ContentSettings/edit-patch.ts).
 */
export function BelongsToSection({
  articleId,
  collectionId,
}: {
  articleId: string;
  collectionId?: string;
}) {
  const t = useTranslations("Dashboard.articles.editor.settings.belongsTo");
  const collectionsQuery = useCollections();
  const booksQuery = useArticleBooks(articleId);

  const collectionName = collectionId
    ? collectionsQuery.data?.find((c) => c.id === collectionId)?.name
    : undefined;
  const books = booksQuery.data ?? [];

  if (!collectionId && books.length === 0) return null;

  return (
    <div className="rounded-[7.5px] border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)]/50 p-3">
      <p className="mb-1.5 text-xs font-medium text-[var(--tott-muted)]">{t("label")}</p>
      <ul className="flex flex-col gap-1 text-sm text-foreground">
        {collectionId ? (
          <li>
            {t("collection")}:{" "}
            <Link href={`/admin/collections/${collectionId}/edit`} className="text-[var(--tott-dash-gold-label)] hover:underline">
              {collectionName || collectionId}
            </Link>
          </li>
        ) : null}
        {books.map((b) => (
          <li key={b.book_id}>
            {t("book")}:{" "}
            <Link href={`/admin/books/${b.book_id}/edit`} className="text-[var(--tott-dash-gold-label)] hover:underline">
              {b.book_title || b.book_id}
            </Link>
            {t("chapterNumber", { n: b.chapter_order + 1 })}
          </li>
        ))}
      </ul>
    </div>
  );
}

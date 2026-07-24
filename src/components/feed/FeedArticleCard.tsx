"use client";

import Image from "next/image";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { resolveArticleMediaSrc } from "@/lib/content/article-media-url";
import { ContentLanguageChip } from "@/components/content/ContentLanguageChip";
import type { ArticleListItem } from "@/services/articles.service";

const TEXT_STRONG = "var(--tott-home-text-strong)";
const TEXT_MUTED = "var(--tott-home-text-muted)";
const CARD_BORDER = "var(--tott-card-border)";
const ACCENT = "var(--tott-accent-gold)";

function formatCategory(category: string | null | undefined): string {
  if (!category?.trim()) return "";
  return category
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function authorName(a: ArticleListItem["author"]): string {
  return (
    a?.profile?.display_name?.trim() ||
    a?.full_name?.trim() ||
    a?.username?.trim() ||
    ""
  );
}

/**
 * Reader-facing article card for the Following feed. Mirrors the public
 * article fields the home strip maps (title, category badge, cover) and links
 * to the public reader at /content/article?id=<id>.
 */
export function FeedArticleCard({ article }: { article: ArticleListItem }) {
  const uiLocale = useLocale();
  const cover = article.cover_image
    ? resolveArticleMediaSrc(article.cover_image)
    : null;
  const badge = formatCategory(article.category);
  const author = authorName(article.author);
  const date = article.published_at ?? article.createdAt;
  const dateLabel = (() => {
    if (!date) return "";
    try {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(date));
    } catch {
      return "";
    }
  })();

  return (
    <Link
      href={`/content/article?id=${encodeURIComponent(article.id)}`}
      className="group flex flex-col overflow-hidden transition-opacity hover:opacity-95"
      style={{
        border: `1px solid ${CARD_BORDER}`,
        borderRadius: 12,
        backgroundColor: "var(--tott-dash-surface, #1c1c1c)",
      }}
    >
      <div
        className="relative w-full"
        style={{ aspectRatio: "16 / 9", backgroundColor: CARD_BORDER }}
      >
        {cover ? (
          <Image
            src={cover}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {badge || article.language ? (
          <span className="flex items-center gap-2">
            {badge ? (
              <span
                className="text-xs font-medium uppercase tracking-wide"
                style={{ color: ACCENT }}
              >
                {badge}
              </span>
            ) : null}
            <ContentLanguageChip contentLanguage={article.language} uiLocale={uiLocale} />
          </span>
        ) : null}
        <h3
          className="text-base font-medium leading-snug"
          style={{ color: TEXT_STRONG }}
        >
          {article.title}
        </h3>
        {article.excerpt ? (
          <p
            className="line-clamp-2 text-sm leading-relaxed"
            style={{ color: TEXT_MUTED }}
          >
            {article.excerpt.replace(/<[^>]*>/g, "")}
          </p>
        ) : null}
        {(author || dateLabel) && (
          <p className="mt-auto pt-1 text-xs" style={{ color: TEXT_MUTED }}>
            {[author, dateLabel].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>
    </Link>
  );
}

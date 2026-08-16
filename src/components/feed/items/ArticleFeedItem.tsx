"use client";

import Image from "next/image";
import { useLocale, useFormatter } from "next-intl";
import { Link } from "@/i18n/navigation";
import { resolveArticleMediaSrc } from "@/lib/content/article-media-url";
import { ContentLanguageChip } from "@/components/content/ContentLanguageChip";
import { dirFor } from "@/i18n/dir";
import type { FeedArticleItem } from "@/services/feed.service";
import { SocialBar } from "../social/SocialBar";

function formatCategory(category: string | null | undefined): string {
  if (!category?.trim()) return "";
  return category.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function authorName(author: FeedArticleItem["article"]["author"]): string {
  return (
    author?.profile?.display_name?.trim() ||
    author?.full_name?.trim() ||
    author?.username?.trim() ||
    ""
  );
}

export function ArticleFeedItem({ item }: { item: FeedArticleItem }) {
  const uiLocale = useLocale();
  const format = useFormatter();
  const { article, social } = item;
  const cover = article.cover_image ? resolveArticleMediaSrc(article.cover_image) : null;
  const badge = formatCategory(article.category);
  const author = authorName(article.author);
  const date = article.published_at ?? article.createdAt;
  const href = `/content/article?id=${encodeURIComponent(article.id)}`;

  return (
    <article className="flex flex-col gap-3 py-5">
      {/* Author row */}
      <div className="flex items-center gap-2.5">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium"
          style={{ backgroundColor: "var(--tott-panel-bg)", color: "var(--tott-home-text-muted)" }}
          aria-hidden
        >
          {author.charAt(0).toUpperCase() || "?"}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium" style={{ color: "var(--tott-home-text-strong)" }}>
            {author}
          </span>
          <span className="text-[11px]" style={{ color: "var(--tott-home-text-muted)" }}>
            {date ? format.relativeTime(new Date(date)) : ""}
          </span>
        </div>
      </div>

      {/* Content — title/cover link out, structurally a sibling of the social bar. */}
      <Link href={href} className="group flex flex-col gap-2">
        {badge || article.language ? (
          <span className="flex items-center gap-2">
            {badge ? (
              <span
                className="text-xs font-medium uppercase tracking-wide"
                style={{ color: "var(--tott-accent-gold)" }}
              >
                {badge}
              </span>
            ) : null}
            <ContentLanguageChip contentLanguage={article.language} uiLocale={uiLocale} />
          </span>
        ) : null}

        <h3
          className="text-lg font-medium leading-snug transition-opacity group-hover:opacity-90"
          style={{ color: "var(--tott-home-text-strong)" }}
          dir={dirFor(article.language)}
        >
          {article.title}
        </h3>

        {article.excerpt ? (
          <p
            className="line-clamp-3 text-sm leading-relaxed"
            style={{ color: "var(--tott-home-text-muted)" }}
            dir={dirFor(article.language)}
          >
            {article.excerpt.replace(/<[^>]*>/g, "")}
          </p>
        ) : null}

        {cover ? (
          <div
            className="relative mt-1 w-full overflow-hidden"
            style={{ aspectRatio: "16 / 9", borderRadius: 12, backgroundColor: "var(--tott-card-border)" }}
          >
            <Image
              src={cover}
              alt={article.title}
              fill
              loading="lazy"
              sizes="(max-width: 640px) 100vw, 640px"
              className="object-cover"
            />
          </div>
        ) : null}
      </Link>

      <SocialBar articleId={article.id} title={article.title} social={social} />
    </article>
  );
}

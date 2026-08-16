"use client";

import Image from "next/image";
import { useFormatter, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { resolveArticleMediaSrc } from "@/lib/content/article-media-url";
import type { FeedBookItem } from "@/services/feed.service";
import { ShareButton } from "@/components/ui/ShareButton";

export function BookFeedItem({ item }: { item: FeedBookItem }) {
  const t = useTranslations("Feed");
  const format = useFormatter();
  const { book } = item;
  const cover = book.cover_image ? resolveArticleMediaSrc(book.cover_image) : null;
  const href = `/books/${encodeURIComponent(book.id)}`;

  return (
    <article className="flex flex-col gap-3 py-5">
      <span
        className="text-xs font-medium uppercase tracking-wide"
        style={{ color: "var(--tott-accent-gold)" }}
      >
        {t("newBook")}
      </span>

      <Link href={href} className="group flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
        {cover ? (
          <div
            className="relative w-full shrink-0 overflow-hidden sm:w-28"
            style={{ aspectRatio: "2 / 3", borderRadius: 8, backgroundColor: "var(--tott-card-border)" }}
          >
            <Image
              src={cover}
              alt={book.title}
              fill
              loading="lazy"
              sizes="112px"
              className="object-cover"
            />
          </div>
        ) : null}
        <div className="flex flex-1 flex-col gap-1.5">
          <h3
            className="text-lg font-medium leading-snug transition-opacity group-hover:opacity-90"
            style={{ color: "var(--tott-home-text-strong)" }}
          >
            {book.title}
          </h3>
          {book.author ? (
            <p className="text-sm" style={{ color: "var(--tott-home-text-muted)" }}>
              {book.author}
            </p>
          ) : null}
          {book.summary ? (
            <p
              className="line-clamp-2 text-sm leading-relaxed"
              style={{ color: "var(--tott-home-text-muted)" }}
            >
              {book.summary.replace(/<[^>]*>/g, "")}
            </p>
          ) : null}
          {item.published_at ? (
            <span className="text-[11px]" style={{ color: "var(--tott-home-text-muted)" }}>
              {format.relativeTime(new Date(item.published_at))}
            </span>
          ) : null}
        </div>
      </Link>

      <div className="flex items-center gap-2">
        <ShareButton title={book.title} />
      </div>
    </article>
  );
}

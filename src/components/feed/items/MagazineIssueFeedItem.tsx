"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { resolveArticleMediaSrc } from "@/lib/content/article-media-url";
import { useRelativeTime } from "@/hooks/useRelativeTime";
import type { FeedMagazineIssueItem } from "@/services/feed.service";
import { ShareButton } from "@/components/ui/ShareButton";

export function MagazineIssueFeedItem({ item }: { item: FeedMagazineIssueItem }) {
  const t = useTranslations("Feed");
  const relativeTime = useRelativeTime();
  const { issue } = item;
  const cover = issue.cover_image ? resolveArticleMediaSrc(issue.cover_image) : null;
  const href = `/magazine-issues/${encodeURIComponent(issue.slug)}`;

  return (
    <article className="flex flex-col gap-3 py-5">
      <span
        className="text-xs font-medium uppercase tracking-wide"
        style={{ color: "var(--tott-accent-gold)" }}
      >
        {t("newIssue")}
        {issue.edition_number ? ` · ${t("edition", { number: issue.edition_number })}` : ""}
      </span>

      <Link href={href} className="group flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
        {cover ? (
          <div
            className="relative w-full shrink-0 overflow-hidden sm:w-32"
            style={{ aspectRatio: "3 / 4", borderRadius: 10, backgroundColor: "var(--tott-card-border)" }}
          >
            <Image
              src={cover}
              alt={issue.title}
              fill
              loading="lazy"
              sizes="128px"
              className="object-cover"
            />
          </div>
        ) : null}
        <div className="flex flex-1 flex-col gap-1.5">
          <h3
            className="text-lg font-medium leading-snug transition-opacity group-hover:opacity-90"
            style={{ color: "var(--tott-home-text-strong)" }}
          >
            {issue.title}
          </h3>
          {issue.subtitle ? (
            <p className="text-sm" style={{ color: "var(--tott-home-text-muted)" }}>
              {issue.subtitle}
            </p>
          ) : null}
          {issue.excerpt || issue.description ? (
            <p
              className="line-clamp-2 text-sm leading-relaxed"
              style={{ color: "var(--tott-home-text-muted)" }}
            >
              {(issue.excerpt ?? issue.description ?? "").replace(/<[^>]*>/g, "")}
            </p>
          ) : null}
          {item.published_at ? (
            <span className="text-[11px]" style={{ color: "var(--tott-home-text-muted)" }}>
              {relativeTime(item.published_at)}
            </span>
          ) : null}
        </div>
      </Link>

      <div className="flex items-center gap-2">
        <ShareButton title={issue.title} />
      </div>
    </article>
  );
}

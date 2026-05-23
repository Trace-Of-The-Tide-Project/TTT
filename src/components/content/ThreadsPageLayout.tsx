"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { theme } from "@/lib/theme";
import HexBackground from "@/components/ui/HexBackground";
import { ShareYourStory } from "@/components/contribute/ShareYourStory";
import { ContentBreadcrumb } from "./related/ContentBreadcrumb";
import { ContentArticleHeader } from "./article/ContentArticleHeader";
import { ContentArticleBody } from "./article/ContentArticleBody";
import { ContentAuthorCard } from "./sidebar/ContentAuthorCard";
import { ContentContributors } from "./sidebar/ContentContributors";
import { ContentCollection } from "./sidebar/ContentCollection";
import { RelatedContent } from "./related/RelatedContent";
import type { RelatedContentCardData } from "./related/RelatedContentCard";

export type ThreadEntry = {
  image: string;
  title: string;
  edition?: string;
  category?: string;
  publishedDate?: string;
  readingTime?: string;
  sections: { heading?: string; paragraphs: string[]; quote?: string }[];
};

type ThreadsPageLayoutProps = {
  breadcrumbs: { label: string; href?: string }[];
  mainTitle: string;
  mainPublishedDate?: string;
  mainReadingTime?: string;
  entries: ThreadEntry[];
  initialVisibleCount?: number;
  loadMoreCount?: number;
  author: {
    name: string;
    initials: string;
    link?: string;
    color?: string;
  };
  contributors: {
    name: string;
    role: string;
    initials: string;
    color?: string;
  }[];
  collection: {
    articleCount: number;
    duration: string;
    items: {
      image: string;
      title: string;
      author: string;
      date: string;
      description: string;
    }[];
  };
  relatedContent: RelatedContentCardData[];
};

export function ThreadsPageLayout({
  breadcrumbs,
  mainTitle,
  mainPublishedDate,
  mainReadingTime,
  entries,
  initialVisibleCount = 2,
  loadMoreCount = 2,
  author,
  contributors,
  collection,
  relatedContent,
}: ThreadsPageLayoutProps) {
  const t = useTranslations("Content");
  const [visibleCount, setVisibleCount] = useState(initialVisibleCount);
  // Entries are expanded by default (per the Thread Figma); we track the ones
  // the reader has collapsed so newly loaded entries also start expanded.
  const [collapsedEntries, setCollapsedEntries] = useState<Set<number>>(new Set());
  const isExpanded = (index: number) => !collapsedEntries.has(index);

  const toggleEntry = (index: number) => {
    setCollapsedEntries((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };
  const visibleEntries = entries.slice(0, visibleCount);
  const hasMore = visibleCount < entries.length;
  const remaining = entries.length - visibleCount;

  const showMore = () => {
    setVisibleCount((c) => Math.min(c + loadMoreCount, entries.length));
  };

  const showLess = () => {
    setVisibleCount(initialVisibleCount);
  };

  const canCollapse = visibleCount > initialVisibleCount;

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden" style={{ backgroundColor: theme.homeSurface }}>
      {/* Hex-cell backdrop behind the top of the page — matches the other
          content pages so the area under the (absolute) navbar reads the same. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-35 overflow-hidden"
        style={{ opacity: "var(--tott-dash-hex-opacity, 1)" }}
      >
        <HexBackground />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-24 sm:px-10 sm:pt-28">
        <ContentBreadcrumb items={breadcrumbs} />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 sm:px-10 sm:py-10">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-8">
          {/* Left — timeline */}
          <div className="flex min-w-0 flex-1 flex-col">
            {/* Main timeline title + meta */}
            <div className="mb-10 ml-5">
              <h1 className="text-2xl font-bold leading-snug text-foreground sm:text-3xl">
                {mainTitle}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[var(--tott-muted)]">
                {mainPublishedDate && (
                  <>
                    <span>{t("published")}: {mainPublishedDate}</span>
                    <span className="text-gray-600">·</span>
                  </>
                )}
                {mainReadingTime && <span>{mainReadingTime}</span>}
              </div>
            </div>

            {/* Timeline */}
            <div className="pl-2">
              {visibleEntries.map((entry, index) => (
                <div key={index} className="relative flex gap-4">
                  {/* Left rail: line + number + line */}
                  <div className="flex w-10 shrink-0 flex-col items-center">
                    {/* Line above + gap (skip for first entry) */}
                    {index > 0 && (
                      <>
                        <div
                          className="w-px border-l-2 border-dashed border-[var(--tott-card-border)]"
                          style={{ height: "3rem" }}
                          aria-hidden
                        />
                        <div className="h-3" aria-hidden />
                      </>
                    )}
                    {/* Number badge */}
                    <div className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--tott-card-border)] bg-[var(--tott-well-bg)] text-sm font-medium text-foreground">
                      {index + 1}
                    </div>
                    {/* Gap */}
                    <div className="h-3" aria-hidden />
                    {/* Line below — stretches to fill remaining height */}
                    <div
                      className="w-px flex-1 border-l-2 border-dashed border-[var(--tott-card-border)]"
                      aria-hidden
                    />
                  </div>

                  {/* Content */}
                  <div
                    className="min-w-0 flex-1 pb-4"
                    style={{ paddingTop: index === 0 ? "0" : "3rem" }}
                  >
                    <div className="space-y-4 pt-10">
                      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-[var(--tott-well-bg)]">
                        <Image
                          src={entry.image}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 672px"
                        />
                      </div>
                      <ContentArticleHeader
                        title={entry.title}
                        edition={entry.edition}
                        category={entry.category}
                        publishedDate={entry.publishedDate}
                        readingTime={entry.readingTime}
                      />
                      {isExpanded(index) && (
                        <ContentArticleBody sections={entry.sections} />
                      )}
                      <button
                        type="button"
                        onClick={() => toggleEntry(index)}
                        className="flex items-center gap-1.5 text-sm font-medium text-[var(--tott-muted)] transition-colors hover:text-foreground"
                      >
                        {isExpanded(index) ? t("showLess") : t("readMore")}
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={`transition-transform ${isExpanded(index) ? "rotate-180" : ""}`}
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Show more / Show less */}
              {(hasMore || canCollapse) && (
                <div className="flex justify-center gap-3 pt-6">
                  {hasMore && (
                    <button
                      type="button"
                      onClick={showMore}
                      className="rounded-lg px-6 py-3 text-sm font-semibold text-[var(--tott-gold-chip-ink)] transition-opacity hover:opacity-90"
                      style={{ backgroundColor: theme.accentGold }}
                    >
                      {t("showMore")}
                      {remaining > 0 && ` ${t("remaining", { remaining })}`}
                    </button>
                  )}
                  {canCollapse && (
                    <button
                      type="button"
                      onClick={showLess}
                      className="rounded-lg border border-[var(--tott-card-border)] px-6 py-3 text-sm font-semibold text-[var(--tott-muted)] transition-colors hover:border-[var(--tott-dash-control-hover)] hover:text-foreground"
                    >
                      {t("showLess")}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right — sidebar: author only, no contributors */}
          <aside className="flex w-full shrink-0 flex-col gap-6 lg:sticky lg:top-6 lg:w-[24rem] lg:self-start">
            <div
              className="rounded-2xl border border-[var(--tott-card-border)] p-5"
              style={{ backgroundColor: theme.homeSurface }}
            >
              <ContentAuthorCard {...author} />
              <div className="my-5 h-px bg-[var(--tott-card-border)]" />
              <ContentContributors contributors={contributors} />
            </div>
            <ContentCollection {...collection} />
          </aside>
        </div>
      </div>

      <RelatedContent items={relatedContent} />
      <ShareYourStory surface={theme.homeSurface} />
    </div>
  );
}

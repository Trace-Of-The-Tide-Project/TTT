"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { ThreadsPageLayout } from "@/components/content/ThreadsPageLayout";
import { buildThreadContentPageProps } from "@/lib/content/build-thread-content-page";
import {
  getRelatedArticles,
  getCollectionArticles,
  type ArticleDetail,
} from "@/services/articles.service";
import { useArticle } from "@/hooks/queries/articles";
import { theme } from "@/lib/theme";
import type { RelatedContentCardData } from "@/components/content/related/RelatedContentCard";
import type { ContentPageLayoutProps } from "@/components/content/ContentPageLayout";
import {
  THREADS_BREADCRUMBS,
  THREADS_MAIN,
  THREADS_ENTRIES,
  CONTENT_AUTHOR,
  CONTENT_CONTRIBUTORS,
  CONTENT_COLLECTION,
  CONTENT_RELATED,
} from "@/lib/constants";

const FALLBACK_IMAGE = "/images/image.png";

function formatShortDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function mapRelated(items: Awaited<ReturnType<typeof getRelatedArticles>>): RelatedContentCardData[] {
  return items
    .filter((a) => !!a.cover_image)
    .map((a) => ({
      image: a.cover_image!,
      title: a.title,
      author: a.author?.full_name || a.author?.username || "Author",
      date: formatShortDate(a.published_at),
      edition: a.edition || a.category || "Thread",
      href: `/content/threads?id=${a.id}`,
    }));
}

function mapCollection(
  col: Awaited<ReturnType<typeof getCollectionArticles>>,
): ContentPageLayoutProps["collection"] {
  const hours = col.total_hours;
  const duration = hours >= 1 ? `${hours}h` : `${Math.round(hours * 60)}min`;
  return {
    articleCount: col.count,
    duration,
    items: col.articles.map((a) => ({
      image: a.cover_image || FALLBACK_IMAGE,
      title: a.title,
      author: a.author?.full_name || a.author?.username || "Author",
      date: formatShortDate(a.published_at),
      description: a.excerpt || "",
    })),
  };
}

function ThreadByIdLoader({ id }: { id: string }) {
  const t = useTranslations("Content");
  const articleQuery = useArticle(id);
  const article: ArticleDetail | null = articleQuery.data ?? null;
  const phase: "loading" | "ok" | "missing" | "error" = articleQuery.isPending
    ? "loading"
    : articleQuery.error
      ? "error"
      : article
        ? "ok"
        : "missing";

  const [liveCollection, setLiveCollection] = useState<ContentPageLayoutProps["collection"] | null>(null);
  const [liveRelated, setLiveRelated] = useState<RelatedContentCardData[]>([]);
  const cancelledRef = useRef(false);

  const [prevId, setPrevId] = useState(id);
  if (prevId !== id) {
    setPrevId(id);
    setLiveRelated([]);
    setLiveCollection(null);
  }

  useEffect(() => {
    cancelledRef.current = false;
    if (!article) return;
    getRelatedArticles(id).then((items) => {
      if (!cancelledRef.current) setLiveRelated(mapRelated(items));
    }).catch(() => {});
    if (article.collection_id) {
      getCollectionArticles(article.collection_id).then((col) => {
        if (!cancelledRef.current) setLiveCollection(mapCollection(col));
      }).catch(() => {});
    }
    return () => { cancelledRef.current = true; };
  }, [article, id]);

  if (phase === "loading") {
    return (
      <div
        className="flex min-h-[50vh] items-center justify-center px-6 text-sm text-[var(--tott-home-text-muted)]"
        style={{ backgroundColor: theme.homeSurface }}
      >
        {t("threads.loading")}
      </div>
    );
  }

  if (phase === "missing") {
    return (
      <div
        className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-6 py-16 text-center text-foreground"
        style={{ backgroundColor: "var(--tott-well-bg)" }}
      >
        <h1 className="text-xl font-semibold">{t("threads.notFound")}</h1>
        <p className="text-sm text-[var(--tott-muted)]">{t("threads.notFoundBody")}</p>
        <Link href="/content" className="text-sm font-medium text-[var(--tott-dash-gold-label)] hover:underline">
          {t("threads.backToContent")}
        </Link>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div
        className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-6 py-16 text-center text-foreground"
        style={{ backgroundColor: "var(--tott-well-bg)" }}
      >
        <h1 className="text-xl font-semibold">{t("threads.loadError")}</h1>
        <p className="text-sm text-[var(--tott-muted)]">{t("threads.loadErrorBody")}</p>
        <Link href="/content" className="text-sm font-medium text-[var(--tott-dash-gold-label)] hover:underline">
          {t("threads.backToContent")}
        </Link>
      </div>
    );
  }

  if (article) {
    const props = buildThreadContentPageProps(article);
    const emptyCollection = { articleCount: 0, duration: "—", items: [] };
    return (
      <ThreadsPageLayout
        breadcrumbs={props.breadcrumbs}
        mainTitle={props.mainTitle}
        mainPublishedDate={props.mainPublishedDate}
        mainReadingTime={props.mainReadingTime}
        entries={props.entries}
        initialVisibleCount={2}
        loadMoreCount={2}
        author={props.author}
        contributors={props.contributors}
        collection={liveCollection ?? emptyCollection}
        relatedContent={liveRelated}
      />
    );
  }

  return null;
}

function ThreadsPageInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id")?.trim();

  if (!id) {
    const entries = THREADS_ENTRIES.map((e) => ({
      image: e.image,
      title: e.title,
      edition: e.edition,
      category: e.category,
      publishedDate: e.publishedDate,
      readingTime: e.readingTime,
      sections: e.sections.map((s) => ({
        heading: "heading" in s ? s.heading : undefined,
        paragraphs: [...s.paragraphs],
        quote: "quote" in s ? s.quote : undefined,
      })),
    }));
    return (
      <ThreadsPageLayout
        breadcrumbs={[...THREADS_BREADCRUMBS]}
        mainTitle={THREADS_MAIN.title}
        mainPublishedDate={THREADS_MAIN.publishedDate}
        mainReadingTime={THREADS_MAIN.readingTime}
        entries={entries}
        initialVisibleCount={2}
        loadMoreCount={2}
        author={{ ...CONTENT_AUTHOR }}
        contributors={[...CONTENT_CONTRIBUTORS].map((c) => ({ ...c }))}
        collection={{
          articleCount: CONTENT_COLLECTION.articleCount,
          duration: CONTENT_COLLECTION.duration,
          items: [...CONTENT_COLLECTION.items].map((item) => ({ ...item })),
        }}
        relatedContent={[...CONTENT_RELATED].map((r) => ({ ...r }))}
      />
    );
  }

  return <ThreadByIdLoader id={id} />;
}

export function ThreadsPageClient() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-[50vh] items-center justify-center text-sm text-[var(--tott-home-text-muted)]"
          style={{ backgroundColor: theme.homeSurface }}
        >
          Loading…
        </div>
      }
    >
      <ThreadsPageInner />
    </Suspense>
  );
}

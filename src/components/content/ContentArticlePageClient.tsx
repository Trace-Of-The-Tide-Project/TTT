"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { ContentPageLayout } from "@/components/content/ContentPageLayout";
import { buildArticleContentPageProps } from "@/lib/content/build-article-content-page";
import {
  getRelatedArticles,
  getCollectionArticles,
  type ArticleDetail,
} from "@/services/articles.service";
import { useArticle } from "@/hooks/queries/articles";
import { useRecordArticleView } from "@/hooks/mutations/articles";
import { theme } from "@/lib/theme";
import type { ContentPageLayoutProps } from "@/components/content/ContentPageLayout";
import type { RelatedContentCardData } from "@/components/content/related/RelatedContentCard";
import {
  CONTENT_MEDIA_ARTICLE,
  CONTENT_ARTICLE,
  CONTENT_ARTICLE_FULL,
  CONTENT_AUTHOR,
  CONTENT_CONTRIBUTORS,
  CONTENT_COLLECTION,
  CONTENT_RELATED,
} from "@/lib/constants";
import { useOptionalArticleReadingHeader } from "@/components/layout/ArticleReadingHeaderContext";

type DemoArticle = typeof CONTENT_ARTICLE | typeof CONTENT_ARTICLE_FULL;

function StaticArticleDemo({
  media,
  article = CONTENT_ARTICLE,
}: {
  media: ContentPageLayoutProps["media"];
  article?: DemoArticle;
}) {
  return (
    <ContentPageLayout
      breadcrumbs={[{ label: "Collections", href: "/content" }, { label: article.title }]}
      media={media}
      article={{
        title: article.title,
        edition: article.edition,
        category: article.category,
        publishedDate: article.publishedDate,
        readingTime: article.readingTime,
        sections: article.sections.map((s) => ({
          heading: "heading" in s ? s.heading : undefined,
          paragraphs: [...s.paragraphs],
          quote: "quote" in s ? s.quote : undefined,
          images: "images" in s ? s.images.map((im) => ({ ...im })) : undefined,
          stats: "stats" in s ? s.stats.map((st) => ({ ...st })) : undefined,
        })),
      }}
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
      edition: a.edition || a.category || "Article",
      href: `/content/article?id=${a.id}`,
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

function ArticleByIdLoader({ id }: { id: string }) {
  const setArticleHeaderMeta = useOptionalArticleReadingHeader()?.setArticleHeaderMeta;
  const articleQuery = useArticle(id);
  const article: ArticleDetail | null = articleQuery.data ?? null;
  const phase: "loading" | "ok" | "missing" | "error" = articleQuery.isPending
    ? "loading"
    : articleQuery.error
      ? "error"
      : article
        ? "ok"
        : "missing";

  const [displayViewCount, setDisplayViewCount] = useState<number | undefined>(undefined);
  const [liveCollection, setLiveCollection] = useState<ContentPageLayoutProps["collection"] | null>(null);
  const [liveRelated, setLiveRelated] = useState<RelatedContentCardData[]>([]);
  const recordedIdRef = useRef<string | null>(null);
  const recordViewMutation = useRecordArticleView();

  useEffect(() => {
    setLiveRelated([]);
    setLiveCollection(null);
    setDisplayViewCount(undefined);
    recordedIdRef.current = null;
  }, [id]);

  useEffect(() => {
    if (!article) return;
    setDisplayViewCount(
      typeof article.view_count === "number" && Number.isFinite(article.view_count)
        ? article.view_count
        : undefined,
    );
    let cancelled = false;
    getRelatedArticles(id).then((items) => {
      if (!cancelled) setLiveRelated(mapRelated(items));
    }).catch(() => {});
    if (article.collection_id) {
      getCollectionArticles(article.collection_id).then((col) => {
        if (!cancelled) setLiveCollection(mapCollection(col));
      }).catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, [article, id]);

  useEffect(() => {
    if (phase !== "ok" || !article) return;
    if (recordedIdRef.current === id) return;
    recordedIdRef.current = id;
    recordViewMutation.mutate(id, {
      onSuccess: (n) => {
        if (n != null) setDisplayViewCount(n);
      },
    });
  }, [id, phase, article, recordViewMutation]);

  useEffect(() => {
    if (!setArticleHeaderMeta) return;
    if (phase === "ok" && displayViewCount != null && Number.isFinite(displayViewCount)) {
      setArticleHeaderMeta({ viewCount: displayViewCount });
    } else {
      setArticleHeaderMeta(null);
    }
  }, [setArticleHeaderMeta, phase, displayViewCount]);

  useEffect(() => {
    if (!setArticleHeaderMeta) return;
    return () => {
      setArticleHeaderMeta(null);
    };
  }, [setArticleHeaderMeta, id]);

  if (phase === "loading") {
    return (
      <div
        className="flex min-h-[50vh] items-center justify-center px-6 text-sm text-gray-500"
        style={{ backgroundColor: theme.homeSurface }}
      >
        Loading article…
      </div>
    );
  }

  if (phase === "missing") {
    return (
      <div
        className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-6 py-16 text-center text-foreground"
        style={{ backgroundColor: "var(--tott-well-bg)" }}
      >
        <h1 className="text-xl font-semibold">Article not found</h1>
        <p className="text-sm text-[var(--tott-muted)]">No article exists for this link.</p>
        <Link href="/content" className="text-sm font-medium text-[var(--tott-dash-gold-label)] hover:underline">
          Back to content
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
        <h1 className="text-xl font-semibold">Could not load article</h1>
        <p className="text-sm text-[var(--tott-muted)]">Check your connection or try again later.</p>
        <Link href="/content" className="text-sm font-medium text-[var(--tott-dash-gold-label)] hover:underline">
          Back to content
        </Link>
      </div>
    );
  }

  if (article) {
    const props = buildArticleContentPageProps(article);
    return (
      <ContentPageLayout
        {...props}
        article={{ ...props.article, viewCount: displayViewCount ?? props.article.viewCount }}
        collection={liveCollection ?? props.collection}
        relatedContent={liveRelated.length > 0 ? liveRelated : props.relatedContent}
      />
    );
  }

  return null;
}

function ContentArticlePageInner({
  demoMedia,
  demoArticle,
}: {
  demoMedia: ContentPageLayoutProps["media"];
  demoArticle?: DemoArticle;
}) {
  const searchParams = useSearchParams();
  const setArticleHeaderMeta = useOptionalArticleReadingHeader()?.setArticleHeaderMeta;
  const id = searchParams.get("id")?.trim();

  useEffect(() => {
    if (!id && setArticleHeaderMeta) setArticleHeaderMeta(null);
  }, [id, setArticleHeaderMeta]);

  if (!id) {
    return <StaticArticleDemo media={demoMedia} article={demoArticle} />;
  }

  return <ArticleByIdLoader id={id} />;
}

/**
 * Shared client for the article/video/audio content pages. With `?id=` it
 * loads a real article (media type derived from its content); without one it
 * renders the static demo. `demoMedia` picks the demo hero so `/content/video`
 * shows the video player and `/content/audio` the audio player — defaulting to
 * the image hero for `/content/article`. `demoArticle` swaps the demo body so
 * `/content/article` can render its richer Figma layout (stats, inline figure,
 * pull quote) while the video/audio demos keep the shorter shared content.
 */
export function ContentArticlePageClient({
  demoMedia = { ...CONTENT_MEDIA_ARTICLE },
  demoArticle,
}: {
  demoMedia?: ContentPageLayoutProps["media"];
  demoArticle?: DemoArticle;
} = {}) {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-[50vh] items-center justify-center text-sm text-gray-500"
          style={{ backgroundColor: theme.homeSurface }}
        >
          Loading…
        </div>
      }
    >
      <ContentArticlePageInner demoMedia={demoMedia} demoArticle={demoArticle} />
    </Suspense>
  );
}

"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
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
import { previewHrefForContentType } from "@/lib/content/public-article-preview-href";
import PremiumGate from "@/components/content/PremiumGate";

type DemoArticle = typeof CONTENT_ARTICLE | typeof CONTENT_ARTICLE_FULL;

function StaticArticleDemo({
  media,
  article = CONTENT_ARTICLE,
}: {
  media: ContentPageLayoutProps["media"];
  article?: DemoArticle;
}) {
  const t = useTranslations("Content");
  return (
    <ContentPageLayout
      breadcrumbs={[{ label: t("breadcrumbCollections"), href: "/content" }, { label: article.title }]}
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

function mapRelated(
  items: Awaited<ReturnType<typeof getRelatedArticles>>,
  fallbacks: { author: string; article: string },
): RelatedContentCardData[] {
  return items
    .filter((a) => !!a.cover_image)
    .map((a) => ({
      image: a.cover_image!,
      title: a.title,
      author: a.author?.full_name || a.author?.username || fallbacks.author,
      date: formatShortDate(a.published_at),
      edition: a.edition || a.category || fallbacks.article,
      href: previewHrefForContentType(a.content_type ?? undefined, a.id),
    }));
}

function mapCollection(
  col: Awaited<ReturnType<typeof getCollectionArticles>>,
  fallbacks: { author: string },
): ContentPageLayoutProps["collection"] {
  const hours = col.total_hours;
  const duration = hours >= 1 ? `${hours}h` : `${Math.round(hours * 60)}min`;
  return {
    articleCount: col.count,
    duration,
    items: col.articles.map((a) => ({
      image: a.cover_image || FALLBACK_IMAGE,
      title: a.title,
      author: a.author?.full_name || a.author?.username || fallbacks.author,
      date: formatShortDate(a.published_at),
      description: a.excerpt || "",
    })),
  };
}

function ArticleByIdLoader({ id }: { id: string }) {
  const t = useTranslations("Content");
  const fallbackAuthor = t("fallbackAuthor");
  const fallbackArticle = t("fallbackArticle");
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

  // Clear cached live data each time the article id changes. State
  // resets are done during render (React 19's preferred pattern); the
  // ref reset must stay in an effect because refs can't be assigned
  // during render.
  const [prevId, setPrevId] = useState(id);
  if (prevId !== id) {
    setPrevId(id);
    setLiveRelated([]);
    setLiveCollection(null);
    setDisplayViewCount(undefined);
  }
  useEffect(() => {
    recordedIdRef.current = null;
  }, [id]);

  // Seed displayViewCount from the loaded article's view_count
  // synchronously (render-phase prev-value pattern instead of effect).
  const [prevArticleVc, setPrevArticleVc] = useState<unknown>(null);
  if (article && article.view_count !== prevArticleVc) {
    setPrevArticleVc(article.view_count);
    setDisplayViewCount(
      typeof article.view_count === "number" && Number.isFinite(article.view_count)
        ? article.view_count
        : undefined,
    );
  }

  // Async fetches stay in an effect — these setStates resolve later
  // (after the await), so the lint rule doesn't apply.
  useEffect(() => {
    if (!article) return;
    let cancelled = false;
    getRelatedArticles(id).then((items) => {
      if (!cancelled) setLiveRelated(mapRelated(items, { author: fallbackAuthor, article: fallbackArticle }));
    }).catch(() => {});
    if (article.collection_id) {
      getCollectionArticles(article.collection_id).then((col) => {
        if (!cancelled) setLiveCollection(mapCollection(col, { author: fallbackAuthor }));
      }).catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, [article, id, fallbackAuthor, fallbackArticle]);

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
        className="flex min-h-[50vh] items-center justify-center px-6 text-sm text-[var(--tott-home-text-muted)]"
        style={{ backgroundColor: theme.homeSurface }}
      >
        {t("article.loading")}
      </div>
    );
  }

  if (phase === "missing") {
    return (
      <div
        className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-6 py-16 text-center text-foreground"
        style={{ backgroundColor: "var(--tott-well-bg)" }}
      >
        <h1 className="text-xl font-semibold">{t("article.notFound")}</h1>
        <p className="text-sm text-[var(--tott-muted)]">{t("article.notFoundBody")}</p>
        <Link href="/content" className="text-sm font-medium text-[var(--tott-dash-gold-label)] hover:underline">
          {t("article.backToContent")}
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
        <h1 className="text-xl font-semibold">{t("article.loadError")}</h1>
        <p className="text-sm text-[var(--tott-muted)]">{t("article.loadErrorBody")}</p>
        <Link href="/content" className="text-sm font-medium text-[var(--tott-dash-gold-label)] hover:underline">
          {t("article.backToContent")}
        </Link>
      </div>
    );
  }

  if (article) {
    const props = buildArticleContentPageProps(article);
    const layout = (
      <ContentPageLayout
        {...props}
        article={{ ...props.article, viewCount: displayViewCount ?? props.article.viewCount }}
        collection={liveCollection ?? props.collection}
        relatedContent={liveRelated.length > 0 ? liveRelated : props.relatedContent}
      />
    );
    return article.is_premium ? (
      <PremiumGate feature="archive">{layout}</PremiumGate>
    ) : layout;
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
          className="flex min-h-[50vh] items-center justify-center text-sm text-[var(--tott-home-text-muted)]"
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

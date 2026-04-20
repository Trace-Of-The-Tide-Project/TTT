"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { ContentPageLayout } from "@/components/content/ContentPageLayout";
import { buildArticleContentPageProps } from "@/lib/content/build-article-content-page";
import { getArticleById, recordArticleView, type ArticleDetail } from "@/services/articles.service";
import { theme } from "@/lib/theme";
import {
  CONTENT_MEDIA_ARTICLE,
  CONTENT_ARTICLE,
  CONTENT_AUTHOR,
  CONTENT_CONTRIBUTORS,
  CONTENT_COLLECTION,
  CONTENT_RELATED,
} from "@/lib/constants";
import { useOptionalArticleReadingHeader } from "@/components/layout/ArticleReadingHeaderContext";

function StaticArticleDemo() {
  return (
    <ContentPageLayout
      breadcrumbs={[{ label: "Collections", href: "/content" }, { label: CONTENT_ARTICLE.title }]}
      media={{ ...CONTENT_MEDIA_ARTICLE }}
      article={{
        title: CONTENT_ARTICLE.title,
        edition: CONTENT_ARTICLE.edition,
        category: CONTENT_ARTICLE.category,
        publishedDate: CONTENT_ARTICLE.publishedDate,
        readingTime: CONTENT_ARTICLE.readingTime,
        sections: CONTENT_ARTICLE.sections.map((s) => ({
          heading: "heading" in s ? s.heading : undefined,
          paragraphs: [...s.paragraphs],
          quote: "quote" in s ? s.quote : undefined,
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

function ArticleByIdLoader({ id }: { id: string }) {
  const setArticleHeaderMeta = useOptionalArticleReadingHeader()?.setArticleHeaderMeta;
  const [phase, setPhase] = useState<"loading" | "ok" | "missing" | "error">("loading");
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [displayViewCount, setDisplayViewCount] = useState<number | undefined>(undefined);
  const recordedIdRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setPhase("loading");
    setArticle(null);
    setDisplayViewCount(undefined);
    recordedIdRef.current = null;
    (async () => {
      try {
        const a = await getArticleById(id);
        if (cancelled) return;
        if (!a) {
          setPhase("missing");
          return;
        }
        setArticle(a);
        setDisplayViewCount(
          typeof a.view_count === "number" && Number.isFinite(a.view_count)
            ? a.view_count
            : undefined
        );
        setPhase("ok");
      } catch {
        if (!cancelled) setPhase("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (phase !== "ok" || !article) return;
    if (recordedIdRef.current === id) return;
    recordedIdRef.current = id;
    let cancelled = false;
    (async () => {
      try {
        const n = await recordArticleView(id);
        if (!cancelled && n != null) setDisplayViewCount(n);
      } catch {
        /* keep count from GET if any */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, phase, article]);

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
        style={{ backgroundColor: theme.pageBackground }}
      >
        Loading article…
      </div>
    );
  }

  if (phase === "missing") {
    return (
      <div
        className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-6 py-16 text-center text-white"
        style={{ backgroundColor: "#191919" }}
      >
        <h1 className="text-xl font-semibold">Article not found</h1>
        <p className="text-sm text-gray-500">No article exists for this link.</p>
        <Link href="/content" className="text-sm font-medium text-[#C9A96E] hover:underline">
          Back to content
        </Link>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div
        className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-6 py-16 text-center text-white"
        style={{ backgroundColor: "#191919" }}
      >
        <h1 className="text-xl font-semibold">Could not load article</h1>
        <p className="text-sm text-gray-500">Check your connection or try again later.</p>
        <Link href="/content" className="text-sm font-medium text-[#C9A96E] hover:underline">
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
        article={{
          ...props.article,
          viewCount: displayViewCount ?? props.article.viewCount,
        }}
      />
    );
  }

  return null;
}

function ContentArticlePageInner() {
  const searchParams = useSearchParams();
  const setArticleHeaderMeta = useOptionalArticleReadingHeader()?.setArticleHeaderMeta;
  const id = searchParams.get("id")?.trim();

  useEffect(() => {
    if (!id && setArticleHeaderMeta) setArticleHeaderMeta(null);
  }, [id, setArticleHeaderMeta]);

  if (!id) {
    return <StaticArticleDemo />;
  }

  return <ArticleByIdLoader id={id} />;
}

export function ContentArticlePageClient() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-[50vh] items-center justify-center text-sm text-gray-500"
          style={{ backgroundColor: theme.pageBackground }}
        >
          Loading…
        </div>
      }
    >
      <ContentArticlePageInner />
    </Suspense>
  );
}

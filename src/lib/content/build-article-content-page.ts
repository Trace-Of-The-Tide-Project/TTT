import type { ArticleDetail } from "@/services/articles.service";
import {
  articleBlocksToSections,
  getFirstCoverHeroFromBlocks,
} from "@/lib/content/article-blocks-to-sections";
import { isLikelyAudioUrl, isLikelyVideoUrl } from "@/lib/content/media-url";
import {
  isUsableArticleMediaRef,
  resolveArticleMediaSrc,
} from "@/lib/content/article-media-url";
import type { ContentPageLayoutProps } from "@/components/content/ContentPageLayout";
import { CONTENT_MEDIA_AUDIO } from "@/lib/constants";

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "?";
}

function formatPublished(iso: string | null | undefined): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

type ContributorLike = {
  name?: string;
  username?: string;
  full_name?: string;
  role?: string;
  user?: { username?: string; full_name?: string };
};

function collectionLabelFromArticle(article: ArticleDetail): string | null {
  const col = article.collection;
  if (!col || typeof col !== "object") return null;
  const name = (col as { name?: string; title?: string }).name?.trim();
  const title = (col as { name?: string; title?: string }).title?.trim();
  return name || title || null;
}

/** Breadcrumb trail: collection name (if any), then article title only. */
function articleContentBreadcrumbs(article: ArticleDetail): { label: string; href?: string }[] {
  const colLabel = collectionLabelFromArticle(article);
  if (colLabel) {
    return [{ label: colLabel }, { label: article.title }];
  }
  return [{ label: article.title }];
}

function normalizedArticleContentType(article: ArticleDetail): string {
  return (article.content_type || "article").toLowerCase().replace(/-/g, "_");
}

/** Matches `/content/audio`: Content → Audio → title. */
function audioArticleHeroBreadcrumbs(article: ArticleDetail): { label: string; href?: string }[] {
  return [
    { label: "Content", href: "/content" },
    { label: "Audio", href: "/content/audio" },
    { label: article.title },
  ];
}

/** Matches `/content/video`: Content → Video → title. */
function videoArticleHeroBreadcrumbs(article: ArticleDetail): { label: string; href?: string }[] {
  return [
    { label: "Content", href: "/content" },
    { label: "Video", href: "/content/video" },
    { label: article.title },
  ];
}

export function buildArticleContentPageProps(article: ArticleDetail): ContentPageLayoutProps {
  const authorName =
    article.author?.full_name?.trim() || article.author?.username?.trim() || "Author";

  const contributorsRaw = Array.isArray(article.contributors) ? article.contributors : [];
  const contributors = contributorsRaw.map((c) => {
    const row = c as ContributorLike;
    const name =
      row.name ||
      row.full_name ||
      row.user?.full_name ||
      row.username ||
      row.user?.username ||
      "Contributor";
    return {
      name,
      role: row.role || "Contributor",
      initials: initialsFromName(name),
    };
  });

  const firstCover = getFirstCoverHeroFromBlocks(article.blocks);
  const fromApiCover = article.cover_image?.trim() || null;
  const heroCandidate = firstCover?.src ?? fromApiCover;
  const heroTrimmed = heroCandidate?.trim() || "";
  const heroKind =
    firstCover?.kind ??
    (isLikelyAudioUrl(heroTrimmed) ? ("audio" as const) : isLikelyVideoUrl(heroTrimmed) ? ("video" as const) : ("image" as const));
  const heroRefOk = heroTrimmed && isUsableArticleMediaRef(heroTrimmed) ? heroTrimmed : null;
  const heroSrc = heroRefOk ? resolveArticleMediaSrc(heroRefOk) : null;

  const media = heroSrc
    ? heroKind === "video"
      ? {
          type: "video" as const,
          src: heroSrc,
          title: article.title,
        }
      : heroKind === "audio"
        ? {
            type: "audio" as const,
            src: heroSrc,
            thumbnail: CONTENT_MEDIA_AUDIO.thumbnail,
            title: article.title,
          }
        : {
            type: "image" as const,
            src: heroSrc,
            thumbnail: heroSrc,
            title: article.title,
          }
    : {
        type: "image" as const,
        src: "",
        title: article.title,
      };

  const contentTypeNorm = normalizedArticleContentType(article);
  const breadcrumbs =
    contentTypeNorm === "audio"
      ? audioArticleHeroBreadcrumbs(article)
      : contentTypeNorm === "video"
        ? videoArticleHeroBreadcrumbs(article)
        : articleContentBreadcrumbs(article);

  return {
    articleId: article.id,
    openCallId: article.open_call_id ?? undefined,
    contentType: article.content_type,
    breadcrumbs,
    media,
    article: {
      title: article.title,
      category: article.category,
      publishedDate: formatPublished(article.published_at),
      readingTime:
        article.reading_time != null && article.reading_time > 0
          ? `${article.reading_time} min read`
          : undefined,
      viewCount:
        typeof article.view_count === "number" && Number.isFinite(article.view_count)
          ? article.view_count
          : undefined,
      language: article.language,
      sections: articleBlocksToSections(article.blocks, {
        omitCoverSrc: firstCover?.src ?? undefined,
      }),
    },
    author: {
      id: article.author?.id,
      name: authorName,
      initials: initialsFromName(authorName),
    },
    contributors,
    collection: {
      articleCount: 0,
      duration: "—",
      items: [],
    },
    relatedContent: [],
  };
}

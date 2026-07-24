import type { ArticleDetail, ArticleDetailBlock } from "@/services/articles.service";
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

/** Matches `/content/gallery`: Content → Gallery → title. */
function galleryArticleHeroBreadcrumbs(article: ArticleDetail): { label: string; href?: string }[] {
  return [
    { label: "Content", href: "/content" },
    { label: "Gallery", href: "/content/gallery" },
    { label: article.title },
  ];
}

type GalleryItem = NonNullable<ContentPageLayoutProps["media"]["items"]>[number];

function galleryItemsFromBlocks(blocks: ArticleDetailBlock[]): GalleryItem[] {
  const sorted = [...blocks].sort((a, b) => a.block_order - b.block_order);
  const items: GalleryItem[] = [];
  for (const b of sorted) {
    const type = (b.block_type || "").toLowerCase();
    if (type !== "gallery") continue;
    const raw = b.metadata;
    let obj: Record<string, unknown> | null = null;
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      obj = raw as Record<string, unknown>;
    } else if (typeof raw === "string") {
      try { obj = JSON.parse(raw) as Record<string, unknown>; } catch { /* ignore */ }
    }
    if (!obj) continue;
    const imgs = obj.images;
    if (!Array.isArray(imgs)) continue;
    for (const im of imgs) {
      if (!im || typeof im !== "object") continue;
      const row = im as Record<string, unknown>;
      const url = typeof row.url === "string" ? row.url.trim() : "";
      if (!url || !isUsableArticleMediaRef(url)) continue;
      const src = resolveArticleMediaSrc(url);
      const thumbnail = typeof row.thumbnail === "string" ? row.thumbnail.trim() : undefined;
      const title = typeof row.caption === "string" ? row.caption.trim() : (typeof row.alt === "string" ? row.alt.trim() : undefined);
      items.push({ type: "image" as const, src, thumbnail: thumbnail || src, title: title || undefined });
    }
  }
  return items;
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

  const fromApiCover = article.cover_image?.trim() || null;
  const firstCover = fromApiCover ? null : getFirstCoverHeroFromBlocks(article.blocks);
  const heroCandidate = fromApiCover ?? firstCover?.src ?? null;
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

  const galleryItems = contentTypeNorm === "gallery" ? galleryItemsFromBlocks(article.blocks) : [];
  const resolvedMedia: ContentPageLayoutProps["media"] =
    contentTypeNorm === "gallery" && galleryItems.length > 0
      ? { type: "gallery" as const, items: galleryItems }
      : media;

  const breadcrumbs =
    contentTypeNorm === "audio"
      ? audioArticleHeroBreadcrumbs(article)
      : contentTypeNorm === "video"
        ? videoArticleHeroBreadcrumbs(article)
        : contentTypeNorm === "gallery"
          ? galleryArticleHeroBreadcrumbs(article)
          : articleContentBreadcrumbs(article);

  return {
    articleId: article.id,
    openCallId: article.open_call_id ?? undefined,
    contentType: article.content_type,
    breadcrumbs,
    media: resolvedMedia,
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
      availableLanguages: article.available_languages,
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

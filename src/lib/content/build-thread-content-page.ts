import type { ArticleDetail, ArticleDetailBlock } from "@/services/articles.service";
import type { ThreadEntry } from "@/components/content/ThreadsPageLayout";
import { isUsableArticleMediaRef, resolveArticleMediaSrc } from "@/lib/content/article-media-url";

function parseMetadataObject(raw: ArticleDetailBlock["metadata"]): Record<string, unknown> | null {
  if (raw == null) return null;
  if (typeof raw === "object" && !Array.isArray(raw)) return raw as Record<string, unknown>;
  if (typeof raw === "string") {
    try {
      const o = JSON.parse(raw) as unknown;
      if (o && typeof o === "object" && !Array.isArray(o)) return o as Record<string, unknown>;
    } catch { return null; }
  }
  return null;
}

function htmlToText(html: string): string {
  return html
    .replace(/<\s*br\s*\/?>/gi, " ")
    .replace(/<\/(p|div|h[1-6]|li|blockquote)>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function htmlToParagraphs(html: string): string[] {
  return html
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|li|blockquote)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function imageUrlFromBlock(b: ArticleDetailBlock): string | null {
  const obj = parseMetadataObject(b.metadata);
  const url =
    (obj && typeof obj.url === "string" && obj.url.trim()) ||
    (typeof b.content === "string" && b.content.trim().startsWith("http") ? b.content.trim() : "");
  if (!url || !isUsableArticleMediaRef(url)) return null;
  return resolveArticleMediaSrc(url);
}

function formatPublished(iso: string | null | undefined): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

type BlockSegment = ArticleDetailBlock[];

/**
 * Split flat blocks into segments using divider blocks as boundaries.
 * Divider blocks themselves are not included in any segment.
 */
function splitSegmentsAtDividers(blocks: ArticleDetailBlock[]): BlockSegment[] {
  const sorted = [...blocks].sort((a, b) => a.block_order - b.block_order);
  const segments: BlockSegment[] = [];
  let current: ArticleDetailBlock[] = [];
  for (const b of sorted) {
    if ((b.block_type || "").toLowerCase() === "divider") {
      if (current.length > 0) segments.push(current);
      current = [];
    } else {
      current.push(b);
    }
  }
  if (current.length > 0) segments.push(current);
  return segments;
}

/**
 * Convert a segment of blocks into a ThreadEntry.
 * - First image block → thumbnail
 * - First heading block → entry title (falls back to article title)
 * - Remaining blocks → sections (paragraphs, quotes)
 */
function segmentToEntry(
  segment: ArticleDetailBlock[],
  fallbackTitle: string,
  fallbackDate: string | undefined,
): ThreadEntry {
  let image = "";
  let title = "";
  const sections: ThreadEntry["sections"] = [];
  let paragraphs: string[] = [];

  const flushParas = () => {
    if (paragraphs.length) {
      sections.push({ paragraphs: [...paragraphs] });
      paragraphs = [];
    }
  };

  for (const b of segment) {
    const type = (b.block_type || "").toLowerCase();

    if (type === "image" && !image) {
      const url = imageUrlFromBlock(b);
      if (url) { image = url; continue; }
    }

    if (type === "heading") {
      const text = htmlToText(b.content ?? "");
      if (!title && text) {
        title = text;
        continue;
      }
      // Subsequent headings become section headings
      flushParas();
      if (text) {
        const sec: ThreadEntry["sections"][number] = { heading: text, paragraphs: [] };
        sections.push(sec);
        paragraphs = [];
      }
      continue;
    }

    if (type === "quote") {
      flushParas();
      sections.push({ paragraphs: [], quote: htmlToText(b.content ?? "") || "—" });
      continue;
    }

    if (type === "paragraph" || type === "author_note" || type === "caption_text") {
      const paras = htmlToParagraphs(b.content ?? "");
      if (sections.length > 0 && "heading" in sections[sections.length - 1]!) {
        (sections[sections.length - 1] as { heading?: string; paragraphs: string[] }).paragraphs.push(...paras);
      } else {
        paragraphs.push(...paras);
      }
      continue;
    }

    if (type === "callout") {
      flushParas();
      const obj = parseMetadataObject(b.metadata);
      const ctitle = obj && typeof obj.title === "string" ? obj.title.trim() : "";
      const body = htmlToText(b.content ?? "") || (obj && typeof obj.body === "string" ? obj.body.trim() : "");
      if (ctitle) sections.push({ paragraphs: [], quote: ctitle + (body ? ` — ${body}` : "") });
      else if (body) paragraphs.push(body);
      continue;
    }
  }

  flushParas();

  if (sections.length === 0) sections.push({ paragraphs: [] });

  return {
    image,
    title: title || fallbackTitle,
    publishedDate: fallbackDate,
    sections,
  };
}

export type ThreadPageData = {
  breadcrumbs: { label: string; href?: string }[];
  mainTitle: string;
  mainPublishedDate?: string;
  mainReadingTime?: string;
  entries: ThreadEntry[];
  author: { id?: string; name: string; initials: string };
  contributors: { name: string; role: string; initials: string }[];
};

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
  return name.slice(0, 2).toUpperCase() || "?";
}

type ContributorLike = {
  name?: string; username?: string; full_name?: string; role?: string;
  user?: { username?: string; full_name?: string };
};

export function buildThreadContentPageProps(article: ArticleDetail): ThreadPageData {
  const authorName =
    article.author?.full_name?.trim() || article.author?.username?.trim() || "Author";

  const contributorsRaw = Array.isArray(article.contributors) ? article.contributors : [];
  const contributors = contributorsRaw.map((c) => {
    const row = c as ContributorLike;
    const name = row.name || row.full_name || row.user?.full_name || row.username || row.user?.username || "Contributor";
    return { name, role: row.role || "Contributor", initials: initialsFromName(name) };
  });

  const publishedDate = formatPublished(article.published_at);

  const readingTime =
    article.reading_time != null && article.reading_time > 0
      ? `${article.reading_time} min read`
      : undefined;

  const segments = splitSegmentsAtDividers(article.blocks);

  const entries: ThreadEntry[] =
    segments.length > 0
      ? segments.map((seg) => segmentToEntry(seg, article.title, publishedDate))
      : [{ image: "", title: article.title, publishedDate, sections: [{ paragraphs: ["No content yet."] }] }];

  const breadcrumbs: { label: string; href?: string }[] = [
    { label: "Content", href: "/content" },
    { label: "Threads", href: "/content/threads" },
    { label: article.title },
  ];

  return {
    breadcrumbs,
    mainTitle: article.title,
    mainPublishedDate: publishedDate,
    mainReadingTime: readingTime,
    entries,
    author: { id: article.author?.id, name: authorName, initials: initialsFromName(authorName) },
    contributors,
  };
}

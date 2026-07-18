import type { ArticleDetailBlock } from "@/services/articles.service";
import type { ContentArticleSection } from "@/components/content/article/ContentArticleBody";
import { isLikelyAudioUrl, isLikelyVideoUrl } from "@/lib/content/media-url";

type Figure = { src: string; alt?: string; caption?: string };

/** Decode the handful of HTML entities that survive tag stripping. */
function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

/**
 * The editor stores block content as HTML (e.g. "<p>text</p>"), but the
 * reader renders plain-text paragraphs. Convert that HTML into one or
 * more plain-text paragraphs: block-level tags become line breaks,
 * remaining tags are stripped, entities decoded.
 */
function htmlToParagraphs(html: string): string[] {
  return decodeEntities(
    html
      .replace(/<\s*br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|h[1-6]|li|blockquote)>/gi, "\n")
      .replace(/<[^>]+>/g, ""),
  )
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Single-line plain text from HTML — for headings/quotes/callouts. */
function htmlToText(html: string): string {
  return htmlToParagraphs(html).join(" ").trim();
}

/** API may return metadata as a JSON string or a parsed object. */
function metadataString(
  metadata: string | Record<string, unknown> | null | undefined
): string | null {
  if (metadata == null) return null;
  if (typeof metadata === "string") return metadata;
  try {
    return JSON.stringify(metadata);
  } catch {
    return null;
  }
}

function parseMetadataObject(raw: ArticleDetailBlock["metadata"]): Record<string, unknown> | null {
  if (raw == null) return null;
  if (typeof raw === "object" && !Array.isArray(raw)) return raw as Record<string, unknown>;
  if (typeof raw === "string") {
    try {
      const o = JSON.parse(raw) as unknown;
      if (o && typeof o === "object" && !Array.isArray(o)) return o as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  return null;
}

function parseImageFigure(b: ArticleDetailBlock): Figure | null {
  const obj = parseMetadataObject(b.metadata);
  const url =
    (obj && typeof obj.url === "string" && obj.url.trim()) ||
    (typeof b.content === "string" && b.content.trim().startsWith("http") ? b.content.trim() : "");
  if (!url) return null;
  const alt = obj && typeof obj.alt === "string" ? obj.alt : undefined;
  const caption = obj && typeof obj.caption === "string" ? obj.caption : undefined;
  return { src: url, alt, caption };
}

function imageFallbackText(b: ArticleDetailBlock): string {
  const s = metadataString(b.metadata);
  if (!s) return b.content?.trim() || "[Image]";
  try {
    const m = JSON.parse(s) as { url?: string; caption?: string; alt?: string };
    if (m.url) {
      const cap = m.caption || m.alt;
      return cap ? `${cap} (${m.url})` : m.url;
    }
  } catch {
    /* ignore */
  }
  return b.content?.trim() || "[Image]";
}

function parseGalleryFigures(b: ArticleDetailBlock): Figure[] {
  const obj = parseMetadataObject(b.metadata);
  if (!obj) return [];
  const imgs = obj.images;
  if (!Array.isArray(imgs)) return [];
  const out: Figure[] = [];
  for (const im of imgs) {
    if (!im || typeof im !== "object") continue;
    const row = im as Record<string, unknown>;
    const url = typeof row.url === "string" ? row.url.trim() : "";
    if (!url) continue;
    out.push({
      src: url,
      alt: typeof row.alt === "string" ? row.alt : undefined,
      caption: typeof row.caption === "string" ? row.caption : undefined,
    });
  }
  return out;
}

function galleryFallbackLines(metadata: string | null | undefined): string[] {
  if (!metadata) return ["[Gallery]"];
  try {
    const m = JSON.parse(metadata) as { images?: { url?: string; caption?: string }[] };
    const imgs = m.images;
    if (!Array.isArray(imgs) || !imgs.length) return ["[Gallery]"];
    return imgs.map((im, i) => {
      const line = im.caption || im.url || `Image ${i + 1}`;
      return im.url && im.caption ? `${im.caption} (${im.url})` : line;
    });
  } catch {
    return ["[Gallery]"];
  }
}

export type CoverHeroKind = "image" | "video" | "audio";

function coverHeroKindFromBlock(b: ArticleDetailBlock, src: string): CoverHeroKind {
  const bt = (b.block_type || "").toLowerCase();
  if (bt === "video") return "video";
  if (bt === "audio") return "audio";
  const obj = parseMetadataObject(b.metadata);
  const mk = obj?.media_kind;
  if (mk === "video") return "video";
  if (mk === "audio") return "audio";
  const mime = (obj?.mime_type ?? obj?.mimeType) as string | undefined;
  if (typeof mime === "string") {
    if (mime.startsWith("video/")) return "video";
    if (mime.startsWith("audio/")) return "audio";
  }
  if (isLikelyVideoUrl(src)) return "video";
  if (isLikelyAudioUrl(src)) return "audio";
  return "image";
}

export type FirstCoverHero = { src: string; kind: CoverHeroKind };

/** First image (or gallery) cover URL and whether the hero should be image, video, or audio. */
export function getFirstCoverHeroFromBlocks(blocks: ArticleDetailBlock[]): FirstCoverHero | null {
  const sorted = [...blocks].sort((a, b) => a.block_order - b.block_order);
  for (const b of sorted) {
    const type = (b.block_type || "").toLowerCase();
    if (type === "image" || type === "video" || type === "audio") {
      const fig = parseImageFigure(b);
      if (fig?.src) return { src: fig.src, kind: coverHeroKindFromBlock(b, fig.src) };
    }
    if (type === "gallery") {
      const figs = parseGalleryFigures(b);
      const first = figs[0];
      if (first?.src) return { src: first.src, kind: coverHeroKindFromBlock(b, first.src) };
    }
  }
  return null;
}

/** First image URL in block order (standalone image or first gallery image). */
export function getFirstCoverSrcFromBlocks(blocks: ArticleDetailBlock[]): string | null {
  return getFirstCoverHeroFromBlocks(blocks)?.src ?? null;
}

type SectionsOptions = {
  /** Omit this image URL from body (used as hero cover). */
  omitCoverSrc?: string | null;
};

/**
 * Maps API blocks (ordered) into ContentArticleBody sections (paragraphs, quotes, inline images).
 */
export function articleBlocksToSections(
  blocks: ArticleDetailBlock[],
  options?: SectionsOptions
): ContentArticleSection[] {
  const omitCoverSrc = options?.omitCoverSrc?.trim() || null;
  const sorted = [...blocks].sort((a, b) => a.block_order - b.block_order);
  const sections: ContentArticleSection[] = [];
  let paragraphs: string[] = [];
  let openHeading: ContentArticleSection | null = null;

  const pushParas = () => {
    if (!paragraphs.length) return;
    if (openHeading) {
      openHeading.paragraphs.push(...paragraphs);
    } else {
      sections.push({ paragraphs: [...paragraphs] });
    }
    paragraphs = [];
  };

  const breakOpenHeading = () => {
    openHeading = null;
  };

  for (const b of sorted) {
    const type = (b.block_type || "").toLowerCase();

    if (type === "heading") {
      pushParas();
      const h = htmlToText(b.content ?? "");
      if (h) {
        const sec: ContentArticleSection = { heading: h, paragraphs: [] };
        sections.push(sec);
        openHeading = sec;
      } else {
        breakOpenHeading();
      }
      continue;
    }

    if (type === "quote") {
      pushParas();
      breakOpenHeading();
      sections.push({ paragraphs: [], quote: htmlToText(b.content ?? "") || "—" });
      continue;
    }

    if (type === "callout") {
      pushParas();
      breakOpenHeading();
      const obj = parseMetadataObject(b.metadata);
      const title = obj && typeof obj.title === "string" ? obj.title.trim() : "";
      const bodyFromMeta = obj && typeof obj.body === "string" ? obj.body.trim() : "";
      const body = htmlToText(b.content ?? "") || bodyFromMeta;
      if (title && body) {
        sections.push({ paragraphs: [], callout: { title, body } });
      } else if (title) {
        sections.push({ paragraphs: [], callout: { title, body: "" } });
      } else if (body) {
        sections.push({ paragraphs: [], callout: body });
      }
      continue;
    }

    if (type === "divider") {
      pushParas();
      breakOpenHeading();
      sections.push({ paragraphs: [], divider: true });
      continue;
    }

    if (type === "image" || type === "video" || type === "audio") {
      const fig = parseImageFigure(b);
      if (fig) {
        if (omitCoverSrc && fig.src === omitCoverSrc) {
          continue;
        }
        pushParas();
        breakOpenHeading();
        sections.push({ paragraphs: [], images: [fig] });
      } else {
        const fallback = imageFallbackText(b);
        if (fallback) {
          if (openHeading) openHeading.paragraphs.push(fallback);
          else paragraphs.push(fallback);
        }
      }
      continue;
    }

    if (type === "author_note") {
      pushParas();
      breakOpenHeading();
      const note = htmlToText(b.content ?? "");
      if (note) sections.push({ paragraphs: [], callout: note });
      continue;
    }

    if (type === "gallery") {
      pushParas();
      breakOpenHeading();
      const allFigures = parseGalleryFigures(b);
      let figures = allFigures;
      if (omitCoverSrc && figures.length && figures[0].src === omitCoverSrc) {
        figures = figures.slice(1);
      }
      if (figures.length) {
        sections.push({ paragraphs: [], images: figures });
      } else if (allFigures.length === 0) {
        const lines = galleryFallbackLines(metadataString(b.metadata));
        sections.push({ paragraphs: lines });
      }
      continue;
    }

    for (const text of htmlToParagraphs(b.content ?? "")) {
      if (openHeading) {
        openHeading.paragraphs.push(text);
      } else {
        paragraphs.push(text);
      }
    }
  }

  pushParas();

  if (sections.length === 0) {
    sections.push({ paragraphs: ["No content yet."] });
  }

  return sections;
}

import type { ArticleDetailBlock } from "@/services/articles.service";
import type {
  ContentArticleSection,
  ListItem,
} from "@/components/content/article/ContentArticleBody";
import { isLikelyAudioUrl, isLikelyVideoUrl } from "@/lib/content/media-url";
import { parseEmbedUrl, embedSrc, embedAspect } from "@/lib/content/embed-providers";

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
 * The editor stores block content as HTML (e.g. "<p>text</p>"). Split it into
 * one paragraph string per top-level block-level tag, keeping inline markup
 * (bold/italic/links/lists) intact — `RichContent` sanitizes and renders it.
 *
 * `<ul>`/`<ol>`/`<blockquote>`/`<pre>` are atomic: never split inside them,
 * or one list gets shattered into orphan `<li>` fragments.
 *
 * ponytail: regex block-splitter, not a parser. Corpus is TipTap output
 * (well-formed, shallow, one level of nesting). Move to DOMParser if authors
 * ever paste raw/foreign HTML into the editor.
 */
function htmlToParagraphs(html: string): string[] {
  return html
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6])>/gi, "\n")
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((chunk) =>
      // ContentArticleBody wraps every paragraph string in a `<p>`, so a chunk
      // still carrying block-level list/quote markup would be invalid HTML and
      // trip a React hydration mismatch. Lists authored at a block's start are
      // tagged block_type "list" upstream and never reach here; only a stray
      // mid-paragraph `<ul>`/`<blockquote>` hits this — flatten it to safe
      // inline text (the readable plain-text behavior readers had before).
      /<(ul|ol|blockquote|pre)\b/i.test(chunk) ? htmlToText(chunk) : chunk
    )
    .filter(Boolean);
}

/** Single-line plain text from HTML — for headings/quotes/callouts. */
function htmlToText(html: string): string {
  // Insert a boundary at every `<br>` and block-closing tag before stripping,
  // then join with a space — otherwise text split across paragraphs/list items
  // ("<p>World</p><p>Peace</p>") fuses into "WorldPeace".
  const spaced = html
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|li|blockquote)>/gi, "\n");
  return decodeEntities(spaced.replace(/<[^>]+>/g, ""))
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .join(" ");
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

/** Per-block direction override. Absent metadata / unrecognized value = inherit. */
function parseBlockDir(b: ArticleDetailBlock): "ltr" | "rtl" | undefined {
  const obj = parseMetadataObject(b.metadata);
  const dir = obj?.dir;
  return dir === "rtl" || dir === "ltr" ? dir : undefined;
}

/**
 * Returns the innerHTML of each *direct-child* `<li>` of the first list in
 * `listHtml`, tracking `<ul>`/`<ol>` nesting depth so a sub-list's `<li>` never
 * leak up as top-level siblings. A lazy `/<li>...<\/li>/` regex can't do this:
 * it stops at the first (inner) `</li>` and shatters any nested list.
 */
function directListItemsHtml(listHtml: string): string[] {
  const open = /<(ul|ol)\b[^>]*>/i.exec(listHtml);
  if (!open) return [];
  const items: string[] = [];
  const token = /<(\/?)(ul|ol|li)\b[^>]*>/gi;
  token.lastIndex = open.index + open[0].length;
  let depth = 0; // nested-list depth below the outer list
  let liStart = -1;
  let m: RegExpExecArray | null = token.exec(listHtml);
  while (m) {
    const closing = m[1] === "/";
    const tag = m[2].toLowerCase();
    if (tag === "li") {
      if (depth === 0) {
        if (closing) {
          if (liStart >= 0) {
            items.push(listHtml.slice(liStart, m.index));
            liStart = -1;
          }
        } else {
          liStart = m.index + m[0].length;
        }
      }
      // depth > 0: belongs to a nested list — skip.
    } else if (closing) {
      if (depth === 0) break; // outer list closed
      depth--;
    } else {
      depth++;
    }
    m = token.exec(listHtml);
  }
  return items;
}

/** Parses a `<ul>`/`<ol>` HTML string into structured list items (one nesting level). */
function parseListItems(html: string): { ordered: boolean; items: ListItem[] } {
  const ordered = /^\s*<ol\b/i.test(html);
  const items: ListItem[] = [];
  for (const li of directListItemsHtml(html)) {
    const nested = /<(ul|ol)\b[^>]*>[\s\S]*<\/\1>/i.exec(li);
    if (nested) {
      const before = li.slice(0, nested.index).trim();
      const after = li.slice(nested.index + nested[0].length).trim();
      const subItems = directListItemsHtml(nested[0])
        .map((s) => s.trim())
        .filter(Boolean);
      if (before) items.push(before);
      if (subItems.length) items.push({ items: subItems });
      if (after) items.push(after);
    } else {
      const t = li.trim();
      if (t) items.push(t);
    }
  }
  return { ordered, items };
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
  let paragraphsDir: "ltr" | "rtl" | undefined;
  let openHeading: ContentArticleSection | null = null;

  const pushParas = () => {
    if (!paragraphs.length) return;
    if (openHeading && openHeading.dir === paragraphsDir) {
      openHeading.paragraphs.push(...paragraphs);
    } else {
      sections.push({ paragraphs: [...paragraphs], dir: paragraphsDir });
    }
    paragraphs = [];
    paragraphsDir = undefined;
  };

  const breakOpenHeading = () => {
    openHeading = null;
  };

  for (const b of sorted) {
    const type = (b.block_type || "").toLowerCase();
    const dir = parseBlockDir(b);

    if (type === "heading") {
      pushParas();
      const h = htmlToText(b.content ?? "");
      if (h) {
        const obj = parseMetadataObject(b.metadata);
        const headingLevel = obj?.level === 3 ? 3 : undefined;
        const sec: ContentArticleSection = { heading: h, headingLevel, paragraphs: [], dir };
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
      sections.push({ paragraphs: [], quote: htmlToText(b.content ?? "") || "—", dir });
      continue;
    }

    if (type === "pull_quote") {
      pushParas();
      breakOpenHeading();
      const obj = parseMetadataObject(b.metadata);
      const attribution = obj && typeof obj.attribution === "string" ? obj.attribution.trim() : "";
      const text = htmlToText(b.content ?? "");
      if (text) {
        sections.push({
          paragraphs: [],
          pullQuote: { text, ...(attribution ? { attribution } : {}) },
          dir,
        });
      }
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
        sections.push({ paragraphs: [], callout: { title, body }, dir });
      } else if (title) {
        sections.push({ paragraphs: [], callout: { title, body: "" }, dir });
      } else if (body) {
        sections.push({ paragraphs: [], callout: body, dir });
      }
      continue;
    }

    if (type === "divider") {
      pushParas();
      breakOpenHeading();
      sections.push({ paragraphs: [], divider: true });
      continue;
    }

    if (type === "list") {
      pushParas();
      breakOpenHeading();
      const obj = parseMetadataObject(b.metadata);
      const metaItems = obj?.items;
      const list =
        Array.isArray(metaItems) && metaItems.length
          ? { ordered: obj?.ordered === true, items: metaItems as ListItem[] }
          : parseListItems(b.content ?? "");
      if (list.items.length) sections.push({ paragraphs: [], list, dir });
      continue;
    }

    if (type === "embed") {
      pushParas();
      breakOpenHeading();
      const obj = parseMetadataObject(b.metadata);
      const parsed = parseEmbedUrl((typeof obj?.url === "string" && obj.url) || b.content || "");
      if (parsed) {
        sections.push({
          paragraphs: [],
          embed: {
            src: embedSrc(parsed),
            aspect: embedAspect(parsed.provider),
            title: `${parsed.provider} video`,
          },
          dir,
        });
      }
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
        sections.push({ paragraphs: [], images: [fig], dir });
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
      if (note) sections.push({ paragraphs: [], callout: note, dir });
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
        sections.push({ paragraphs: [], images: figures, dir });
      } else if (allFigures.length === 0) {
        const lines = galleryFallbackLines(metadataString(b.metadata));
        sections.push({ paragraphs: lines, dir });
      }
      continue;
    }

    // Legacy safety net: a list authored between the reader supporting rich
    // text and the block_type: "list" tagging landing would arrive here as a
    // bare paragraph whose content is <ul>/<ol> HTML — route it to the list
    // handler instead of letting it fall through as prose.
    const trimmedContent = (b.content ?? "").trim();
    if (/^<(ul|ol)\b/i.test(trimmedContent)) {
      pushParas();
      breakOpenHeading();
      const list = parseListItems(trimmedContent);
      if (list.items.length) sections.push({ paragraphs: [], list, dir });
      continue;
    }

    // ponytail: once a dir-mismatched paragraph detaches from the open
    // heading, it stays detached even if a later paragraph's dir would again
    // match the heading — re-attaching mid-stream isn't worth the extra
    // state for a scenario with no authored dir data in the corpus today.
    for (const text of htmlToParagraphs(b.content ?? "")) {
      if (openHeading && openHeading.dir === dir) {
        openHeading.paragraphs.push(text);
      } else {
        if (paragraphs.length && paragraphsDir !== dir) pushParas();
        breakOpenHeading();
        paragraphsDir = dir;
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

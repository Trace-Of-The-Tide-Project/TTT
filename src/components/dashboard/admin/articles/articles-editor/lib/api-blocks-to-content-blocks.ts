import type { ArticleDetailBlock } from "@/services/articles.service";
import type { ContentBlock } from "../ContentBlocks";

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

function stableBlockId(b: ArticleDetailBlock): string {
  if (typeof b.id === "string" && b.id.trim()) return b.id;
  return crypto.randomUUID();
}

/** Per-block direction override. Absent/unrecognized value = inherit (undefined). */
function parseDir(obj: Record<string, unknown> | null): "ltr" | "rtl" | undefined {
  const dir = obj?.dir;
  return dir === "rtl" || dir === "ltr" ? dir : undefined;
}

/**
 * Hydrates the block editor from GET /articles/:id blocks (same shapes as create payload).
 */
export function articleDetailBlocksToContentBlocks(blocks: ArticleDetailBlock[]): ContentBlock[] {
  const sorted = [...blocks].sort((a, b) => a.block_order - b.block_order);
  const out: ContentBlock[] = [];

  for (const b of sorted) {
    const rawType = (b.block_type || "").toLowerCase().replace(/-/g, "_");
    const id = stableBlockId(b);

    switch (rawType) {
      case "divider":
        out.push({ id, type: "divider" });
        break;

      case "image":
      case "video":
      case "audio": {
        const obj = parseMetadataObject(b.metadata);
        const url =
          (obj && typeof obj.url === "string" && obj.url.trim()) ||
          (typeof b.content === "string" && b.content.trim().startsWith("http") ? b.content.trim() : "");
        const caption =
          obj && typeof obj.caption === "string" ? obj.caption.trim() : "";
        const editorType =
          rawType === "video" ? "video" : rawType === "audio" ? "audio" : "image";
        out.push({
          id,
          type: editorType,
          imageUrl: url || undefined,
          ...(caption ? { imageCaption: caption } : {}),
          dir: parseDir(obj),
        });
        break;
      }

      case "gallery": {
        const obj = parseMetadataObject(b.metadata);
        const imgs = obj?.images;
        const urls: string[] = [];
        if (Array.isArray(imgs)) {
          for (const im of imgs) {
            if (!im || typeof im !== "object") continue;
            const u = (im as Record<string, unknown>).url;
            if (typeof u === "string" && u.trim()) urls.push(u.trim());
          }
        }
        out.push({
          id,
          type: "gallery",
          galleryUrls: urls.length ? urls : undefined,
          dir: parseDir(obj),
        });
        break;
      }

      case "quote": {
        const obj = parseMetadataObject(b.metadata);
        const attribution =
          obj && typeof obj.attribution === "string" ? obj.attribution : "";
        out.push({
          id,
          type: "quote",
          content: (b.content ?? "").trim(),
          quoteAttribution: attribution,
          dir: parseDir(obj),
        });
        break;
      }

      case "pull_quote": {
        const obj = parseMetadataObject(b.metadata);
        const attribution =
          obj && typeof obj.attribution === "string" ? obj.attribution : "";
        out.push({
          id,
          type: "pull-quote",
          content: (b.content ?? "").trim(),
          quoteAttribution: attribution,
          dir: parseDir(obj),
        });
        break;
      }

      case "embed": {
        const obj = parseMetadataObject(b.metadata);
        const url =
          (obj && typeof obj.url === "string" && obj.url.trim()) || (b.content ?? "").trim();
        out.push({ id, type: "embed", embedUrl: url, dir: parseDir(obj) });
        break;
      }

      case "list":
        // No dedicated editor block type — hydrate straight back into a
        // paragraph and TipTap re-renders the <ul>/<ol> HTML as-is.
        out.push({
          id,
          type: "paragraph",
          content: (b.content ?? "").trim(),
          dir: parseDir(parseMetadataObject(b.metadata)),
        });
        break;

      case "author_note": {
        const obj = parseMetadataObject(b.metadata);
        out.push({ id, type: "author-note", content: (b.content ?? "").trim(), dir: parseDir(obj) });
        break;
      }

      case "callout": {
        const obj = parseMetadataObject(b.metadata);
        const title =
          obj && typeof obj.title === "string" ? obj.title.trim() : "";
        const bodyFromMeta =
          obj && typeof obj.body === "string" ? obj.body.trim() : "";
        const contentBody = (b.content ?? "").trim();
        const body = contentBody || bodyFromMeta;
        out.push({
          id,
          type: "callout",
          calloutTitle: title,
          content: body,
          dir: parseDir(obj),
        });
        break;
      }

      case "heading": {
        const obj = parseMetadataObject(b.metadata);
        out.push({
          id,
          type: "heading",
          content: (b.content ?? "").trim(),
          headingLevel: obj?.level === 3 ? 3 : 2,
          dir: parseDir(obj),
        });
        break;
      }

      case "caption_text": {
        const obj = parseMetadataObject(b.metadata);
        out.push({ id, type: "caption-text", content: (b.content ?? "").trim(), dir: parseDir(obj) });
        break;
      }

      case "meta_data": {
        const obj = parseMetadataObject(b.metadata);
        out.push({ id, type: "meta-data", content: (b.content ?? "").trim(), dir: parseDir(obj) });
        break;
      }

      case "paragraph": {
        const obj = parseMetadataObject(b.metadata);
        out.push({ id, type: "paragraph", content: (b.content ?? "").trim(), dir: parseDir(obj) });
        break;
      }

      default: {
        const text = (b.content ?? "").trim();
        if (text) out.push({ id, type: "paragraph", content: text });
        break;
      }
    }
  }

  return out;
}

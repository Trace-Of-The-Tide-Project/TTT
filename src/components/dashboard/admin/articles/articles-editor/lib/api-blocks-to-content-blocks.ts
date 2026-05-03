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
        out.push({ id, type: "gallery", galleryUrls: urls.length ? urls : undefined });
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
        });
        break;
      }

      case "author_note":
        out.push({ id, type: "author-note", content: (b.content ?? "").trim() });
        break;

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
        });
        break;
      }

      case "heading":
        out.push({ id, type: "heading", content: (b.content ?? "").trim() });
        break;

      case "caption_text":
        out.push({ id, type: "caption-text", content: (b.content ?? "").trim() });
        break;

      case "meta_data":
        out.push({ id, type: "meta-data", content: (b.content ?? "").trim() });
        break;

      case "paragraph":
        out.push({ id, type: "paragraph", content: (b.content ?? "").trim() });
        break;

      default: {
        const text = (b.content ?? "").trim();
        if (text) out.push({ id, type: "paragraph", content: text });
        break;
      }
    }
  }

  return out;
}

import { uploadArticleAsset } from "@/services/uploads.service";
import type { CreateArticleBlock } from "@/services/articles.service";
import type { ContentBlock } from "../ContentBlocks";
import { isLikelyAudioUrl, isLikelyVideoUrl } from "@/lib/content/media-url";

export type BuildArticleBlocksFromEditorOptions = {
  /** Called when file uploads start / finish (only if the editor has pending asset uploads). */
  onUploading?: (active: boolean) => void;
};

function editorHasPendingAssetUploads(blocks: ContentBlock[]): boolean {
  for (const b of blocks) {
    if ((b.type === "image" || b.type === "video" || b.type === "audio") && b.file) return true;
    if (b.type === "gallery" && (b.files?.length ?? 0) > 0) return true;
  }
  return false;
}

export async function buildArticleBlocksFromEditor(
  blocks: ContentBlock[],
  options?: BuildArticleBlocksFromEditorOptions,
): Promise<CreateArticleBlock[]> {
  const needsUpload = editorHasPendingAssetUploads(blocks);
  if (needsUpload) options?.onUploading?.(true);

  const out: CreateArticleBlock[] = [];
  let order = 1;

  try {
    for (const b of blocks) {
      if (b.type === "divider") {
        out.push({ block_order: order++, block_type: "divider", content: null });
        continue;
      }

      if (b.type === "image" || b.type === "video" || b.type === "audio") {
        const caption = (b.imageCaption ?? "").trim();
        // For explicitly-typed video/audio blocks the editor type is the source
        // of truth; otherwise we infer from the uploaded file's MIME / URL.
        const explicitType: "video" | "audio" | null =
          b.type === "video" ? "video" : b.type === "audio" ? "audio" : null;
        if (b.file) {
          const url = await uploadArticleAsset(b.file);
          const isVideo =
            explicitType === "video" || b.file.type.startsWith("video/") || isLikelyVideoUrl(url);
          const isAudio =
            explicitType === "audio" || b.file.type.startsWith("audio/") || isLikelyAudioUrl(url);
          const mimeType = b.file.type?.trim() || undefined;
          const meta = {
            url,
            alt: "",
            caption,
            ...(mimeType ? { mime_type: mimeType } : {}),
          };
          const block_type: CreateArticleBlock["block_type"] = isVideo
            ? "video"
            : isAudio
              ? "audio"
              : "image";
          out.push({
            block_order: order++,
            block_type,
            content: null,
            metadata: JSON.stringify(meta),
          });
          continue;
        }
        const url = (b.imageUrl ?? "").trim();
        if (!url) continue;
        const isVideo = explicitType === "video" || isLikelyVideoUrl(url);
        const isAudio = explicitType === "audio" || isLikelyAudioUrl(url);
        const meta = { url, alt: "", caption };
        const block_type: CreateArticleBlock["block_type"] = isVideo
          ? "video"
          : isAudio
            ? "audio"
            : "image";
        out.push({
          block_order: order++,
          block_type,
          content: null,
          metadata: JSON.stringify(meta),
        });
        continue;
      }

      if (b.type === "gallery") {
        const files = b.files ?? [];
        if (files.length) {
          const urls: string[] = [];
          for (const f of files) urls.push(await uploadArticleAsset(f));
          out.push({
            block_order: order++,
            block_type: "gallery",
            content: null,
            metadata: JSON.stringify({
              images: urls.map((url) => ({ url, alt: "", caption: "" })),
            }),
          });
          continue;
        }
        const existing = b.galleryUrls ?? [];
        if (!existing.length) continue;
        out.push({
          block_order: order++,
          block_type: "gallery",
          content: null,
          metadata: JSON.stringify({
            images: existing.map((url) => ({ url, alt: "", caption: "" })),
          }),
        });
        continue;
      }

      if (b.type === "quote") {
        const text = (b.content ?? "").trim();
        if (!text) continue;
        const attribution = (b.quoteAttribution ?? "").trim();
        out.push({
          block_order: order++,
          block_type: "quote",
          content: text,
          metadata: attribution ? JSON.stringify({ attribution }) : undefined,
        });
        continue;
      }

      if (b.type === "callout") {
        const title = (b.calloutTitle ?? "").trim();
        const body = (b.content ?? "").trim();
        if (!title && !body) continue;
        const meta: Record<string, string> = {};
        if (title) meta.title = title;
        if (body) meta.body = body;
        out.push({
          block_order: order++,
          block_type: "callout",
          content: body || null,
          metadata: Object.keys(meta).length ? JSON.stringify(meta) : undefined,
        });
        continue;
      }

      if (b.type === "heading") {
        const t = (b.content ?? "").trim();
        if (!t) continue;
        out.push({ block_order: order++, block_type: "heading", content: t });
        continue;
      }

      if (b.type === "caption-text" || b.type === "meta-data") {
        const t = (b.content ?? "").trim();
        if (!t) continue;
        out.push({
          block_order: order++,
          block_type: b.type === "caption-text" ? "caption_text" : "meta_data",
          content: t,
        });
        continue;
      }

      const text = (b.content ?? "").trim();
      if (!text) continue;

      const block_type: CreateArticleBlock["block_type"] =
        b.type === "author-note" ? "author_note" : "paragraph";

      out.push({
        block_order: order++,
        block_type,
        content: text,
      });
    }

    return out;
  } finally {
    if (needsUpload) options?.onUploading?.(false);
  }
}

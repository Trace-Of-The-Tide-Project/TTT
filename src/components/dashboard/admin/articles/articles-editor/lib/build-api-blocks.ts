import { uploadArticleAsset } from "@/services/uploads.service";
import type { CreateArticleBlock } from "@/services/articles.service";
import type { ContentBlock } from "../ContentBlocks";
import { isLikelyAudioUrl, isLikelyVideoUrl } from "@/lib/content/media-url";
import { parseEmbedUrl } from "@/lib/content/embed-providers";
import { isDefaultFraming, type ImageFraming } from "@/lib/image-framing";

/** Drops default/no-op framing so a never-adjusted image serializes identically to before this feature. */
function framingMeta(f: ImageFraming | undefined): ImageFraming | undefined {
  return f && !isDefaultFraming(f) ? f : undefined;
}

/**
 * Builds a metadata JSON string, omitting null/empty values and returning
 * `undefined` (no `metadata` key at all) when everything is empty — keeps
 * blocks with no dir/level/etc. byte-identical to their pre-this-feature
 * serialization.
 */
function meta(o: Record<string, unknown>): string | undefined {
  const clean = Object.fromEntries(Object.entries(o).filter(([, v]) => v != null && v !== ""));
  return Object.keys(clean).length ? JSON.stringify(clean) : undefined;
}

export type BuildArticleBlocksFromEditorOptions = {
  /** Called when file uploads start / finish (only if the editor has pending asset uploads). */
  onUploading?: (active: boolean) => void;
};

/**
 * Thrown when an embed block holds a non-empty URL that isn't a supported
 * provider. Aborts the save (surfaced by the editor's error handling) so the
 * author's content is never silently dropped — the offending block is already
 * flagged inline in the editor.
 */
export class InvalidEmbedError extends Error {
  constructor(public readonly url: string) {
    super(
      "This embed URL isn't supported. Only YouTube and Vimeo links can be embedded — fix or remove the block, then save."
    );
    this.name = "InvalidEmbedError";
  }
}

function editorHasPendingAssetUploads(blocks: ContentBlock[]): boolean {
  for (const b of blocks) {
    if ((b.type === "image" || b.type === "video" || b.type === "audio") && b.file) return true;
    if (b.type === "gallery" && (b.files?.length ?? 0) > 0) return true;
  }
  return false;
}

export async function buildArticleBlocksFromEditor(
  blocks: ContentBlock[],
  options?: BuildArticleBlocksFromEditorOptions
): Promise<CreateArticleBlock[]> {
  // Fail fast on unsupported embeds — before any asset upload — so a bad URL
  // blocks the save loudly instead of vanishing, and we don't waste uploads.
  for (const b of blocks) {
    if (b.type === "embed") {
      const url = (b.embedUrl ?? "").trim();
      if (url && !parseEmbedUrl(url)) throw new InvalidEmbedError(url);
    }
  }

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
          const block_type: CreateArticleBlock["block_type"] = isVideo
            ? "video"
            : isAudio
              ? "audio"
              : "image";
          out.push({
            block_order: order++,
            block_type,
            content: null,
            metadata: meta({ url, alt: "", caption, mime_type: mimeType, dir: b.dir }),
          });
          continue;
        }
        const url = (b.imageUrl ?? "").trim();
        if (!url) continue;
        const isVideo = explicitType === "video" || isLikelyVideoUrl(url);
        const isAudio = explicitType === "audio" || isLikelyAudioUrl(url);
        const block_type: CreateArticleBlock["block_type"] = isVideo
          ? "video"
          : isAudio
            ? "audio"
            : "image";
        out.push({
          block_order: order++,
          block_type,
          content: null,
          metadata: meta({
            url,
            alt: "",
            caption,
            dir: b.dir,
            framing: block_type === "image" ? framingMeta(b.imageFraming) : undefined,
          }),
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
              ...(b.dir ? { dir: b.dir } : {}),
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
            ...(b.dir ? { dir: b.dir } : {}),
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
          metadata: meta({ attribution, dir: b.dir }),
        });
        continue;
      }

      if (b.type === "pull-quote") {
        const text = (b.content ?? "").trim();
        if (!text) continue;
        const attribution = (b.quoteAttribution ?? "").trim();
        out.push({
          block_order: order++,
          block_type: "pull_quote",
          content: text,
          metadata: meta({ attribution, dir: b.dir }),
        });
        continue;
      }

      if (b.type === "embed") {
        const url = (b.embedUrl ?? "").trim();
        if (!url) continue; // empty embed block — drop, same as an empty paragraph
        const parsed = parseEmbedUrl(url);
        if (!parsed) continue; // unreachable: invalid non-empty URLs already threw in the pre-scan
        out.push({
          block_order: order++,
          block_type: "embed",
          content: url,
          metadata: meta({ provider: parsed.provider, id: parsed.id, dir: b.dir }),
        });
        continue;
      }

      if (b.type === "callout") {
        const title = (b.calloutTitle ?? "").trim();
        const body = (b.content ?? "").trim();
        if (!title && !body) continue;
        out.push({
          block_order: order++,
          block_type: "callout",
          content: body || null,
          metadata: meta({ title, body, dir: b.dir }),
        });
        continue;
      }

      if (b.type === "heading") {
        const t = (b.content ?? "").trim();
        if (!t) continue;
        out.push({
          block_order: order++,
          block_type: "heading",
          content: t,
          metadata: meta({ level: b.headingLevel === 3 ? 3 : undefined, dir: b.dir }),
        });
        continue;
      }

      if (b.type === "caption-text" || b.type === "meta-data") {
        const t = (b.content ?? "").trim();
        if (!t) continue;
        out.push({
          block_order: order++,
          block_type: b.type === "caption-text" ? "caption_text" : "meta_data",
          content: t,
          metadata: meta({ dir: b.dir }),
        });
        continue;
      }

      const text = (b.content ?? "").trim();
      if (!text) continue;

      // A paragraph whose TipTap content is a <ul>/<ol> is tagged "list" so
      // the reader dispatches on block_type instead of sniffing HTML twice.
      // Authoring is unchanged — this is purely a wire-format tag.
      // The editor's block type wins first: an author-note that merely starts
      // with a list is still an author-note (its type/styling must survive the
      // round trip), not a bare list.
      const isList = /^<(ul|ol)\b/i.test(text);
      const block_type: CreateArticleBlock["block_type"] =
        b.type === "author-note" ? "author_note" : isList ? "list" : "paragraph";

      out.push({
        block_order: order++,
        block_type,
        content: text,
        metadata: meta({ dir: b.dir }),
      });
    }

    return out;
  } finally {
    if (needsUpload) options?.onUploading?.(false);
  }
}

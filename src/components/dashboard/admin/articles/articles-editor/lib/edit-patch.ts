import type { CreateArticlePayload } from "@/services/articles.service";

export function editPatchFromPayload(payload: CreateArticlePayload) {
  return {
    title: payload.title || undefined,
    category: payload.category || undefined,
    collection_id: payload.collection_id?.trim() ? payload.collection_id.trim() : null,
    cover_image: payload.cover_image ?? null,
    blocks: payload.blocks,
    tag_ids: payload.tag_ids,
    // Editorial assignment. Pass through untouched: id transfers/sets, null
    // clears the byline, undefined (non-privileged or no change) is stripped by
    // omitUndefined downstream. Never coerce undefined→null — that would make a
    // non-privileged author's save send an assignment the backend rejects (403).
    author_id: payload.author_id,
    writer_id: payload.writer_id,
    access_level: payload.access_level ?? "open",
    preview_block_count: payload.preview_block_count ?? null,
    price: payload.price ?? null,
    currency: payload.currency,
    // Re-assert product so editing a magazine article can't demote it.
    // Only ever "magazine" or undefined here; undefined is stripped downstream.
    product: payload.product,
  };
}

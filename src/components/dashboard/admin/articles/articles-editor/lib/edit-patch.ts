import type { CreateArticlePayload } from "@/services/articles.service";

export function editPatchFromPayload(payload: CreateArticlePayload) {
  return {
    title: payload.title || undefined,
    category: payload.category || undefined,
    collection_id: payload.collection_id?.trim() ? payload.collection_id.trim() : null,
    cover_image: payload.cover_image ?? null,
    blocks: payload.blocks,
    tag_ids: payload.tag_ids,
  };
}

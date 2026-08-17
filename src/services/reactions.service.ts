import { api } from "./api";

export const REACTION_TYPES = ["like", "love", "wow", "sad", "angry"] as const;
export type ReactionType = (typeof REACTION_TYPES)[number];

export type ReactionSummary = {
  total: number;
  by_type: Partial<Record<ReactionType, number>>;
  my_reaction: ReactionType | null;
};

/** GET /reactions/article/:id — single-article summary (article detail page). */
export async function getArticleReactions(articleId: string): Promise<ReactionSummary> {
  const res = await api.get(`/reactions/article/${articleId}`);
  return res.data.data;
}

/**
 * POST /reactions/summary — batch summary for a feed page. One request for
 * up to 100 article ids instead of one per card.
 */
export async function getReactionSummaries(
  articleIds: string[],
): Promise<Record<string, ReactionSummary>> {
  if (!articleIds.length) return {};
  const res = await api.post("/reactions/summary", { article_ids: articleIds });
  return res.data.data;
}

export async function toggleArticleReaction(
  articleId: string,
  type: ReactionType,
): Promise<{ action: "added" | "removed" | "switched"; type?: ReactionType }> {
  const res = await api.post("/reactions/article/toggle", { article_id: articleId, type });
  return res.data.data;
}

export async function getCommentReactions(commentId: string): Promise<ReactionSummary> {
  const res = await api.get(`/reactions/comment/${commentId}`);
  return res.data.data;
}

export async function toggleCommentReaction(
  commentId: string,
  type: ReactionType,
): Promise<{ action: "added" | "removed" | "switched"; type?: ReactionType }> {
  const res = await api.post("/reactions/toggle", { comment_id: commentId, type });
  return res.data.data;
}

import { api } from "./api";
import {
  normalizeArticlesListPayload,
  type ArticleListItem,
} from "./articles.service";

export type FollowingFeedResult = {
  data: ArticleListItem[];
  total: number;
};

/** GET /follows/feed — published articles from writers the user follows.
 * Backend returns `{ rows, meta }`; normalize to the ArticleListItem shape the
 * article cards consume. Returns empty on error so the page can render its
 * empty state rather than throwing. */
export async function getFollowingFeed(
  params?: { page?: number; limit?: number },
): Promise<FollowingFeedResult> {
  const { data } = await api.get<unknown>("/follows/feed", { params });
  const o = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  // Backend uses `rows`; normalizeArticlesListPayload handles data/articles/etc.
  const list = Array.isArray(o.rows)
    ? normalizeArticlesListPayload(o.rows)
    : normalizeArticlesListPayload(data);
  const meta = o.meta as { total?: number } | undefined;
  const total =
    typeof meta?.total === "number" && Number.isFinite(meta.total)
      ? meta.total
      : list.length;
  return { data: list, total };
}

export async function checkIsFollowing(followingId: string): Promise<boolean> {
  try {
    const res = await api.get(`/follows/check/${followingId}`);
    return (res.data as { isFollowing?: boolean })?.isFollowing ?? false;
  } catch {
    return false;
  }
}

export async function toggleFollow(followingId: string): Promise<boolean> {
  const res = await api.post("/follows/toggle", { following_id: followingId });
  return (res.data as { followed?: boolean })?.followed ?? false;
}

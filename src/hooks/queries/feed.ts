import { useInfiniteQuery } from "@tanstack/react-query";
import { getFollowingFeed } from "@/services/feed.service";

export const feedKeys = {
  all: ["feed"] as const,
  following: (limit: number) => ["feed", "following", limit] as const,
};

const DEFAULT_LIMIT = 10;

/**
 * Repo's first useInfiniteQuery — kept self-contained. Pages are 1-indexed
 * to match the backend's `page`/`limit` pagination; getNextPageParam stops
 * once the last fetched page reaches totalPages.
 */
export function useFollowingFeed(limit: number = DEFAULT_LIMIT) {
  return useInfiniteQuery({
    queryKey: feedKeys.following(limit),
    queryFn: ({ pageParam }) => getFollowingFeed({ page: pageParam, limit }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.page < lastPage.meta.totalPages
        ? lastPage.meta.page + 1
        : undefined,
  });
}

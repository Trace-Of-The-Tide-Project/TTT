import { useQuery } from "@tanstack/react-query";
import {
  checkIsFollowing,
  getFollowingFeed,
} from "@/services/follows.service";

export const followsKeys = {
  all: ["follows"] as const,
  isFollowing: (followingId: string) =>
    ["follows", "isFollowing", followingId] as const,
  feed: (params?: { page?: number; limit?: number }) =>
    ["follows", "feed", params ?? {}] as const,
};

export function useIsFollowing(followingId: string | null | undefined) {
  return useQuery({
    queryKey: followsKeys.isFollowing(followingId ?? ""),
    queryFn: () => checkIsFollowing(followingId as string),
    enabled: Boolean(followingId),
  });
}

export function useFollowingFeed(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: followsKeys.feed(params),
    queryFn: () => getFollowingFeed(params),
  });
}

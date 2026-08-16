import { useQuery } from "@tanstack/react-query";
import { checkIsFollowing, type FollowableType } from "@/services/follows.service";

export const followsKeys = {
  all: ["follows"] as const,
  isFollowing: (followingType: FollowableType, followingId: string) =>
    ["follows", "isFollowing", followingType, followingId] as const,
};

export function useIsFollowing(
  followingId: string | null | undefined,
  followingType: FollowableType = "user",
) {
  return useQuery({
    queryKey: followsKeys.isFollowing(followingType, followingId ?? ""),
    queryFn: () => checkIsFollowing(followingId as string, followingType),
    enabled: Boolean(followingId),
  });
}

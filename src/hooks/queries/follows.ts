import { useQuery } from "@tanstack/react-query";
import { checkIsFollowing } from "@/services/follows.service";

export const followsKeys = {
  all: ["follows"] as const,
  isFollowing: (followingId: string) =>
    ["follows", "isFollowing", followingId] as const,
};

export function useIsFollowing(followingId: string | null | undefined) {
  return useQuery({
    queryKey: followsKeys.isFollowing(followingId ?? ""),
    queryFn: () => checkIsFollowing(followingId as string),
    enabled: Boolean(followingId),
  });
}

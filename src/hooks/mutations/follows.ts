import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleFollow, type FollowableType } from "@/services/follows.service";
import { followsKeys } from "@/hooks/queries/follows";
import { feedKeys } from "@/hooks/queries/feed";

export function useToggleFollow(followingType: FollowableType = "user") {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (followingId: string) => toggleFollow(followingId, followingType),
    // Optimistically flip the cached follow state so the button updates
    // instantly. The server returns the authoritative `followed` value, which
    // we write back in onSuccess; on error we roll back to the previous value.
    onMutate: async (followingId: string) => {
      const key = followsKeys.isFollowing(followingType, followingId);
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<boolean>(key);
      qc.setQueryData<boolean>(key, (curr) => !curr);
      return { key, previous };
    },
    onError: (_err, _followingId, ctx) => {
      if (ctx) qc.setQueryData(ctx.key, ctx.previous);
    },
    onSuccess: (followed, followingId) => {
      qc.setQueryData(followsKeys.isFollowing(followingType, followingId), followed);
    },
    onSettled: (_data, _err, followingId) => {
      qc.invalidateQueries({
        queryKey: followsKeys.isFollowing(followingType, followingId),
      });
      qc.invalidateQueries({ queryKey: feedKeys.all });
    },
  });
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleFollow } from "@/services/follows.service";
import { followsKeys } from "@/hooks/queries/follows";

export function useToggleFollow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (followingId: string) => toggleFollow(followingId),
    // Optimistically flip the cached follow state so the button updates
    // instantly. The server returns the authoritative `followed` value, which
    // we write back in onSuccess; on error we roll back to the previous value.
    onMutate: async (followingId: string) => {
      const key = followsKeys.isFollowing(followingId);
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<boolean>(key);
      qc.setQueryData<boolean>(key, (curr) => !curr);
      return { key, previous };
    },
    onError: (_err, _followingId, ctx) => {
      if (ctx) qc.setQueryData(ctx.key, ctx.previous);
    },
    onSuccess: (followed, followingId) => {
      qc.setQueryData(followsKeys.isFollowing(followingId), followed);
    },
    onSettled: (_data, _err, followingId) => {
      qc.invalidateQueries({ queryKey: followsKeys.isFollowing(followingId) });
      qc.invalidateQueries({ queryKey: followsKeys.feed() });
    },
  });
}

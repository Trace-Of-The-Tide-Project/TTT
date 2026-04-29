import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleFollow } from "@/services/follows.service";
import { followsKeys } from "@/hooks/queries/follows";

export function useToggleFollow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (followingId: string) => toggleFollow(followingId),
    onSuccess: (_data, followingId) => {
      qc.invalidateQueries({ queryKey: followsKeys.isFollowing(followingId) });
    },
  });
}

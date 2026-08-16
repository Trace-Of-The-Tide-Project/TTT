import { api } from "./api";

export type FollowableType = "user" | "writer_profile";

export async function checkIsFollowing(
  followingId: string,
  followingType: FollowableType = "user",
): Promise<boolean> {
  try {
    const res = await api.get(`/follows/check/${followingId}`, {
      params: followingType === "user" ? undefined : { type: followingType },
    });
    return (res.data as { isFollowing?: boolean })?.isFollowing ?? false;
  } catch {
    return false;
  }
}

export async function toggleFollow(
  followingId: string,
  followingType: FollowableType = "user",
): Promise<boolean> {
  const res = await api.post("/follows/toggle", {
    following_id: followingId,
    following_type: followingType,
  });
  return (res.data as { followed?: boolean })?.followed ?? false;
}

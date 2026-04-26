import { api } from "./api";

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

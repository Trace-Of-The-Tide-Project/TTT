import { api } from "./api";

// ─── Response Types ──────────────────────────────────────────

export interface EngagementStats {
  total_comments: number;
  total_likes: number;
  active_discussions: number;
  badges_awarded: number;
}

export interface CommentAuthor {
  id: string;
  username: string;
  full_name: string;
  avatar: string | null;
}

export interface ApiComment {
  id: string;
  content: string;
  author: CommentAuthor | null;
  is_flagged: boolean;
  likes: number;
  replies: number;
  createdAt: string;
}

export interface CommentsResponse {
  comments: ApiComment[];
  total: number;
  flagged_count: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ApiDiscussion {
  id: string;
  title: string;
  status: string;
  is_locked: boolean;
  author: CommentAuthor | null;
  comment_count: number;
  participant_count: number;
  createdAt: string;
}

export interface DiscussionsResponse {
  discussions: ApiDiscussion[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ApiBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria_type: string;
  criteria_value: number;
  is_active: boolean;
  recipient_count: number;
  createdAt: string;
}

export interface BadgesResponse {
  badges: ApiBadge[];
  total: number;
}

// ─── API Functions ───────────────────────────────────────────

export async function fetchEngagementStats(): Promise<EngagementStats> {
  const { data } = await api.get<EngagementStats>("/admin/engagements/stats");
  return data;
}

export async function fetchComments(params: {
  search?: string;
  filter?: "all" | "flagged";
  page?: number;
  limit?: number;
}): Promise<CommentsResponse> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.filter && params.filter !== "all") query.set("filter", params.filter);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  const { data } = await api.get<CommentsResponse>(
    `/admin/engagements/comments?${query}`
  );
  return data;
}

export async function flagComment(id: string): Promise<void> {
  await api.patch(`/admin/engagements/comments/${id}/flag`);
}

export async function unflagComment(id: string): Promise<void> {
  await api.patch(`/admin/engagements/comments/${id}/unflag`);
}

export async function deleteComment(id: string): Promise<void> {
  await api.delete(`/admin/engagements/comments/${id}`);
}

export async function fetchDiscussions(params: {
  page?: number;
  limit?: number;
}): Promise<DiscussionsResponse> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  const { data } = await api.get<DiscussionsResponse>(
    `/admin/engagements/discussions?${query}`
  );
  return data;
}

export async function lockDiscussion(id: string): Promise<void> {
  await api.patch(`/admin/engagements/discussions/${id}/lock`);
}

export async function unlockDiscussion(id: string): Promise<void> {
  await api.patch(`/admin/engagements/discussions/${id}/unlock`);
}

export async function fetchBadges(search?: string): Promise<BadgesResponse> {
  const query = new URLSearchParams();
  if (search) query.set("search", search);
  const { data } = await api.get<BadgesResponse>(
    `/admin/engagements/badges?${query}`
  );
  return data;
}

export async function createAndAwardBadge(dto: {
  name: string;
  icon?: string;
  role?: string;
  reason?: string;
}): Promise<{ message: string; badge: ApiBadge; awarded_count: number }> {
  const { data } = await api.post("/admin/engagements/badges/create-and-award", dto);
  return data;
}

export async function awardBadgeToUser(
  badgeId: string,
  dto: { user_id?: string; username?: string; description?: string }
): Promise<void> {
  await api.post(`/admin/engagements/badges/${badgeId}/award`, dto);
}

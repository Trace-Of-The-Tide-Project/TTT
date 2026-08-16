import { api } from "./api";

export type CommentUser = {
  id: string;
  username: string;
  full_name: string;
};

export type CommentItem = {
  id: string;
  article_id: string | null;
  discussion_id: string | null;
  parent_comment_id: string | null;
  thread_root_id: string | null;
  content: string;
  depth: number;
  createdAt: string;
  updatedAt: string;
  user: CommentUser;
  replies?: CommentItem[];
};

export type CommentsPage = {
  rows: CommentItem[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

/** GET /comments/article/:id — top-level comments, paginated, one reply level nested. */
export async function listArticleComments(
  articleId: string,
  params?: { page?: number; limit?: number },
): Promise<CommentsPage> {
  const res = await api.get(`/comments/article/${articleId}`, { params });
  return { rows: res.data.data, meta: res.data.meta };
}

export async function createComment(payload: {
  article_id: string;
  content: string;
  parent_comment_id?: string;
}): Promise<CommentItem> {
  const res = await api.post("/comments", payload);
  return res.data.data;
}

export async function updateComment(id: string, content: string): Promise<CommentItem> {
  const res = await api.patch(`/comments/${id}`, { content });
  return res.data.data;
}

export async function deleteComment(id: string): Promise<void> {
  await api.delete(`/comments/${id}`);
}

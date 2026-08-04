import { api } from "./api";

export type DmUser = {
  id: string;
  username: string;
  full_name?: string | null;
  avatar_url?: string | null;
};

export type DmThreadListItem = {
  id: string;
  other_user: DmUser;
  last_message_at: string | null;
  last_message_preview: string | null;
  unread_count: number;
};

export type DmThread = {
  id: string;
  user_a_id: string;
  user_b_id: string;
  userA: DmUser;
  userB: DmUser;
};

export type DmMessage = {
  id: string;
  thread_id: string;
  sender_id: string;
  sender?: DmUser;
  content: string;
  is_read: boolean;
  read_at: string | null;
  createdAt: string;
};

type Paginated<T> = { rows: T[]; meta: { page: number; limit: number; total: number; totalPages: number } };

function unwrap<T>(body: unknown): T {
  if (body && typeof body === "object" && "data" in body && (body as { data?: unknown }).data !== undefined) {
    return (body as { data: T }).data;
  }
  return body as T;
}

export async function searchUsers(q: string): Promise<DmUser[]> {
  if (q.trim().length < 2) return [];
  const res = await api.get("/users/search", { params: { q } });
  return unwrap<DmUser[]>(res.data);
}

export async function listThreads(params?: { page?: number; limit?: number }): Promise<Paginated<DmThreadListItem>> {
  const res = await api.get("/dm/threads", { params });
  return unwrap<Paginated<DmThreadListItem>>(res.data);
}

export async function startThread(recipientId: string): Promise<DmThread> {
  const res = await api.post("/dm/threads", { recipient_id: recipientId });
  return unwrap<DmThread>(res.data);
}

export async function getThread(threadId: string): Promise<DmThread> {
  const res = await api.get(`/dm/threads/${threadId}`);
  return unwrap<DmThread>(res.data);
}

export async function listMessages(
  threadId: string,
  params?: { page?: number; limit?: number },
): Promise<Paginated<DmMessage>> {
  const res = await api.get(`/dm/threads/${threadId}/messages`, { params });
  return unwrap<Paginated<DmMessage>>(res.data);
}

export async function sendMessage(threadId: string, content: string): Promise<DmMessage> {
  const res = await api.post(`/dm/threads/${threadId}/messages`, { content });
  return unwrap<DmMessage>(res.data);
}

export async function markThreadRead(threadId: string): Promise<void> {
  await api.patch(`/dm/threads/${threadId}/read`);
}

export async function getUnreadTotal(): Promise<number> {
  const res = await api.get("/dm/unread-count");
  return unwrap<{ total: number }>(res.data).total;
}

export async function getSocketTicket(): Promise<string> {
  const res = await api.post("/auth/socket-ticket");
  return unwrap<{ ticket: string }>(res.data).ticket;
}

export function dmUserDisplayName(u: DmUser | null | undefined): string {
  return u?.full_name?.trim() || u?.username || "—";
}

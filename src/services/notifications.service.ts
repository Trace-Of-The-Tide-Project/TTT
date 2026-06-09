import { api } from "./api";

export type NotificationUserPreview = {
  id: string;
  username: string;
  full_name: string;
};

export type NotificationListItem = {
  id: string;
  user_id: string;
  message: string;
  type: string;
  status: string;
  created_at: string;
  user: NotificationUserPreview;
};

export type NotificationsListMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type GetNotificationsParams = {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  status?: string;
  sortBy?: string;
  order?: "ASC" | "DESC";
};

export type NotificationsListResult = {
  notifications: NotificationListItem[];
  meta: NotificationsListMeta;
  status: number;
  results: number;
};

function isNotificationRow(x: unknown): x is Record<string, unknown> {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return typeof o.id === "string" && typeof o.user_id === "string" && typeof o.message === "string";
}

function parseUserPreview(raw: unknown): NotificationUserPreview {
  if (!raw || typeof raw !== "object") {
    return { id: "", username: "", full_name: "" };
  }
  const u = raw as Record<string, unknown>;
  return {
    id: typeof u.id === "string" ? u.id : "",
    username: String(u.username ?? ""),
    full_name: String(u.full_name ?? ""),
  };
}

function normalizeNotificationRow(raw: unknown): NotificationListItem | null {
  if (!isNotificationRow(raw)) return null;
  const o = raw as Record<string, unknown>;
  return {
    id: o.id as string,
    user_id: o.user_id as string,
    message: String(o.message),
    type: String(o.type ?? "system"),
    status: String(o.status ?? "unread"),
    created_at: typeof o.created_at === "string" ? o.created_at : String(o.created_at ?? ""),
    user: parseUserPreview(o.user),
  };
}

function parseMeta(raw: unknown): NotificationsListMeta | null {
  if (!raw || typeof raw !== "object") return null;
  const m = raw as Record<string, unknown>;
  const total = typeof m.total === "number" ? m.total : Number(m.total);
  const page = typeof m.page === "number" ? m.page : Number(m.page);
  const limit = typeof m.limit === "number" ? m.limit : Number(m.limit);
  const totalPages = typeof m.totalPages === "number" ? m.totalPages : Number(m.totalPages);
  if (!Number.isFinite(total) || !Number.isFinite(page) || !Number.isFinite(limit)) return null;
  const tp = Number.isFinite(totalPages) ? totalPages : Math.max(1, Math.ceil(total / Math.max(1, limit)));
  return { total, page, limit, totalPages: tp };
}

export function normalizeNotificationsPayload(raw: unknown): NotificationsListResult {
  if (!raw || typeof raw !== "object") {
    return {
      notifications: [],
      meta: { total: 0, page: 1, limit: 20, totalPages: 1 },
      status: 200,
      results: 0,
    };
  }
  const o = raw as Record<string, unknown>;
  const data = Array.isArray(o.data) ? o.data : [];
  const notifications = data.map(normalizeNotificationRow).filter((n): n is NotificationListItem => n !== null);
  const results = typeof o.results === "number" && Number.isFinite(o.results) ? o.results : notifications.length;
  const status = typeof o.status === "number" && Number.isFinite(o.status) ? o.status : 200;
  let meta = parseMeta(o.meta);
  if (!meta) {
    const limit = 20;
    meta = {
      total: notifications.length,
      page: 1,
      limit,
      totalPages: Math.max(1, Math.ceil(notifications.length / limit)),
    };
  }
  return { notifications, meta, status, results };
}

// ── Notification preferences ───────────────────────────────────

export interface NotificationPreferences {
  article_updates: boolean;
  new_followers: boolean;
  new_contributors: boolean;
  comments: boolean;
  weekly_digest: boolean;
  push_browser: boolean;
  // Editor-specific toggles — only surfaced to editors/admins in the UI, but
  // the backend persists them for any user.
  new_submissions: boolean;
  author_messages: boolean;
  revision_updates: boolean;
  flagged_content: boolean;
}

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const { data } = await api.get<{
    email_notifications: {
      article_updates: boolean;
      new_followers: boolean;
      new_contributors: boolean;
      comments: boolean;
      weekly_digest: boolean;
    };
    editor_notifications?: {
      new_submissions?: boolean;
      author_messages?: boolean;
      revision_updates?: boolean;
      flagged_content?: boolean;
    };
    push_notifications: { browser: boolean };
  }>("/author/settings/notifications");
  const editor = data.editor_notifications ?? {};
  return {
    article_updates: data.email_notifications.article_updates,
    new_followers: data.email_notifications.new_followers,
    new_contributors: data.email_notifications.new_contributors,
    comments: data.email_notifications.comments,
    weekly_digest: data.email_notifications.weekly_digest,
    push_browser: data.push_notifications.browser,
    new_submissions: editor.new_submissions ?? false,
    author_messages: editor.author_messages ?? false,
    revision_updates: editor.revision_updates ?? false,
    flagged_content: editor.flagged_content ?? false,
  };
}

export async function updateNotificationPreferences(
  prefs: Partial<NotificationPreferences>,
): Promise<NotificationPreferences> {
  const { data } = await api.patch<{
    email_notifications: {
      article_updates: boolean;
      new_followers: boolean;
      new_contributors: boolean;
      comments: boolean;
      weekly_digest: boolean;
    };
    editor_notifications?: {
      new_submissions?: boolean;
      author_messages?: boolean;
      revision_updates?: boolean;
      flagged_content?: boolean;
    };
    push_notifications: { browser: boolean };
  }>("/author/settings/notifications", prefs);
  const editor = data.editor_notifications ?? {};
  return {
    article_updates: data.email_notifications.article_updates,
    new_followers: data.email_notifications.new_followers,
    new_contributors: data.email_notifications.new_contributors,
    comments: data.email_notifications.comments,
    weekly_digest: data.email_notifications.weekly_digest,
    push_browser: data.push_notifications.browser,
    new_submissions: editor.new_submissions ?? false,
    author_messages: editor.author_messages ?? false,
    revision_updates: editor.revision_updates ?? false,
    flagged_content: editor.flagged_content ?? false,
  };
}

/**
 * GET /notifications — list with filters and pagination (Bearer auth).
 */
export async function getNotifications(params?: GetNotificationsParams): Promise<NotificationsListResult> {
  const query: Record<string, string | number> = {};
  if (params?.page != null) query.page = params.page;
  if (params?.limit != null) query.limit = Math.min(100, Math.max(1, params.limit));
  if (params?.search?.trim()) query.search = params.search.trim();
  if (params?.type?.trim()) query.type = params.type.trim();
  if (params?.status?.trim()) query.status = params.status.trim();
  if (params?.sortBy?.trim()) query.sortBy = params.sortBy.trim();
  if (params?.order) query.order = params.order;

  const { data } = await api.get<unknown>("/notifications", { params: query });
  return normalizeNotificationsPayload(data);
}

/**
 * GET /notifications/user/:userId/unread-count — unread count for one user.
 * Cheaper and more accurate than fetching a list just to read `meta.total`.
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const { data } = await api.get<{ unreadCount?: number }>(
    `/notifications/user/${encodeURIComponent(userId)}/unread-count`,
  );
  const n = Number(data?.unreadCount);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

/** PATCH /notifications/:id/read — mark a single notification as read. */
export async function markNotificationRead(id: string): Promise<void> {
  await api.patch(`/notifications/${encodeURIComponent(id)}/read`);
}

/** PATCH /notifications/user/:userId/read-all — mark all as read. */
export async function markAllNotificationsRead(userId: string): Promise<void> {
  await api.patch(
    `/notifications/user/${encodeURIComponent(userId)}/read-all`,
  );
}

import { api } from "./api";

// ── Types ──────────────────────────────────────────────────────

export interface MessagingSummary {
  unread_messages: number;
  high_priority: number;
  pending_response: number;
  resolved_this_week: number;
}

export interface BackendConversation {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  user_id: string;
  last_message_at: string;
  unread_count: number;
  user?: { id: string; username?: string; full_name?: string; email?: string };
  assignee?: { id: string; username?: string; full_name?: string };
}

export interface BackendMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  created_at?: string;
  createdAt?: string;
  sender?: { id: string; username?: string; full_name?: string };
}

export interface BackendConversationDetail extends BackendConversation {
  Messages?: BackendMessage[];
  messages?: BackendMessage[];
}

export interface ApiTemplate {
  id: string;
  name: string;
  category: string;
  subject: string;
  body: string;
}

// ── Helpers ────────────────────────────────────────────────────

function unwrap<T>(body: unknown): T {
  if (body && typeof body === "object" && "data" in body && (body as { data?: unknown }).data) {
    return (body as { data: T }).data;
  }
  return body as T;
}

function fmtTimestamp(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    " · " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

// ── Thread / Message mapping ───────────────────────────────────

export type FrontendThread = {
  id: string;
  senderName: string;
  priority?: "HIGH" | "MED" | "LOW";
  subject: string;
  preview: string;
  timestamp: string;
  category: "Support" | "Payment" | "Moderation" | "Feedback";
  status: "Inbox" | "Archived";
};

export type FrontendMessage = {
  id: string;
  senderInitials: string;
  body: string;
  timestamp: string;
  align: "left" | "right";
};

export function mapConversation(conv: BackendConversation): FrontendThread {
  const u = conv.user;
  const senderName = u?.full_name || u?.username || "Unknown";

  let priority: FrontendThread["priority"];
  if (conv.priority === "high" || conv.priority === "urgent") priority = "HIGH";
  else if (conv.priority === "low") priority = "LOW";

  let category: FrontendThread["category"] = "Support";
  if (conv.category === "payment") category = "Payment";
  else if (conv.category === "content") category = "Feedback";
  else if (conv.category === "moderation") category = "Moderation";

  const status: FrontendThread["status"] =
    conv.status === "archived" || conv.status === "resolved" ? "Archived" : "Inbox";

  return {
    id: conv.id,
    senderName,
    priority,
    subject: conv.subject,
    preview: conv.subject,
    timestamp: conv.last_message_at ? fmtTimestamp(conv.last_message_at) : "",
    category,
    status,
  };
}

export function mapMessages(
  msgs: BackendMessage[],
  currentUserId?: string | null,
): FrontendMessage[] {
  return msgs.map((m) => {
    const sender = m.sender;
    const name = sender?.full_name || sender?.username || "User";
    const initials = name.split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "U";
    const align = m.sender_id === currentUserId ? "right" : "left";
    const dateStr = m.created_at || m.createdAt || "";
    return {
      id: m.id,
      senderInitials: align === "right" ? "AD" : initials,
      body: m.content,
      timestamp: dateStr ? fmtTimestamp(dateStr) : "",
      align,
    };
  });
}

// ── API calls ──────────────────────────────────────────────────

export async function getMessagingSummary(): Promise<MessagingSummary> {
  const res = await api.get("/messaging/summary");
  return unwrap<MessagingSummary>(res.data);
}

export async function listConversations(status?: "inbox" | "archived", limit = 30): Promise<FrontendThread[]> {
  const endpoint =
    status === "archived"
      ? "/messaging/conversations/archived"
      : "/messaging/conversations";
  const res = await api.get(endpoint, { params: { limit } });
  const body = unwrap<{ conversations?: BackendConversation[] } | BackendConversation[]>(res.data);
  const rows = Array.isArray(body) ? body : (body as { conversations?: BackendConversation[] }).conversations ?? [];
  return rows.map(mapConversation);
}

export async function loadConversationMessages(
  id: string,
  currentUserId?: string | null,
): Promise<FrontendMessage[]> {
  const res = await api.get(`/messaging/conversations/${id}`);
  const conv = unwrap<BackendConversationDetail>(res.data);
  const msgs = conv.Messages ?? conv.messages ?? [];
  return mapMessages(msgs, currentUserId);
}

export async function sendReply(
  conversationId: string,
  content: string,
  templateId?: string,
): Promise<BackendMessage> {
  const body: Record<string, unknown> = { content };
  if (templateId && templateId !== "none") body.template_id = templateId;
  const res = await api.post(`/messaging/conversations/${conversationId}/reply`, body);
  return unwrap<BackendMessage>(res.data);
}

export async function archiveConversation(id: string): Promise<void> {
  await api.patch(`/messaging/conversations/${id}/archive`);
}

export async function fetchTemplates(): Promise<ApiTemplate[]> {
  const res = await api.get("/messaging/templates");
  const body = res.data;
  if (Array.isArray(body)) return body;
  return unwrap<ApiTemplate[]>(body);
}

export async function createApiTemplate(data: Omit<ApiTemplate, "id">): Promise<ApiTemplate> {
  const res = await api.post("/messaging/templates", data);
  return unwrap<ApiTemplate>(res.data);
}

export async function updateApiTemplate(id: string, data: Partial<Omit<ApiTemplate, "id">>): Promise<ApiTemplate> {
  const res = await api.patch(`/messaging/templates/${id}`, data);
  return unwrap<ApiTemplate>(res.data);
}

export async function deleteApiTemplate(id: string): Promise<void> {
  await api.delete(`/messaging/templates/${id}`);
}

const AUDIENCE_MAP: Record<string, string> = {
  allUsers: "all_users",
  authors: "authors",
  editors: "editors",
  contributors: "contributors",
};

export async function sendBroadcastMessage(data: {
  subject: string;
  message: string;
  target_audience: string;
  priority: string;
  template_id?: string;
  send: boolean;
}): Promise<void> {
  await api.post("/messaging/broadcasts", {
    subject: data.subject,
    message: data.message,
    target_audience: AUDIENCE_MAP[data.target_audience] ?? "all_users",
    priority: data.priority,
    template_id: data.template_id && data.template_id !== "none" ? data.template_id : undefined,
    send: data.send,
  });
}

import { api } from "./api";
import { serverGet } from "@/lib/api/isomorphic-fetch";

export type SessionAccess = {
  allowed: boolean;
  reason: string | null;
  matched_step: string | null;
  commons_at: string | null;
  gift: unknown;
};

export type SessionListItem = {
  id: string;
  space: "writing_room" | "waqamh";
  type?: string | null;
  title: string;
  description?: string | null;
  facilitator_id?: string | null;
  facilitator?: { id: string; full_name?: string | null; username?: string | null } | null;
  starts_at?: string | null;
  duration_minutes?: number | null;
  locale?: string | null;
  capacity?: number | null;
  awna_seats: number;
  format: "online" | "in_person" | "hybrid";
  access_rule: "free" | "paid" | "member_included" | "mixed";
  price?: number | null;
  currency?: string | null;
  status: "draft" | "published" | "cancelled" | "completed";
  commons_at?: string | null;
  program_id?: string | null;
};

export type SessionDetail = SessionListItem & {
  access?: SessionAccess;
};

export type Ticket = {
  id: string;
  session_id: string;
  user_id: string;
  type: "free" | "paid" | "member_included" | "gift_value" | "awna_seat";
  amount_paid: number;
  status: "reserved" | "confirmed" | "attended" | "canceled" | "waitlisted";
  qr_code?: string | null;
  checked_in_at?: string | null;
  session?: SessionListItem;
};

export type RegisterSessionResponse = {
  ticket?: Ticket;
  waitlisted?: boolean;
  position?: number;
};

export type WorkshopDraft = {
  id: string;
  session_id: string;
  user_id: string;
  title: string;
  file_path: string;
  file_url?: string | null;
  createdAt?: string;
};

export type DraftComment = {
  id: string;
  draft_id: string;
  author_id: string;
  body: string;
  is_facilitator: boolean;
  parent_comment_id?: string | null;
  createdAt?: string;
};

export type SessionCertificate = {
  id: string;
  user_id: string;
  program_id: string;
  file_path: string;
  file_url?: string | null;
  issued_at: string;
};

type Envelope<T> = { data?: T };

/** Unwraps the `{ status, results, data, meta }` ResponseInterceptor envelope. */
function unwrap<T>(raw: unknown): T | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  return (("data" in o ? o.data : o) as T) ?? null;
}

function unwrapList<T>(raw: unknown): T[] {
  const data = unwrap<T[]>(raw);
  return Array.isArray(data) ? data : [];
}

// ─── Sessions ────────────────────────────────────────────────

export async function listSessionsServer(params?: {
  space?: "writing_room" | "waqamh";
  status?: string;
  page?: number;
  limit?: number;
}): Promise<SessionListItem[]> {
  const raw = await serverGet<Envelope<SessionListItem[]> | SessionListItem[]>(
    "/sessions",
    params,
  );
  return unwrapList<SessionListItem>(raw);
}

export async function listSessions(params?: {
  space?: "writing_room" | "waqamh";
  status?: string;
  page?: number;
  limit?: number;
}): Promise<SessionListItem[]> {
  const { data } = await api.get<unknown>("/sessions", { params });
  return unwrapList<SessionListItem>(data);
}

export async function getSession(id: string): Promise<SessionDetail | null> {
  const { data } = await api.get<unknown>(`/sessions/${encodeURIComponent(id)}`);
  return unwrap<SessionDetail>(data);
}

/** Server-side fetch — used in page.tsx server components. */
export async function getSessionServer(id: string): Promise<SessionDetail | null> {
  const raw = await serverGet<Envelope<SessionDetail> | SessionDetail>(
    `/sessions/${encodeURIComponent(id)}`,
  );
  return unwrap<SessionDetail>(raw);
}

export async function registerForSession(
  id: string,
  opts?: { awna?: boolean },
): Promise<RegisterSessionResponse> {
  const { data } = await api.post<unknown>(
    `/sessions/${encodeURIComponent(id)}/register`,
    opts ?? {},
  );
  return unwrap<RegisterSessionResponse>(data) ?? {};
}

// ─── Tickets ─────────────────────────────────────────────────

export async function listMyTickets(): Promise<Ticket[]> {
  const { data } = await api.get<unknown>("/tickets/mine");
  return unwrapList<Ticket>(data);
}

export async function cancelTicket(id: string): Promise<void> {
  await api.delete(`/tickets/${encodeURIComponent(id)}`);
}

// ─── Workspace (FR-WRM-05) ───────────────────────────────────

export async function listSessionDrafts(sessionId: string): Promise<WorkshopDraft[]> {
  const { data } = await api.get<unknown>(
    `/sessions/${encodeURIComponent(sessionId)}/drafts`,
  );
  return unwrapList<WorkshopDraft>(data);
}

export async function createSessionDraft(
  sessionId: string,
  payload: { title: string; file_path: string },
): Promise<WorkshopDraft> {
  const { data } = await api.post<unknown>(
    `/sessions/${encodeURIComponent(sessionId)}/drafts`,
    payload,
  );
  return unwrap<WorkshopDraft>(data) as WorkshopDraft;
}

export async function listDraftComments(
  sessionId: string,
  draftId: string,
): Promise<DraftComment[]> {
  const { data } = await api.get<unknown>(
    `/sessions/${encodeURIComponent(sessionId)}/drafts/${encodeURIComponent(draftId)}/comments`,
  );
  return unwrapList<DraftComment>(data);
}

export async function createDraftComment(
  sessionId: string,
  draftId: string,
  payload: { body: string; parent_comment_id?: string },
): Promise<DraftComment> {
  const { data } = await api.post<unknown>(
    `/sessions/${encodeURIComponent(sessionId)}/drafts/${encodeURIComponent(draftId)}/comments`,
    payload,
  );
  return unwrap<DraftComment>(data) as DraftComment;
}

// ─── Certificates (FR-WRM-08) ────────────────────────────────

export async function listMyCertificates(): Promise<SessionCertificate[]> {
  const { data } = await api.get<unknown>("/sessions/certificates/mine");
  return unwrapList<SessionCertificate>(data);
}

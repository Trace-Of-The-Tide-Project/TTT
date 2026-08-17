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
  required_tier_rank?: number | null;
  status: "draft" | "published" | "cancelled" | "completed";
  commons_at?: string | null;
  program_id?: string | null;
  recording_id?: string | null;
  voices?: string[];
  online_join_url?: string | null;
  related_issue_id?: string | null;
  related_book_id?: string | null;
};

export type SessionDetail = SessionListItem & {
  access?: SessionAccess;
};

/** Alias used by the admin sessions form/list. */
export type EventSession = SessionDetail;

export type SessionPayload = {
  space: "writing_room" | "waqamh";
  type: string | null;
  title: string;
  description: string | null;
  facilitator_id: string | null;
  starts_at: string | null;
  duration_minutes: number | null;
  capacity: number | null;
  awna_seats: number;
  format: "online" | "in_person" | "hybrid";
  access_rule: string;
  price: number | null;
  currency: string | null;
  required_tier_rank: number | null;
  status: string;
  voices?: string[];
  online_join_url?: string | null;
  related_issue_id?: string | null;
  related_book_id?: string | null;
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

/** Alias used by the admin attendance panel — same shape as Ticket. */
export type SessionTicket = Ticket;

export type SessionStats = {
  registered: number;
  confirmed: number;
  attended: number;
  waitlisted: number;
  awna_seats: number;
  awna_seats_used: number;
  seats_remaining: number | null;
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
  program_title?: string | null;
  file_path: string;
  file_url?: string | null;
  issued_at: string;
};

export type SessionContributionLink = {
  id: string;
  session_id: string;
  article_id: string;
  article?: { id: string; title: string; slug?: string | null } | null;
  session?: SessionListItem;
};

export type TicketInvite = {
  id: string;
  session_id: string;
  gifter_id: string;
  recipient_email: string;
  claimed_at?: string | null;
};

export type GiftTicketResponse = {
  ticket?: Ticket;
  waitlisted?: boolean;
  position?: number;
  invite?: TicketInvite;
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

export type SessionsListMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

/** Admin list — the ResponseInterceptor's `meta` block (from BaseService.findAll pagination). */
export async function listSessionsAdmin(params?: {
  page?: number;
  limit?: number;
  search?: string;
  space?: string;
}): Promise<{ sessions: SessionDetail[]; meta: SessionsListMeta }> {
  const { data } = await api.get<unknown>("/sessions", { params });
  const o = (data ?? {}) as Record<string, unknown>;
  const sessions = Array.isArray(o.data) ? (o.data as SessionDetail[]) : [];
  const rawMeta = (o.meta ?? {}) as Partial<SessionsListMeta>;
  const limit = rawMeta.limit ?? params?.limit ?? 10;
  const total = rawMeta.total ?? sessions.length;
  return {
    sessions,
    meta: {
      total,
      page: rawMeta.page ?? params?.page ?? 1,
      limit,
      totalPages: rawMeta.totalPages ?? Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export async function deleteSession(id: string): Promise<void> {
  await api.delete(`/sessions/${encodeURIComponent(id)}`);
}

export async function createSession(payload: SessionPayload): Promise<SessionDetail> {
  const { data } = await api.post<unknown>("/sessions", payload);
  return unwrap<SessionDetail>(data) as SessionDetail;
}

export async function updateSession(
  id: string,
  payload: Partial<SessionPayload>,
): Promise<SessionDetail> {
  const { data } = await api.patch<unknown>(`/sessions/${encodeURIComponent(id)}`, payload);
  return unwrap<SessionDetail>(data) as SessionDetail;
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

export async function getSessionStats(sessionId: string): Promise<SessionStats> {
  const { data } = await api.get<unknown>(`/sessions/${encodeURIComponent(sessionId)}/report`);
  return unwrap<SessionStats>(data) as SessionStats;
}

export async function listSessionTickets(sessionId: string): Promise<Ticket[]> {
  const { data } = await api.get<unknown>(`/sessions/${encodeURIComponent(sessionId)}/tickets`);
  return unwrapList<Ticket>(data);
}

export async function markTicketAttended(ticketId: string): Promise<Ticket> {
  const { data } = await api.patch<unknown>(`/tickets/${encodeURIComponent(ticketId)}/attend`);
  return unwrap<Ticket>(data) as Ticket;
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

// ─── Waqamh Salon (FR-SLN-05, FR-SLN-08) ─────────────────────

export async function listAudioLibraryServer(params?: {
  page?: number;
  limit?: number;
}): Promise<SessionListItem[]> {
  const raw = await serverGet<Envelope<{ rows: SessionListItem[] }> | { rows: SessionListItem[] }>(
    "/sessions/audio-library",
    params,
  );
  return unwrap<{ rows: SessionListItem[] }>(raw)?.rows ?? [];
}

export async function listSessionContributions(
  sessionId: string,
): Promise<SessionContributionLink[]> {
  const { data } = await api.get<unknown>(
    `/sessions/${encodeURIComponent(sessionId)}/contributions`,
  );
  return unwrapList<SessionContributionLink>(data);
}

export async function linkSessionContribution(
  sessionId: string,
  article_id: string,
): Promise<SessionContributionLink> {
  const { data } = await api.post<unknown>(
    `/sessions/${encodeURIComponent(sessionId)}/contributions`,
    { article_id },
  );
  return unwrap<SessionContributionLink>(data) as SessionContributionLink;
}

export async function unlinkSessionContribution(
  sessionId: string,
  articleId: string,
): Promise<void> {
  await api.delete(
    `/sessions/${encodeURIComponent(sessionId)}/contributions/${encodeURIComponent(articleId)}`,
  );
}

export async function giftTicket(
  sessionId: string,
  recipient_email: string,
): Promise<GiftTicketResponse> {
  const { data } = await api.post<unknown>(
    `/sessions/${encodeURIComponent(sessionId)}/gift-ticket`,
    { recipient_email },
  );
  return unwrap<GiftTicketResponse>(data) ?? {};
}

export async function claimTicketInvite(
  token: string,
): Promise<GiftTicketResponse> {
  const { data } = await api.post<unknown>("/sessions/invites/claim", { token });
  return unwrap<GiftTicketResponse>(data) ?? {};
}

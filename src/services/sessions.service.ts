import { api } from "./api";

export type EventSession = {
  id: string;
  space: "writing_room" | "waqamh";
  type?: string | null;
  title: string;
  description?: string | null;
  facilitator_id?: string | null;
  starts_at?: string | null;
  duration_minutes?: number | null;
  locale?: string | null;
  capacity?: number | null;
  awna_seats: number;
  format: "online" | "in_person" | "hybrid";
  access_rule?: "free" | "paid" | "member_included" | "mixed" | null;
  price?: number | null;
  currency?: string | null;
  required_tier_rank?: number | null;
  status: "draft" | "published" | "cancelled" | "completed";
  program_id?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type SessionPayload = {
  space: "writing_room" | "waqamh";
  type?: string | null;
  title: string;
  description?: string | null;
  facilitator_id?: string | null;
  starts_at?: string | null;
  duration_minutes?: number | null;
  locale?: string | null;
  capacity?: number | null;
  awna_seats: number;
  format: "online" | "in_person" | "hybrid";
  access_rule?: string | null;
  price?: number | null;
  currency?: string | null;
  required_tier_rank?: number | null;
  status?: string | null;
};

export type SessionStats = {
  registered: number;
  confirmed: number;
  attended: number;
  waitlisted: number;
  awna_seats: number;
  awna_seats_used: number;
  seats_remaining: number | null;
};

export type SessionTicket = {
  id: string;
  session_id: string;
  user_id: string;
  type: string;
  amount_paid: number;
  status: string;
  qr_code?: string | null;
  checked_in_at?: string | null;
};

export type SessionsListMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type SessionsAdminResult = {
  sessions: EventSession[];
  meta: SessionsListMeta;
};

export type GetSessionsParams = {
  search?: string;
  page?: number;
  limit?: number;
  space?: string;
  status?: string;
};

function unwrapList(raw: unknown): EventSession[] {
  if (!raw || typeof raw !== "object") return [];
  const o = raw as Record<string, unknown>;
  if (Array.isArray(o.data)) return o.data as EventSession[];
  if (Array.isArray(o.rows)) return o.rows as EventSession[];
  if (Array.isArray(o)) return o as unknown as EventSession[];
  return [];
}

function unwrapOne(raw: unknown): EventSession | null {
  if (!raw || typeof raw !== "object") return null;
  if ("data" in (raw as object)) {
    const inner = (raw as { data?: unknown }).data;
    if (inner && typeof inner === "object" && "id" in (inner as object)) {
      return inner as EventSession;
    }
    return null;
  }
  if ("id" in (raw as object)) return raw as EventSession;
  return null;
}

function unwrapData<T>(raw: unknown): T {
  if (raw && typeof raw === "object" && "data" in (raw as object)) {
    return (raw as { data: T }).data;
  }
  return raw as T;
}

function parseMeta(
  raw: unknown,
  count: number,
  params?: GetSessionsParams,
): SessionsListMeta {
  const fallback: SessionsListMeta = {
    total: count,
    page: params?.page ?? 1,
    limit: params?.limit ?? Math.max(count, 1),
    totalPages: 1,
  };
  if (!raw || typeof raw !== "object") return fallback;
  const m = (raw as { meta?: unknown }).meta;
  if (!m || typeof m !== "object") return fallback;
  const o = m as Record<string, unknown>;
  const num = (v: unknown, d: number) =>
    typeof v === "number" && Number.isFinite(v) ? v : d;
  return {
    total: num(o.total, fallback.total),
    page: num(o.page, fallback.page),
    limit: num(o.limit, fallback.limit),
    totalPages: Math.max(1, num(o.totalPages, fallback.totalPages)),
  };
}

export async function getSessionsAdmin(
  params?: GetSessionsParams,
): Promise<SessionsAdminResult> {
  const { data } = await api.get<unknown>("/sessions", { params });
  const sessions = unwrapList(data);
  return { sessions, meta: parseMeta(data, sessions.length, params) };
}

export async function getSession(id: string): Promise<EventSession | null> {
  try {
    const { data } = await api.get<unknown>(`/sessions/${encodeURIComponent(id)}`);
    return unwrapOne(data);
  } catch {
    return null;
  }
}

export async function createSession(payload: SessionPayload): Promise<EventSession> {
  const { data } = await api.post<unknown>("/sessions", payload);
  const item = unwrapOne(data);
  if (!item) throw new Error("Invalid response from create session");
  return item;
}

export async function updateSession(
  id: string,
  payload: Partial<SessionPayload>,
): Promise<EventSession> {
  const { data } = await api.patch<unknown>(`/sessions/${encodeURIComponent(id)}`, payload);
  const item = unwrapOne(data);
  if (!item) throw new Error("Invalid response from update session");
  return item;
}

export async function deleteSession(id: string): Promise<void> {
  await api.delete(`/sessions/${encodeURIComponent(id)}`);
}

export async function getSessionStats(id: string): Promise<SessionStats> {
  const { data } = await api.get<unknown>(`/sessions/${encodeURIComponent(id)}/report`);
  return unwrapData<SessionStats>(data);
}

export async function getSessionTickets(id: string): Promise<SessionTicket[]> {
  const { data } = await api.get<unknown>(`/sessions/${encodeURIComponent(id)}/tickets`);
  const list = unwrapData<SessionTicket[]>(data);
  return Array.isArray(list) ? list : [];
}

export async function markTicketAttended(ticketId: string): Promise<SessionTicket> {
  const { data } = await api.patch<unknown>(`/tickets/${encodeURIComponent(ticketId)}/attend`);
  return unwrapData<SessionTicket>(data);
}

import { api } from "./api";

export type OpinionSubmissionStatus = "new" | "reviewing" | "accepted" | "rejected";

export type OpinionSubmission = {
  id: string;
  title: string;
  body: string;
  author_name: string;
  author_email: string;
  bio?: string | null;
  language: string;
  status: OpinionSubmissionStatus;
  article_id?: string | null;
  createdAt: string;
  updatedAt: string;
};

type Envelope<T> = { data?: T; meta?: { total: number; page: number; limit: number; totalPages: number } };

function unwrapList<T>(raw: unknown): T[] {
  if (!raw || typeof raw !== "object") return [];
  const o = raw as Record<string, unknown>;
  const data = "data" in o ? o.data : raw;
  return Array.isArray(data) ? (data as T[]) : [];
}

/** GET /opinion-submissions — admin/editor moderation queue. */
export async function listOpinionSubmissions(params?: {
  status?: OpinionSubmissionStatus;
  page?: number;
  limit?: number;
}): Promise<OpinionSubmission[]> {
  const { data } = await api.get<unknown>("/opinion-submissions", { params });
  return unwrapList<OpinionSubmission>(data);
}

/** PATCH /opinion-submissions/{id} — status transition, optionally linking article_id. */
export async function updateOpinionSubmission(
  id: string,
  payload: { status?: OpinionSubmissionStatus; article_id?: string },
): Promise<OpinionSubmission> {
  const { data } = await api.patch<Envelope<OpinionSubmission>>(
    `/opinion-submissions/${encodeURIComponent(id)}`,
    payload,
  );
  return (data?.data ?? (data as unknown as OpinionSubmission));
}

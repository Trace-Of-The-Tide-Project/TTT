import { api } from "./api";
import { serverGet } from "@/lib/api/isomorphic-fetch";

/** A Living-Dictionary entry as returned by the public list +
 * detail endpoints. Fields are loose because OpenAPI doesn't declare
 * the response shape. */
export type DictionaryEntry = {
  id: string;
  title?: string | null;
  definition_or_thought?: string | null;
  author_name?: string | null;
  status?: string | null;
  createdAt?: string | null;
  user?: {
    full_name?: string | null;
    username?: string | null;
    profile?: {
      display_name?: string | null;
      job_title?: string | null;
      avatar?: string | null;
    } | null;
  } | null;
};

function unwrapOne(raw: unknown): DictionaryEntry | null {
  if (!raw || typeof raw !== "object") return null;
  if ("data" in (raw as object)) {
    return ((raw as { data?: DictionaryEntry }).data ?? null);
  }
  return raw as DictionaryEntry;
}

function unwrapList(raw: unknown): DictionaryEntry[] {
  if (!raw || typeof raw !== "object") return [];
  const o = raw as Record<string, unknown>;
  if (Array.isArray(o.data)) return o.data as DictionaryEntry[];
  if (Array.isArray(o)) return o as unknown as DictionaryEntry[];
  return [];
}

export type GetDictionaryParams = {
  page?: number;
  limit?: number;
  search?: string;
};

/** GET /dictionary — public list of approved entries. Server- or
 * client-safe; returns [] on failure. */
export async function getDictionaryEntries(
  params?: GetDictionaryParams,
): Promise<DictionaryEntry[]> {
  if (typeof window === "undefined") {
    return unwrapList(await serverGet<unknown>("/dictionary", params));
  }
  try {
    const { data } = await api.get<unknown>("/dictionary", { params });
    return unwrapList(data);
  } catch {
    return [];
  }
}

/** GET /dictionary/{id} — public. Works server- or client-side.
 * Returns null on 404 / error. */
export async function getDictionaryEntry(
  id: string,
): Promise<DictionaryEntry | null> {
  if (typeof window === "undefined") {
    const raw = await serverGet<unknown>(
      `/dictionary/${encodeURIComponent(id)}`,
    );
    return unwrapOne(raw);
  }
  try {
    const { data } = await api.get<unknown>(
      `/dictionary/${encodeURIComponent(id)}`,
    );
    return unwrapOne(data);
  } catch {
    return null;
  }
}

export type SubmitDictionaryNotePayload = {
  title: string;
  definition_or_thought: string;
  /** Ignored server-side when the submitter is authenticated. */
  author_name?: string;
};

export type SubmitDictionaryNoteResponse = {
  id?: string;
  status?: string;
  message?: string;
};

/** POST /dictionary/submit — public, guest-allowed. */
export async function submitDictionaryNote(
  payload: SubmitDictionaryNotePayload,
): Promise<SubmitDictionaryNoteResponse> {
  const { data } = await api.post<SubmitDictionaryNoteResponse>(
    "/dictionary/submit",
    payload,
  );
  return data ?? {};
}

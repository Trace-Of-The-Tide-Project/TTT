import { api } from "./api";

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

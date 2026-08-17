import { api } from "./api";

export type CreateOpinionSubmissionPayload = {
  title: string;
  body: string;
  author_name: string;
  author_email: string;
  bio?: string;
  language?: string;
};

export type CreateOpinionSubmissionResponse = {
  received: boolean;
};

/** POST /opinion-submissions — public, no auth (FR-OPN-03). */
export async function submitOpinionPiece(
  payload: CreateOpinionSubmissionPayload,
): Promise<CreateOpinionSubmissionResponse> {
  const { data } = await api.post<CreateOpinionSubmissionResponse>(
    "/opinion-submissions",
    payload,
  );
  return data ?? { received: true };
}

import { api } from "./api";

/** Backend documents `POST /issue-pledges` as "public — guest or
 * authenticated". The exact request shape isn't declared in OpenAPI,
 * so we send the conventional fields the rest of the app uses for
 * money flows (amount in USD, optional message, optional contact
 * info) and let the server reject anything extra. */
export type CreatePledgePayload = {
  /** The magazine_issue id this pledge is for. */
  issue_id: string;
  /** Whole dollars (or fractional — backend can validate). */
  amount: number;
  /** Optional public message attached to the pledge. */
  message?: string;
  /** Optional contact email for guests so backend can email a
   * receipt / payment confirmation. */
  email?: string;
};

export type CreatePledgeResponse = {
  id?: string;
  status?: string;
  /** Some backends return a hosted-payment URL the client should
   * redirect to (Stripe Checkout etc.). When present we route the
   * user there from the modal. */
  payment_url?: string | null;
  message?: string;
};

/** POST /issue-pledges — public (guest or authenticated). */
export async function createIssuePledge(
  payload: CreatePledgePayload,
): Promise<CreatePledgeResponse> {
  const { data } = await api.post<CreatePledgeResponse>(
    "/issue-pledges",
    payload,
  );
  return data ?? {};
}

export type GetIssuePledgesParams = {
  issue_id?: string;
  status?: string;
  page?: number;
  limit?: number;
};

export type IssuePledge = {
  id: string;
  issue_id?: string | null;
  amount?: number | null;
  status?: string | null;
  user_id?: string | null;
  email?: string | null;
  message?: string | null;
  createdAt?: string;
};

function unwrapList(raw: unknown): IssuePledge[] {
  if (!raw || typeof raw !== "object") return [];
  const o = raw as Record<string, unknown>;
  if (Array.isArray(o.data)) return o.data as IssuePledge[];
  if (Array.isArray(o)) return o as unknown as IssuePledge[];
  return [];
}

/** GET /issue-pledges — admin in the OpenAPI spec, but the call
 * succeeds for authenticated users in practice. Used to compute
 * funding stats per issue. Returns [] on failure so callers can
 * fall back to "0 raised / 0 supporters" without breaking the page. */
export async function getIssuePledges(
  params?: GetIssuePledgesParams,
): Promise<IssuePledge[]> {
  try {
    const { data } = await api.get<unknown>("/issue-pledges", { params });
    return unwrapList(data);
  } catch {
    return [];
  }
}

/** Aggregate pledges into the {raised, supporters} pair the Open
 * Issues cards display. Counts only `captured` pledges by default —
 * matches what a webhook would mark as actually-paid. */
export function aggregatePledges(
  pledges: IssuePledge[],
  options: { onlyCaptured?: boolean } = {},
): { raised: number; supporters: number } {
  const { onlyCaptured = true } = options;
  const relevant = onlyCaptured
    ? pledges.filter((p) => p.status === "captured")
    : pledges;
  let raised = 0;
  const donors = new Set<string>();
  for (const p of relevant) {
    raised += Number(p.amount) || 0;
    const key = p.user_id || p.email || p.id;
    if (key) donors.add(key);
  }
  return { raised, supporters: donors.size };
}

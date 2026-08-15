import { api } from "./api";
import { routing } from "@/i18n/routing";

export type GiftScopeType = "contribution" | "issue" | "book" | "session" | "platform";
export type GiftType = "monetary" | "in_kind" | "request_access" | "editorial";
export type GiftStatus = "pending" | "approved" | "active" | "expired" | "revoked";

export type GiftGrant = {
  id: string;
  user_id: string;
  granted_by?: string | null;
  type: GiftType;
  scope_type: GiftScopeType;
  scope_id?: string | null;
  in_kind_description?: string | null;
  starts_at: string;
  expires_at?: string | null;
  status: GiftStatus;
  amount?: number | null;
  currency?: string | null;
  note?: string | null;
  createdAt?: string;
};

/** Unwrap the ResponseInterceptor envelope `{ status, results, data, meta }`. */
function unwrap<T>(raw: unknown): T | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  return (("data" in o ? o.data : o) as T) ?? null;
}

function safeLocale(locale?: string): string {
  return locale && (routing.locales as readonly string[]).includes(locale)
    ? locale
    : routing.defaultLocale;
}

export type CreateGiftPayload = {
  scope_type: GiftScopeType;
  scope_id?: string;
  amount?: number;
  in_kind_description?: string;
};

/**
 * POST /gifts — a monetary gift returns a Stripe Checkout URL to redirect to;
 * an in-kind gift returns the created (pending) GiftGrant.
 */
export async function createGiftCheckout(
  payload: CreateGiftPayload,
  locale?: string,
): Promise<string> {
  const { data } = await api.post<unknown>("/gifts", {
    ...payload,
    locale: safeLocale(locale),
  });
  const inner = unwrap<{ url?: string }>(data);
  if (!inner?.url) throw new Error("Gift checkout did not return a URL");
  return inner.url;
}

export async function submitInKindGift(payload: CreateGiftPayload): Promise<GiftGrant> {
  const { data } = await api.post<unknown>("/gifts", payload);
  const inner = unwrap<GiftGrant>(data);
  if (!inner) throw new Error("Gift submission failed");
  return inner;
}

export type RequestAccessPayload = {
  resource_id: string;
  resource_type: "contribution" | "issue" | "book" | "session";
  note?: string;
};

/** POST /access/request — never refused; auto-approved after 72h if unanswered. */
export async function requestAccess(payload: RequestAccessPayload): Promise<GiftGrant> {
  const { data } = await api.post<unknown>("/access/request", payload);
  const inner = unwrap<GiftGrant>(data);
  if (!inner) throw new Error("Access request failed");
  return inner;
}

/** GET /me/gifts — the current user's gift history. */
export async function getMyGifts(): Promise<GiftGrant[]> {
  try {
    const { data } = await api.get<unknown>("/me/gifts");
    const rows = unwrap<GiftGrant[]>(data);
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

/** GET /admin/gifts?status=pending — editor moderation queue. */
export async function listPendingGifts(status = "pending"): Promise<GiftGrant[]> {
  try {
    const { data } = await api.get<unknown>("/admin/gifts", { params: { status } });
    const rows = unwrap<GiftGrant[]>(data);
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

/** PATCH /admin/gifts/:id/approve */
export async function approveGift(
  id: string,
  payload: { expires_at?: string } = {},
): Promise<GiftGrant> {
  const { data } = await api.patch<unknown>(
    `/admin/gifts/${encodeURIComponent(id)}/approve`,
    payload,
  );
  const inner = unwrap<GiftGrant>(data);
  if (!inner) throw new Error("Approve failed");
  return inner;
}

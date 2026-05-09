import { api } from "./api";

export type SubscribeNewsletterPayload = {
  email: string;
  /** Optional: scope the subscription to a specific magazine. The
   * backend documents the subscribe endpoint as "Subscribe to a
   * magazine newsletter (public)" so the magazine_id is the natural
   * scoping field. Omit for site-wide subscription. */
  magazine_id?: string;
  /** Optional locale tag — useful so the confirmation email can
   * choose the right language. */
  locale?: string;
};

export type SubscribeNewsletterResponse = {
  id?: string;
  email?: string;
  status?: string;
  message?: string;
};

/** POST /newsletter-subscribers/subscribe — public, no auth. */
export async function subscribeNewsletter(
  payload: SubscribeNewsletterPayload,
): Promise<SubscribeNewsletterResponse> {
  const { data } = await api.post<SubscribeNewsletterResponse>(
    "/newsletter-subscribers/subscribe",
    payload,
  );
  return data ?? {};
}

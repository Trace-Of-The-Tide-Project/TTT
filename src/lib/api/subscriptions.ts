import { serverGet } from './isomorphic-fetch';

export interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  price_monthly: number;
  currency: string;
  features: string[];
  status: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  current_period_end: string | null;
  grace_period_end: string | null;
  cancel_at_period_end: boolean;
  source: string;
  plan: SubscriptionPlan | null;
}

/** Server-side: fetch all active plans (public endpoint). */
export async function fetchPlans(): Promise<SubscriptionPlan[]> {
  const data = await serverGet<SubscriptionPlan[]>('/subscriptions/plans');
  return data ?? [];
}

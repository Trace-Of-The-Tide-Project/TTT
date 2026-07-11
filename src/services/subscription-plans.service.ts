import { api } from "./api";

export type AdminSubscriptionPlan = {
  id: string;
  name: string;
  display_name: string;
  stripe_price_id?: string;
  stripe_product_id?: string | null;
  price_monthly?: number;
  currency?: string;
  features?: string[];
  status?: string;
};

export type CreatePlanPayload = {
  name: string;
  display_name: string;
  price_monthly: number;
  currency?: string;
  features?: string[];
};

export type UpdatePlanPayload = Partial<{
  display_name: string;
  price_monthly: number;
  currency: string;
  stripe_price_id: string;
  status: string;
  features: string[];
}>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(r: { data: any }): T {
  return (r.data?.data ?? r.data) as T;
}

export async function createPlan(
  payload: CreatePlanPayload,
): Promise<AdminSubscriptionPlan> {
  return unwrap(await api.post("/admin/subscriptions/plans", payload));
}

export async function updatePlan(
  id: string,
  payload: UpdatePlanPayload,
): Promise<AdminSubscriptionPlan> {
  return unwrap(await api.patch(`/admin/subscriptions/plans/${id}`, payload));
}

export async function archivePlan(
  id: string,
): Promise<AdminSubscriptionPlan> {
  return unwrap(await api.delete(`/admin/subscriptions/plans/${id}`));
}

export async function banSubscriber(userId: string): Promise<{
  user_id: string;
  banned: boolean;
  subscription_cancelled: boolean;
}> {
  return unwrap(await api.post(`/admin/subscriptions/${userId}/ban`));
}

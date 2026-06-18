'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '@/services/api';
import type { SubscriptionPlan, UserSubscription } from '@/lib/api/subscriptions';

export interface SubscriptionContextValue {
  subscription: UserSubscription | null;
  plans: SubscriptionPlan[];
  loading: boolean;
  refetch: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get('/subscriptions/me').catch(() => ({ data: null })),
      api.get('/subscriptions/plans').catch(() => ({ data: [] })),
    ]).then(([meRes, plansRes]: [{ data: UserSubscription | null }, { data: { data?: SubscriptionPlan[] } | SubscriptionPlan[] }]) => {
      setSubscription(meRes.data ?? null);
      const plansData = plansRes.data?.data ?? plansRes.data;
      setPlans(Array.isArray(plansData) ? plansData : []);
    }).finally(() => setLoading(false));
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <SubscriptionContext.Provider value={{ subscription, plans, loading, refetch: fetchData }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription(): SubscriptionContextValue {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
}

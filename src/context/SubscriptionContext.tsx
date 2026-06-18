'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/components/providers/AuthProvider';
import type { SubscriptionPlan, UserSubscription } from '@/lib/api/subscriptions';

export interface SubscriptionContextValue {
  subscription: UserSubscription | null;
  plans: SubscriptionPlan[];
  loading: boolean;
  refetch: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback((isAuthenticated: boolean) => {
    setLoading(true);
    Promise.all([
      isAuthenticated
        ? api.get('/subscriptions/me').catch(() => ({ data: null }))
        : Promise.resolve({ data: null }),
      api.get('/subscriptions/plans').catch(() => ({ data: [] })),
    ]).then(([meRes, plansRes]: [{ data: UserSubscription | null }, { data: unknown }]) => {
      setSubscription(meRes.data ?? null);
      const raw = plansRes.data as { data?: SubscriptionPlan[] } | SubscriptionPlan[];
      const plansData = Array.isArray(raw) ? raw : raw.data;
      setPlans(Array.isArray(plansData) ? plansData : []);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (status === 'loading') return;
    fetchData(status === 'authenticated');
  }, [status, fetchData]);

  return (
    <SubscriptionContext.Provider value={{ subscription, plans, loading, refetch: () => fetchData(status === 'authenticated') }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription(): SubscriptionContextValue {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
}

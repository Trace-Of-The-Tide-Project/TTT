'use client';
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import type { SubscriptionFeature } from './PremiumGate.types';

export type { SubscriptionFeature };

interface Props {
  feature: SubscriptionFeature;
  children: React.ReactNode;
}

export default function PremiumGate({ feature, children }: Props) {
  const [status, setStatus] = useState<'loading' | 'allowed' | 'locked'>('loading');

  useEffect(() => {
    api
      .get('/subscriptions/me')
      .then((r: { data: any }) => {
        const sub = r.data;
        if (!sub) { setStatus('locked'); return; }
        const grace = sub.grace_period_end ? new Date(sub.grace_period_end) : null;
        const withinGrace = grace && grace > new Date();
        const active = (sub.status === 'active' || sub.status === 'past_due') && withinGrace;
        const hasFeature = sub.plan?.features?.includes(feature);
        setStatus(active && hasFeature ? 'allowed' : 'locked');
      })
      .catch(() => setStatus('locked'));
  }, [feature]);

  if (status === 'loading') {
    return <div className="h-32 bg-gray-100 animate-pulse rounded-xl" />;
  }

  if (status === 'locked') {
    return (
      <div className="relative">
        <div className="blur-sm pointer-events-none select-none" aria-hidden>
          {children}
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 rounded-xl gap-3">
          <p className="font-semibold text-gray-800">Premium content</p>
          <p className="text-sm text-gray-500">Subscribe to continue reading.</p>
          <a
            href="/subscribe"
            className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            View Plans
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

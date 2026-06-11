'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import type { SubscriptionPlan } from '@/lib/api/subscriptions';

interface Props {
  plans: SubscriptionPlan[];
  locale: string;
}

const FEATURE_LABELS: Record<string, string> = {
  magazine: 'Full magazine access',
  articles: 'All premium articles',
  books: 'PDF book library',
};

export default function SubscribePage({ plans, locale }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubscribe(planId: string) {
    setLoading(planId);
    try {
      const res = await api.post('/subscriptions/checkout', {
        plan_id: planId,
        locale,
      });
      router.push(res.data.url);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Something went wrong. Please try again.';
      alert(msg);
    } finally {
      setLoading(null);
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-center mb-4">Choose Your Plan</h1>
      <p className="text-center text-gray-600 mb-12">
        Unlock premium articles, magazine issues, and more.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="border rounded-xl p-8 flex flex-col gap-4 shadow-sm"
          >
            <div>
              <h2 className="text-xl font-semibold">{plan.display_name}</h2>
              <p className="text-3xl font-bold mt-2">
                ${Number(plan.price_monthly).toFixed(2)}
                <span className="text-base font-normal text-gray-500">/mo</span>
              </p>
            </div>
            <ul className="flex flex-col gap-2 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <span className="text-green-500">✓</span>
                  {FEATURE_LABELS[f] ?? f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe(plan.id)}
              disabled={loading === plan.id}
              className="mt-4 bg-gray-900 text-white rounded-lg px-6 py-3 font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {loading === plan.id ? 'Redirecting…' : 'Subscribe'}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}

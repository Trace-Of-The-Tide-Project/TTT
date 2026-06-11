'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/services/api';
import type { UserSubscription } from '@/lib/api/subscriptions';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: 'Active', color: 'bg-green-100 text-green-800' },
  trialing: { label: 'Trial', color: 'bg-blue-100 text-blue-800' },
  past_due: { label: 'Past Due', color: 'bg-yellow-100 text-yellow-800' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  expired: { label: 'Expired', color: 'bg-gray-100 text-gray-600' },
};

export default function SubscriptionSettingsPage() {
  const [sub, setSub] = useState<UserSubscription | null | undefined>(undefined);
  const [portalLoading, setPortalLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const showSuccess = searchParams.get('success') === '1';

  useEffect(() => {
    api.get<UserSubscription>('/subscriptions/me').then((r) => setSub(r.data)).catch(() => setSub(null));
  }, []);

  async function handlePortal() {
    setPortalLoading(true);
    try {
      const res = await api.post('/subscriptions/portal');
      router.push(res.data.url);
    } catch {
      alert('Could not open billing portal. Please try again.');
    } finally {
      setPortalLoading(false);
    }
  }

  if (sub === undefined) {
    return <div className="p-8">Loading…</div>;
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Subscription</h1>

      {showSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm">
          You&apos;re now subscribed! Welcome aboard.
        </div>
      )}

      {sub ? (
        <div className="border rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-lg">{sub.plan?.display_name ?? 'Subscription'}</p>
              <p className="text-sm text-gray-500 capitalize">{sub.source} subscription</p>
            </div>
            {STATUS_LABELS[sub.status] && (
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_LABELS[sub.status].color}`}>
                {STATUS_LABELS[sub.status].label}
              </span>
            )}
          </div>

          {sub.current_period_end && (
            <p className="text-sm text-gray-600">
              {sub.cancel_at_period_end ? 'Access until: ' : 'Renews: '}
              <strong>{new Date(sub.current_period_end).toLocaleDateString()}</strong>
            </p>
          )}

          {sub.grace_period_end && sub.status !== 'active' && (
            <p className="text-sm text-yellow-700">
              Grace period ends: {new Date(sub.grace_period_end).toLocaleDateString()}
            </p>
          )}

          {sub.source === 'stripe' && (
            <button
              onClick={handlePortal}
              disabled={portalLoading}
              className="mt-2 border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              {portalLoading ? 'Opening…' : 'Manage Subscription'}
            </button>
          )}
        </div>
      ) : (
        <div className="border rounded-xl p-6 text-center">
          <p className="text-gray-600 mb-4">You don&apos;t have an active subscription.</p>
          <a
            href="/subscribe"
            className="inline-block bg-gray-900 text-white rounded-lg px-6 py-3 font-medium hover:bg-gray-700 transition-colors"
          >
            View Plans
          </a>
        </div>
      )}
    </main>
  );
}

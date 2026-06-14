'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/services/api';
import type { UserSubscription } from '@/lib/api/subscriptions';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active:   { label: 'Active',   color: '#22c55e' },
  trialing: { label: 'Trial',    color: '#6db3ae' },
  past_due: { label: 'Past Due', color: '#f59e0b' },
  cancelled:{ label: 'Cancelled',color: '#ef4444' },
  expired:  { label: 'Expired',  color: '#666'    },
};

export default function SubscriptionSettingsPage() {
  const [sub, setSub] = useState<UserSubscription | null | undefined>(undefined);
  const [portalLoading, setPortalLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const showSuccess = searchParams.get('success') === '1';

  useEffect(() => {
    api.get<{ data: UserSubscription }>('/subscriptions/me')
      .then((r) => setSub(r.data.data ?? r.data as any))
      .catch(() => setSub(null));
  }, []);

  async function handlePortal() {
    setPortalLoading(true);
    try {
      const res = await api.post('/subscriptions/portal');
      router.push(res.data.url ?? res.data.data?.url);
    } catch {
      alert('Could not open billing portal. Please try again.');
    } finally {
      setPortalLoading(false);
    }
  }

  if (sub === undefined) {
    return (
      <main className="max-w-xl mx-auto px-4 py-16 text-center">
        <p style={{ color: '#555', fontSize: 14 }}>Loading…</p>
      </main>
    );
  }

  const status = sub ? STATUS_LABELS[sub.status] : null;

  return (
    <main className="max-w-xl mx-auto px-4 py-14">

      {/* ── PAGE TITLE ── */}
      <p className="text-xs uppercase tracking-[3px] mb-2" style={{ color: '#cba158' }}>
        Account
      </p>
      <h1 className="text-2xl font-bold mb-8" style={{ color: '#ededed' }}>
        Subscription
      </h1>

      {/* ── SUCCESS BANNER ── */}
      {showSuccess && (
        <div
          className="flex items-start gap-3 rounded-xl px-5 py-4 mb-6"
          style={{ background: 'rgba(203,161,88,0.08)', border: '1px solid rgba(203,161,88,0.3)' }}
        >
          <span style={{ color: '#cba158', fontSize: 18, lineHeight: 1.4 }}>✦</span>
          <div>
            <p className="font-semibold text-sm mb-0.5" style={{ color: '#cba158' }}>
              You&apos;re now subscribed!
            </p>
            <p className="text-xs leading-relaxed" style={{ color: '#888' }}>
              Welcome aboard. You now have full access to everything included in your plan.
            </p>
          </div>
        </div>
      )}

      {/* ── SUBSCRIPTION CARD ── */}
      {sub ? (
        <div
          className="rounded-xl p-6 flex flex-col gap-5"
          style={{ border: '1px solid #2a2a2a', background: '#141414' }}
        >
          {/* Plan + status row */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[2px] mb-1" style={{ color: '#cba158' }}>
                Current plan
              </p>
              <p className="text-lg font-bold" style={{ color: '#ededed' }}>
                {sub.plan?.display_name ?? 'Subscription'}
              </p>
              <p className="text-xs mt-0.5 capitalize" style={{ color: '#555' }}>
                {sub.source} subscription
              </p>
            </div>
            {status && (
              <span
                className="text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full flex-shrink-0"
                style={{ background: `${status.color}18`, color: status.color, border: `1px solid ${status.color}40` }}
              >
                {status.label}
              </span>
            )}
          </div>

          {/* Renewal / expiry */}
          {sub.current_period_end && (
            <div style={{ borderTop: '1px solid #1e1e1e', paddingTop: 16 }}>
              <p className="text-xs" style={{ color: '#555' }}>
                {sub.cancel_at_period_end ? 'Access until' : 'Renews on'}
              </p>
              <p className="text-sm font-semibold mt-0.5" style={{ color: '#ccc' }}>
                {new Date(sub.current_period_end).toLocaleDateString(undefined, {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
              </p>
            </div>
          )}

          {/* Grace period warning */}
          {sub.grace_period_end && sub.status !== 'active' && (
            <div
              className="rounded-lg px-4 py-3 text-xs leading-relaxed"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', color: '#f59e0b' }}
            >
              Grace period ends {new Date(sub.grace_period_end).toLocaleDateString(undefined, {
                year: 'numeric', month: 'long', day: 'numeric',
              })}. Renew to keep access.
            </div>
          )}

          {/* Manage button */}
          {sub.source === 'stripe' && (
            <button
              onClick={handlePortal}
              disabled={portalLoading}
              className="w-full py-3 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ border: '1px solid #2e2e2e', background: 'transparent', color: '#aaa' }}
            >
              {portalLoading ? 'Opening…' : 'Manage Subscription'}
            </button>
          )}
        </div>
      ) : (
        /* ── NO SUBSCRIPTION ── */
        <div
          className="rounded-xl p-8 text-center flex flex-col items-center gap-4"
          style={{ border: '1px solid #2a2a2a', background: '#141414' }}
        >
          <p className="text-sm" style={{ color: '#666' }}>
            You don&apos;t have an active subscription.
          </p>
          <a
            href="/subscribe"
            className="inline-block px-6 py-3 rounded-lg text-sm font-semibold transition-colors"
            style={{ background: '#cba158', color: '#000' }}
          >
            View Plans
          </a>
        </div>
      )}

    </main>
  );
}

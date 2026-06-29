'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { api } from '@/services/api';
import type { UserSubscription } from '@/lib/api/subscriptions';

const STATUS_COLORS: Record<string, { color: string }> = {
  active:   { color: '#22c55e' },
  trialing: { color: '#6db3ae' },
  past_due: { color: '#f59e0b' },
  cancelled:{ color: '#ef4444' },
  expired:  { color: '#666'    },
};

export default function SubscriptionSettingsPage() {
  const t = useTranslations('Dashboard.subscriptions');
  const [sub, setSub] = useState<UserSubscription | null | undefined>(undefined);
  const [portalLoading, setPortalLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const showSuccess = searchParams.get('success') === '1';

  useEffect(() => {
    api.get<{ data: UserSubscription }>('/subscriptions/me')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((r) => setSub(r.data.data ?? r.data as any))
      .catch(() => setSub(null));
  }, []);

  async function handlePortal() {
    setPortalLoading(true);
    try {
      const res = await api.post('/subscriptions/portal');
      router.push(res.data.url ?? res.data.data?.url);
    } catch {
      alert(t('settings.portalError'));
    } finally {
      setPortalLoading(false);
    }
  }

  if (sub === undefined) {
    return (
      <main className="max-w-xl mx-auto px-4 py-16 text-center">
        <p style={{ color: 'var(--tott-muted)', fontSize: 14 }}>{t('loading')}</p>
      </main>
    );
  }

  const status = sub ? STATUS_COLORS[sub.status] : null;

  return (
    <main className="max-w-xl mx-auto px-4 py-14">

      {/* ── PAGE TITLE ── */}
      <p className="text-xs uppercase tracking-[3px] mb-2" style={{ color: 'var(--tott-dash-gold-label)' }}>
        {t('settings.eyebrow')}
      </p>
      <h1 className="text-2xl font-bold mb-8" style={{ color: 'var(--foreground)' }}>
        {t('settings.title')}
      </h1>

      {/* ── SUCCESS BANNER ── */}
      {showSuccess && (
        <div
          className="flex items-start gap-3 rounded-xl px-5 py-4 mb-6"
          style={{ background: 'rgba(203,161,88,0.08)', border: '1px solid rgba(203,161,88,0.3)' }}
        >
          <span style={{ color: 'var(--tott-accent-gold)', fontSize: 18, lineHeight: 1.4 }}>✦</span>
          <div>
            <p className="font-semibold text-sm mb-0.5" style={{ color: 'var(--tott-accent-gold)' }}>
              {t('settings.successTitle')}
            </p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--tott-muted)' }}>
              {t('settings.successBody')}
            </p>
          </div>
        </div>
      )}

      {/* ── SUBSCRIPTION CARD ── */}
      {sub ? (
        <div
          className="rounded-xl p-6 flex flex-col gap-5"
          style={{ border: '1px solid var(--tott-card-border)', background: 'var(--tott-elevated)' }}
        >
          {/* Plan + status row */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[2px] mb-1" style={{ color: 'var(--tott-dash-gold-label)' }}>
                {t('settings.currentPlan')}
              </p>
              <p className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
                {sub.plan?.display_name ?? t('settings.title')}
              </p>
              <p className="text-xs mt-0.5 capitalize" style={{ color: 'var(--tott-muted)' }}>
                {t('settings.sourceSubscription', { source: sub.source })}
              </p>
            </div>
            {status && (
              <span
                className="text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full flex-shrink-0"
                style={{ background: `${status.color}18`, color: status.color, border: `1px solid ${status.color}40` }}
              >
                {t(`status.${sub.status}`)}
              </span>
            )}
          </div>

          {/* Renewal / expiry */}
          {sub.current_period_end && (
            <div style={{ borderTop: '1px solid var(--tott-card-border)', paddingTop: 16 }}>
              <p className="text-xs" style={{ color: 'var(--tott-muted)' }}>
                {sub.cancel_at_period_end ? t('settings.accessUntil') : t('settings.renewsOn')}
              </p>
              <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--foreground)' }}>
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
              {t('settings.gracePeriod', {
                date: new Date(sub.grace_period_end).toLocaleDateString(undefined, {
                  year: 'numeric', month: 'long', day: 'numeric',
                }),
              })}
            </div>
          )}

          {/* Manage button */}
          {sub.source === 'stripe' && (
            <button
              onClick={handlePortal}
              disabled={portalLoading}
              className="w-full py-3 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ border: '1px solid var(--tott-card-border)', background: 'transparent', color: 'var(--tott-muted)' }}
            >
              {portalLoading ? t('settings.opening') : t('settings.manage')}
            </button>
          )}
        </div>
      ) : (
        /* ── NO SUBSCRIPTION ── */
        <div
          className="rounded-xl p-8 text-center flex flex-col items-center gap-4"
          style={{ border: '1px solid var(--tott-card-border)', background: 'var(--tott-elevated)' }}
        >
          <p className="text-sm" style={{ color: 'var(--tott-muted)' }}>
            {t('settings.noSubscription')}
          </p>
          <Link
            href="/subscribe"
            className="inline-block px-6 py-3 rounded-lg text-sm font-semibold transition-colors"
            style={{ background: 'var(--tott-accent-gold)', color: 'var(--tott-on-accent)' }}
          >
            {t('settings.viewPlans')}
          </Link>
        </div>
      )}

    </main>
  );
}

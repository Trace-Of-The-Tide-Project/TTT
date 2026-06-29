'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { api } from '@/services/api';

interface StatsData {
  mrr: number;
  currency: string;
  active_subscribers: number;
  by_plan: Record<string, number>;
  churn_this_month: number;
  monthly_counts: Array<{ month: string; count: number }>;
}

export default function AdminSubscriptionStatsPage() {
  const t = useTranslations('Dashboard.subscriptions');
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    api.get('/admin/subscriptions/stats').then((r: { data: any }) => {
      setStats(r.data?.data ?? r.data);
    });
  }, []);

  if (!stats) {
    return (
      <div className="p-6">
        <p className="text-sm" style={{ color: 'var(--tott-muted)' }}>{t('loading')}</p>
      </div>
    );
  }

  const maxCount = Math.max(...stats.monthly_counts.map((m) => m.count), 1);

  const statCards = [
    { label: t('stats.mrr'), value: `$${Number(stats.mrr).toFixed(2)}`, color: '#cba158' },
    { label: t('stats.activeSubscribers'), value: String(stats.active_subscribers), color: '#22c55e' },
    { label: t('stats.churn'), value: String(stats.churn_this_month), color: '#ef4444' },
    ...Object.entries(stats.by_plan).map(([plan, count]) => ({
      label: plan,
      value: String(count),
      color: '#6db3ae',
    })),
  ];

  return (
    <div className="p-6 max-w-4xl">

      {/* ── HEADER ── */}
      <div className="flex items-center gap-4 mb-8">
        <a
          href="../subscriptions"
          className="text-xs uppercase tracking-[2px] px-4 py-2 rounded-lg"
          style={{ border: '1px solid var(--tott-card-border)', color: 'var(--tott-muted)', background: 'transparent' }}
        >
          ← {t('stats.backToSubscribers')}
        </a>
        <div>
          <p className="text-xs uppercase tracking-[3px] mb-0.5" style={{ color: 'var(--tott-dash-gold-label)' }}>{t('admin')}</p>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{t('revenueStats')}</h1>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {statCards.map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-xl p-4"
            style={{ border: '1px solid var(--tott-card-border)', background: 'var(--tott-elevated)' }}
          >
            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--tott-muted)' }}>{label}</p>
            <p className="text-3xl font-extrabold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── BAR CHART ── */}
      <div
        className="rounded-xl p-6"
        style={{ border: '1px solid var(--tott-card-border)', background: 'var(--tott-elevated)' }}
      >
        <p className="text-xs uppercase tracking-[3px] mb-6" style={{ color: 'var(--tott-dash-gold-label)' }}>
          {t('stats.chartTitle')}
        </p>
        <div className="flex items-end gap-3 h-36">
          {stats.monthly_counts.map((m) => {
            const barH = Math.max((m.count / maxCount) * 120, m.count > 0 ? 4 : 0);
            return (
              <div key={m.month} className="flex flex-col items-center flex-1 gap-1.5">
                <span className="text-xs" style={{ color: 'var(--tott-muted)' }}>{m.count || ''}</span>
                <div
                  className="w-full rounded-t"
                  style={{ height: `${barH}px`, background: '#cba158', opacity: 0.7 }}
                />
                <span className="text-xs" style={{ color: 'var(--tott-muted)' }}>{m.month.slice(5)}</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

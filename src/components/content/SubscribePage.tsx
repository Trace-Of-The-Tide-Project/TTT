'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { api } from '@/services/api';
import type { SubscriptionPlan } from '@/lib/api/subscriptions';

interface Props {
  plans: SubscriptionPlan[];
  locale: string;
}

export default function SubscribePage({ plans, locale }: Props) {
  const t = useTranslations('subscribe');
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubscribe(planId: string) {
    setLoading(planId);
    try {
      const res = await api.post('/subscriptions/checkout', { plan_id: planId, locale });
      router.push(res.data.data.url);
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? t('error.generic');
      alert(msg);
    } finally {
      setLoading(null);
    }
  }

  const safePlans = Array.isArray(plans) ? plans : [];
  const sorted = [...safePlans].sort((a, b) => Number(a.price_monthly) - Number(b.price_monthly));

  if (sorted.length === 0) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-24 text-center">
        <p style={{ color: 'var(--tott-home-text-muted)' }}>{t('empty')}</p>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 pb-24">

      {/* ── HERO ── */}
      <section className="relative text-center py-20 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-64"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--tott-accent-gold) 12%, transparent), transparent 70%)' }}
        />
        <p className="relative text-xs uppercase tracking-[3px] mb-5" style={{ color: 'var(--tott-home-eyebrow)' }}>
          {t('hero.eyebrow')}
        </p>
        <h1
          className="relative text-4xl md:text-5xl font-bold leading-tight mb-5"
          style={{ color: 'var(--tott-home-text-strong)', letterSpacing: '-0.5px' }}
        >
          {t('hero.title')}
        </h1>
        <p className="relative max-w-md mx-auto leading-relaxed" style={{ color: 'var(--tott-home-text-muted)', fontSize: '15px' }}>
          {t('hero.subtitle')}
        </p>
        <div className="relative mx-auto mt-8" style={{ width: 40, height: 2, background: 'var(--tott-accent-gold)' }} />
      </section>

      {/* ── PLAN CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {sorted.map((plan) => {
          const isFeatured = plan.name === 'subscriber';
          const isLoading = loading === plan.id;

          return (
            <div
              key={plan.id}
              className="relative rounded-xl p-7 flex flex-col"
              style={{
                border: isFeatured
                  ? '1px solid var(--tott-accent-gold)'
                  : '1px solid var(--tott-card-border)',
                background: isFeatured
                  ? 'color-mix(in srgb, var(--tott-accent-gold) 6%, var(--tott-panel-bg))'
                  : 'var(--tott-panel-bg)',
              }}
            >
              {isFeatured && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-extrabold uppercase tracking-widest rounded-full"
                  style={{ top: -12, background: 'var(--tott-accent-gold)', color: 'var(--tott-on-accent)' }}
                >
                  {t('plan.mostPopular')}
                </div>
              )}

              <p className="text-xs uppercase tracking-[3px] mb-4" style={{ color: 'var(--tott-home-eyebrow)' }}>
                {plan.display_name}
              </p>

              <div className="flex items-start gap-0.5 mb-1">
                <span className="text-xl font-semibold mt-2" style={{ color: 'var(--tott-home-text-strong)' }}>£</span>
                <span className="text-5xl font-extrabold leading-none" style={{ color: 'var(--tott-home-text-strong)', letterSpacing: '-1px' }}>
                  {Math.floor(Number(plan.price_monthly))}
                </span>
              </div>
              <p className="text-sm mb-4" style={{ color: 'var(--tott-home-text-muted)' }}>{t('plan.perMonth')}</p>

              <p className="text-xs leading-relaxed mb-5" style={{ color: 'var(--tott-home-text-muted)' }}>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {t(`plan.desc.${plan.name}` as any)}
              </p>

              <div className="flex flex-col gap-2.5 pt-5 mb-6 flex-1" style={{ borderTop: '1px solid var(--tott-card-border)' }}>
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] flex-shrink-0"
                      style={{ background: 'color-mix(in srgb, var(--tott-accent-gold) 12%, transparent)', color: 'var(--tott-home-eyebrow)' }}
                    >
                      ✦
                    </span>
                    <span className="text-sm" style={{ color: 'var(--tott-home-text-muted)' }}>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {t(`features.${f}` as any) ?? f}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={isLoading}
                className="w-full py-3 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={
                  isFeatured
                    ? { background: 'var(--tott-accent-gold)', color: 'var(--tott-on-accent)', border: '1px solid var(--tott-accent-gold)' }
                    : { background: 'transparent', color: 'var(--tott-home-eyebrow)', border: '1px solid var(--tott-accent-gold)' }
                }
              >
                {isLoading ? t('plan.redirecting') : t('plan.subscribe')}
              </button>
            </div>
          );
        })}
      </div>

      {/* ── TRUST LINE ── */}
      <div className="flex items-center justify-center gap-4 text-xs mb-16" style={{ color: 'var(--tott-home-text-muted)' }}>
        <span>🔒 {t('trust.stripe')}</span>
        <span style={{ color: 'var(--tott-card-border)' }}>·</span>
        <span>{t('trust.cancel')}</span>
        <span style={{ color: 'var(--tott-card-border)' }}>·</span>
        <span>{t('trust.billing')}</span>
      </div>

      {/* ── FAQ ── */}
      <section style={{ borderTop: '1px solid var(--tott-card-border)', paddingTop: 40 }}>
        <p className="text-center text-xs uppercase tracking-[3px] mb-7" style={{ color: 'var(--tott-home-eyebrow)' }}>
          {t('faq.title')}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {(['1', '2', '3', '4'] as const).map((n) => (
            <div key={n}>
              <p className="text-sm font-semibold mb-1.5" style={{ color: 'var(--tott-home-text-strong)' }}>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {t(`faq.q${n}` as any)}
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--tott-home-text-muted)' }}>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {t(`faq.a${n}` as any)}
              </p>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}

'use client';
import Link from 'next/link';
import { useSubscription } from '@/context/SubscriptionContext';
import type { SubscriptionFeature } from './PremiumGate.types';

export type { SubscriptionFeature };

interface Props {
  feature: SubscriptionFeature;
  children: React.ReactNode;
  upgradeMessage?: string;
}

function isActiveAccess(sub: { status: string; grace_period_end: string | null } | null): boolean {
  if (!sub) return false;
  if (sub.status === 'active' || sub.status === 'trialing') return true;
  if (sub.status === 'past_due') {
    const grace = sub.grace_period_end ? new Date(sub.grace_period_end) : null;
    return grace !== null && grace > new Date();
  }
  return false;
}

export default function PremiumGate({ feature, children, upgradeMessage }: Props) {
  const { subscription, plans, loading } = useSubscription();

  if (loading) {
    return <div className="h-32 bg-gray-100 animate-pulse rounded-xl" />;
  }

  const active = isActiveAccess(subscription);
  const hasFeature = active && (subscription?.plan?.features?.includes(feature) ?? false);

  if (hasFeature) return <>{children}</>;

  // Derive cheapest plan that includes this feature
  const unlockingPlans = plans
    .filter((p) => p.features.includes(feature) && p.status === 'active')
    .sort((a, b) => a.price_monthly - b.price_monthly);
  const cheapestUnlock = unlockingPlans[0] ?? null;

  // Expired case: had a sub but it lapsed
  const isExpired =
    subscription !== null &&
    !active &&
    (subscription.status === 'cancelled' ||
      subscription.status === 'expired' ||
      subscription.status === 'past_due');

  // Needs upgrade case: active sub but plan doesn't include feature
  const needsUpgrade = active && !hasFeature;

  let heading = 'Premium content';
  let body = upgradeMessage ?? 'Subscribe to continue reading.';
  let actionLabel = 'View Plans';
  let actionHref = '/subscribe';

  if (isExpired) {
    heading = 'Subscription expired';
    body = upgradeMessage ?? 'Renew your subscription to regain access.';
    actionLabel = 'Renew';
    actionHref = '/settings/subscription';
  } else if (needsUpgrade && cheapestUnlock) {
    heading = `Requires ${cheapestUnlock.display_name}`;
    body =
      upgradeMessage ??
      `This content requires ${cheapestUnlock.display_name} ($${cheapestUnlock.price_monthly}/mo).`;
    actionLabel = 'Upgrade';
    actionHref = '/settings/subscription';
  } else if (!subscription && cheapestUnlock) {
    heading = 'Premium content';
    body =
      upgradeMessage ??
      `Available on ${cheapestUnlock.display_name} ($${cheapestUnlock.price_monthly}/mo) and above.`;
    actionLabel = 'Subscribe';
    actionHref = '/subscribe';
  }

  return (
    <div className="relative">
      <div className="blur-sm pointer-events-none select-none" aria-hidden>
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 rounded-xl gap-3">
        <p className="font-semibold text-gray-800">{heading}</p>
        <p className="text-sm text-gray-500 text-center px-4">{body}</p>
        <Link
          href={actionHref}
          className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          {actionLabel}
        </Link>
      </div>
    </div>
  );
}

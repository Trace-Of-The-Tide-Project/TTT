import { fetchPlans } from '@/lib/api/subscriptions';
import SubscribePage from '@/components/content/SubscribePage';

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const plans = await fetchPlans();
  return <SubscribePage plans={plans} locale={locale} />;
}

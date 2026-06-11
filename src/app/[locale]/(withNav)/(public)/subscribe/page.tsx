import { fetchPlans } from '@/lib/api/subscriptions';
import SubscribePage from '@/components/content/SubscribePage';

export default async function Page({ params }: { params: { locale: string } }) {
  const plans = await fetchPlans();
  return <SubscribePage plans={plans} locale={params.locale} />;
}

'use client';
import { useEffect, useState } from 'react';
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
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    api.get('/admin/subscriptions/stats').then((r: { data: StatsData }) => setStats(r.data));
  }, []);

  if (!stats) return <div className="p-6">Loading…</div>;

  const maxCount = Math.max(...stats.monthly_counts.map((m) => m.count), 1);

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <a href="../subscriptions" className="text-sm text-blue-600 hover:underline">← Subscribers</a>
        <h1 className="text-xl font-bold">Revenue & Stats</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="MRR" value={`$${stats.mrr.toFixed(2)}`} />
        <StatCard label="Active Subscribers" value={String(stats.active_subscribers)} />
        <StatCard label="Churn This Month" value={String(stats.churn_this_month)} />
        {Object.entries(stats.by_plan).map(([plan, count]) => (
          <StatCard key={plan} label={plan} value={String(count)} />
        ))}
      </div>

      <div>
        <h2 className="font-semibold mb-3">New Subscribers (Last 6 Months)</h2>
        <div className="flex items-end gap-2 h-32">
          {stats.monthly_counts.map((m) => (
            <div key={m.month} className="flex flex-col items-center flex-1 gap-1">
              <span className="text-xs text-gray-500">{m.count}</span>
              <div
                className="w-full bg-gray-900 rounded-t"
                style={{ height: `${Math.max((m.count / maxCount) * 96, m.count > 0 ? 4 : 0)}px` }}
              />
              <span className="text-xs text-gray-400">{m.month.slice(5)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border rounded-xl p-4">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

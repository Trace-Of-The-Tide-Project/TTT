'use client';
import { useEffect, useState } from 'react';
import { api } from '@/services/api';

interface SubscriberRow {
  id: string;
  user_id: string;
  user_email: string | null;
  user_name: string | null;
  plan_name: string | null;
  plan_key: string | null;
  status: string;
  source: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  past_due: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
  expired: 'bg-gray-100 text-gray-600',
  trialing: 'bg-blue-100 text-blue-800',
};

export default function AdminSubscriptionsPage() {
  const [rows, setRows] = useState<SubscriberRow[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [status, setStatus] = useState('');
  const [revokeTarget, setRevokeTarget] = useState<SubscriberRow | null>(null);
  const [grantTarget, setGrantTarget] = useState<string | null>(null);
  const [grantPlanId, setGrantPlanId] = useState('');
  const [plans, setPlans] = useState<Array<{ id: string; display_name: string }>>([]);

  useEffect(() => {
    api.get('/subscriptions/plans').then((r: { data: Array<{ id: string; display_name: string }> }) => setPlans(r.data));
  }, []);

  function load(page = 1) {
    const params: any = { page, limit: 20 };
    if (status) params.status = status;
    api.get('/admin/subscriptions', { params }).then((r: { data: { rows: SubscriberRow[]; meta: { total: number; page: number; totalPages: number } } }) => {
      setRows(r.data.rows);
      setMeta(r.data.meta);
    });
  }

  useEffect(() => { load(); }, [status]);

  async function handleRevoke() {
    if (!revokeTarget) return;
    await api.delete(`/admin/subscriptions/${revokeTarget.user_id}`);
    setRevokeTarget(null);
    load();
  }

  async function handleGrant() {
    if (!grantTarget || !grantPlanId) return;
    await api.post('/admin/subscriptions/grant', { user_id: grantTarget, plan_id: grantPlanId });
    setGrantTarget(null);
    setGrantPlanId('');
    load();
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Subscribers</h1>
        <a href="subscriptions/stats" className="text-sm text-blue-600 hover:underline">View Stats →</a>
      </div>

      <div className="flex gap-3 mb-4">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {['active', 'past_due', 'cancelled', 'expired', 'trialing'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="py-2 pr-4">User</th>
              <th className="py-2 pr-4">Plan</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Renews</th>
              <th className="py-2 pr-4">Source</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b hover:bg-gray-50">
                <td className="py-2 pr-4">
                  <p className="font-medium">{row.user_name ?? '—'}</p>
                  <p className="text-gray-500">{row.user_email ?? '—'}</p>
                </td>
                <td className="py-2 pr-4">{row.plan_name ?? '—'}</td>
                <td className="py-2 pr-4">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[row.status] ?? ''}`}>
                    {row.status}
                  </span>
                </td>
                <td className="py-2 pr-4 text-gray-500">
                  {row.current_period_end
                    ? new Date(row.current_period_end).toLocaleDateString()
                    : '—'}
                </td>
                <td className="py-2 pr-4 capitalize">{row.source}</td>
                <td className="py-2 flex gap-2">
                  <button
                    onClick={() => setGrantTarget(row.user_id)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Grant
                  </button>
                  <button
                    onClick={() => setRevokeTarget(row)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Revoke
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-3 mt-4 text-sm text-gray-500">
        <span>{meta.total} total</span>
        {meta.page > 1 && (
          <button onClick={() => load(meta.page - 1)} className="text-blue-600 hover:underline">← Prev</button>
        )}
        {meta.page < meta.totalPages && (
          <button onClick={() => load(meta.page + 1)} className="text-blue-600 hover:underline">Next →</button>
        )}
      </div>

      {revokeTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h2 className="font-semibold mb-2">Revoke subscription?</h2>
            <p className="text-sm text-gray-600 mb-4">
              This will immediately cancel access for <strong>{revokeTarget.user_email}</strong>.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setRevokeTarget(null)} className="text-sm px-4 py-2 border rounded">Cancel</button>
              <button onClick={handleRevoke} className="text-sm px-4 py-2 bg-red-600 text-white rounded">Revoke</button>
            </div>
          </div>
        </div>
      )}

      {grantTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h2 className="font-semibold mb-4">Grant subscription</h2>
            <select
              value={grantPlanId}
              onChange={(e) => setGrantPlanId(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm mb-4"
            >
              <option value="">Select a plan…</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>{p.display_name}</option>
              ))}
            </select>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setGrantTarget(null)} className="text-sm px-4 py-2 border rounded">Cancel</button>
              <button onClick={handleGrant} disabled={!grantPlanId} className="text-sm px-4 py-2 bg-gray-900 text-white rounded disabled:opacity-50">Grant</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

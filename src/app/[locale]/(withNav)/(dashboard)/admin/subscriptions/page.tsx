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
  plan_id?: string | null;
  status: string;
  source: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
}

const STATUS_STYLE: Record<string, { color: string; label: string }> = {
  active:    { color: '#22c55e', label: 'Active' },
  past_due:  { color: '#f59e0b', label: 'Past Due' },
  cancelled: { color: '#ef4444', label: 'Cancelled' },
  expired:   { color: '#666',    label: 'Expired' },
  trialing:  { color: '#6db3ae', label: 'Trial' },
};

const PLAN_BADGE: Record<string, { color: string; bg: string }> = {
  reader:  { color: '#6db3ae', bg: '#6db3ae18' },
  full:    { color: '#cba158', bg: '#cba15818' },
};

const CHANGEABLE_STATUSES = new Set(['active', 'trialing', 'past_due']);

function PlanBadge({ planKey, planName }: { planKey: string | null; planName: string | null }) {
  if (!planName) return <span style={{ color: '#555' }}>—</span>;
  const style = planKey ? PLAN_BADGE[planKey] : null;
  if (!style) return <span className="text-sm" style={{ color: '#aaa' }}>{planName}</span>;
  return (
    <span
      className="text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ background: style.bg, color: style.color, border: `1px solid ${style.color}40` }}
    >
      {planName}
    </span>
  );
}

export default function AdminSubscriptionsPage() {
  const [rows, setRows]                   = useState<SubscriberRow[]>([]);
  const [meta, setMeta]                   = useState({ total: 0, page: 1, totalPages: 1 });
  const [statusFilter, setStatus]         = useState('');
  const [planFilter, setPlanFilter]       = useState('');
  const [revokeTarget, setRevokeTarget]   = useState<SubscriberRow | null>(null);
  const [grantTarget, setGrantTarget]     = useState<SubscriberRow | null>(null);
  const [changePlanTarget, setChangePlan] = useState<SubscriberRow | null>(null);
  const [grantPlanId, setGrantPlanId]     = useState('');
  const [changePlanId, setChangePlanId]   = useState('');
  const [plans, setPlans]                 = useState<Array<{ id: string; display_name: string; name: string }>>([]);
  const [loading, setLoading]             = useState(false);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    api.get('/subscriptions/plans').then((r: { data: any }) => {
      const data = r.data?.data ?? r.data;
      setPlans(Array.isArray(data) ? data : []);
    });
  }, []);

  function load(page = 1) {
    setLoading(true);
    const params: Record<string, string | number> = { page, limit: 20 };
    if (statusFilter) params.status = statusFilter;
    if (planFilter) params.plan_id = planFilter;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    api.get('/admin/subscriptions', { params }).then((r: { data: any }) => {
        const body = r.data?.data ?? r.data;
        setRows(body?.rows ?? []);
        setMeta(body?.meta ?? { total: 0, page: 1, totalPages: 1 });
      })
      .finally(() => setLoading(false));
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [statusFilter, planFilter]);

  async function handleRevoke() {
    if (!revokeTarget) return;
    await api.delete(`/admin/subscriptions/${revokeTarget.user_id}`);
    setRevokeTarget(null);
    load();
  }

  async function handleGrant() {
    if (!grantTarget || !grantPlanId) return;
    await api.post('/admin/subscriptions/grant', { user_id: grantTarget.user_id, plan_id: grantPlanId });
    setGrantTarget(null);
    setGrantPlanId('');
    load();
  }

  async function handleChangePlan() {
    if (!changePlanTarget || !changePlanId) return;
    await api.post('/admin/subscriptions/grant', { user_id: changePlanTarget.user_id, plan_id: changePlanId });
    setChangePlan(null);
    setChangePlanId('');
    load();
  }

  return (
    <div className="p-6 max-w-6xl">

      {/* ── HEADER ── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[3px] mb-1" style={{ color: '#cba158' }}>Admin</p>
          <h1 className="text-2xl font-bold" style={{ color: '#ededed' }}>Subscriptions</h1>
        </div>
        <a
          href="subscriptions/stats"
          className="text-xs uppercase tracking-[2px] px-4 py-2 rounded-lg transition-colors"
          style={{ border: '1px solid #2a2a2a', color: '#cba158', background: 'transparent' }}
        >
          Revenue & Stats →
        </a>
      </div>

      {/* ── STATUS FILTER BAR ── */}
      <div className="flex items-center gap-3 mb-3">
        {['', 'active', 'past_due', 'cancelled', 'expired', 'trialing'].map((s) => {
          const active = statusFilter === s;
          const style = s ? STATUS_STYLE[s] : null;
          return (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className="text-xs px-3 py-1.5 rounded-full font-medium transition-colors"
              style={
                active
                  ? { background: style ? style.color : '#cba158', color: '#000' }
                  : { background: '#1a1a1a', color: '#666', border: '1px solid #2a2a2a' }
              }
            >
              {s ? (STATUS_STYLE[s]?.label ?? s) : 'All'}
            </button>
          );
        })}
        {loading && <span className="text-xs ml-2" style={{ color: '#555' }}>Loading…</span>}
        <span className="ml-auto text-xs" style={{ color: '#555' }}>{meta.total} subscribers</span>
      </div>

      {/* ── PLAN FILTER BAR ── */}
      {plans.length > 0 && (
        <div className="flex items-center gap-3 mb-5">
          {[{ id: '', display_name: 'All Plans', name: '' }, ...plans].map((p) => {
            const active = planFilter === p.id;
            const badge = p.name ? PLAN_BADGE[p.name] : null;
            return (
              <button
                key={p.id}
                onClick={() => setPlanFilter(p.id)}
                className="text-xs px-3 py-1.5 rounded-full font-medium transition-colors"
                style={
                  active
                    ? { background: badge ? badge.color : '#cba158', color: '#000' }
                    : { background: '#1a1a1a', color: '#666', border: '1px solid #2a2a2a' }
                }
              >
                {p.display_name}
              </button>
            );
          })}
        </div>
      )}

      {/* ── TABLE ── */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #2a2a2a' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #2a2a2a', background: '#141414' }}>
              {['User', 'Plan', 'Status', 'Renews', 'Source', 'Actions'].map((h) => (
                <th key={h} className="text-left py-3 px-4 text-xs uppercase tracking-wider font-semibold" style={{ color: '#555' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm" style={{ color: '#555' }}>
                  No subscribers found.
                </td>
              </tr>
            )}
            {rows.map((row, i) => {
              const st = STATUS_STYLE[row.status];
              const canChange = CHANGEABLE_STATUSES.has(row.status);
              return (
                <tr
                  key={row.id}
                  style={{
                    borderBottom: i < rows.length - 1 ? '1px solid #1a1a1a' : 'none',
                    background: 'transparent',
                  }}
                >
                  <td className="py-3 px-4">
                    <p className="font-medium text-sm" style={{ color: '#ededed' }}>{row.user_name ?? '—'}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#555' }}>{row.user_email ?? '—'}</p>
                  </td>
                  <td className="py-3 px-4">
                    <PlanBadge planKey={row.plan_key} planName={row.plan_name} />
                  </td>
                  <td className="py-3 px-4">
                    {st ? (
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: `${st.color}18`, color: st.color, border: `1px solid ${st.color}40` }}
                      >
                        {st.label}
                      </span>
                    ) : (
                      <span className="text-xs" style={{ color: '#555' }}>{row.status}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm" style={{ color: '#666' }}>
                    {row.current_period_end
                      ? new Date(row.current_period_end).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                      : '—'}
                  </td>
                  <td className="py-3 px-4 text-xs capitalize" style={{ color: '#666' }}>
                    {row.source}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-3">
                      {canChange ? (
                        <button
                          onClick={() => { setChangePlan(row); setChangePlanId(''); }}
                          className="text-xs font-medium transition-colors"
                          style={{ color: '#6db3ae' }}
                        >
                          Change Plan
                        </button>
                      ) : (
                        <button
                          onClick={() => { setGrantTarget(row); setGrantPlanId(''); }}
                          className="text-xs font-medium transition-colors"
                          style={{ color: '#cba158' }}
                        >
                          Grant
                        </button>
                      )}
                      <button
                        onClick={() => setRevokeTarget(row)}
                        className="text-xs font-medium transition-colors"
                        style={{ color: '#ef4444' }}
                      >
                        Revoke
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── PAGINATION ── */}
      {meta.totalPages > 1 && (
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={() => load(meta.page - 1)}
            disabled={meta.page <= 1}
            className="text-xs px-3 py-1.5 rounded-lg disabled:opacity-30"
            style={{ border: '1px solid #2a2a2a', color: '#aaa', background: 'transparent' }}
          >
            ← Prev
          </button>
          <span className="text-xs" style={{ color: '#555' }}>
            Page {meta.page} of {meta.totalPages}
          </span>
          <button
            onClick={() => load(meta.page + 1)}
            disabled={meta.page >= meta.totalPages}
            className="text-xs px-3 py-1.5 rounded-lg disabled:opacity-30"
            style={{ border: '1px solid #2a2a2a', color: '#aaa', background: 'transparent' }}
          >
            Next →
          </button>
        </div>
      )}

      {/* ── REVOKE MODAL ── */}
      {revokeTarget && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="rounded-xl p-6 max-w-sm w-full mx-4" style={{ background: '#141414', border: '1px solid #2a2a2a' }}>
            <h2 className="font-semibold mb-1" style={{ color: '#ededed' }}>Revoke subscription?</h2>
            <p className="text-sm mb-5" style={{ color: '#666' }}>
              This will immediately cancel access for <span style={{ color: '#ccc' }}>{revokeTarget.user_email}</span>.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setRevokeTarget(null)}
                className="text-sm px-4 py-2 rounded-lg"
                style={{ border: '1px solid #2a2a2a', color: '#aaa', background: 'transparent' }}
              >
                Cancel
              </button>
              <button
                onClick={handleRevoke}
                className="text-sm px-4 py-2 rounded-lg font-semibold"
                style={{ background: '#ef4444', color: '#fff' }}
              >
                Revoke
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── GRANT MODAL ── */}
      {grantTarget && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="rounded-xl p-6 max-w-sm w-full mx-4" style={{ background: '#141414', border: '1px solid #2a2a2a' }}>
            <h2 className="font-semibold mb-1" style={{ color: '#ededed' }}>Grant subscription</h2>
            <p className="text-sm mb-4" style={{ color: '#666' }}>
              Granting access to <span style={{ color: '#ccc' }}>{grantTarget.user_email}</span>
            </p>
            <select
              value={grantPlanId}
              onChange={(e) => setGrantPlanId(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm mb-4"
              style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#ededed' }}
            >
              <option value="">Select a plan…</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>{p.display_name}</option>
              ))}
            </select>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setGrantTarget(null)}
                className="text-sm px-4 py-2 rounded-lg"
                style={{ border: '1px solid #2a2a2a', color: '#aaa', background: 'transparent' }}
              >
                Cancel
              </button>
              <button
                onClick={handleGrant}
                disabled={!grantPlanId}
                className="text-sm px-4 py-2 rounded-lg font-semibold disabled:opacity-40"
                style={{ background: '#cba158', color: '#000' }}
              >
                Grant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CHANGE PLAN MODAL ── */}
      {changePlanTarget && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="rounded-xl p-6 max-w-sm w-full mx-4" style={{ background: '#141414', border: '1px solid #2a2a2a' }}>
            <h2 className="font-semibold mb-1" style={{ color: '#ededed' }}>Change plan</h2>
            <p className="text-sm mb-1" style={{ color: '#666' }}>
              User: <span style={{ color: '#ccc' }}>{changePlanTarget.user_email}</span>
            </p>
            <p className="text-sm mb-4" style={{ color: '#666' }}>
              Current plan: <span style={{ color: '#ccc' }}>{changePlanTarget.plan_name ?? '—'}</span>
            </p>
            <select
              value={changePlanId}
              onChange={(e) => setChangePlanId(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm mb-4"
              style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#ededed' }}
            >
              <option value="">Select new plan…</option>
              {plans
                .filter((p) => p.id !== changePlanTarget.plan_id)
                .map((p) => (
                  <option key={p.id} value={p.id}>{p.display_name}</option>
                ))}
            </select>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setChangePlan(null)}
                className="text-sm px-4 py-2 rounded-lg"
                style={{ border: '1px solid #2a2a2a', color: '#aaa', background: 'transparent' }}
              >
                Cancel
              </button>
              <button
                onClick={handleChangePlan}
                disabled={!changePlanId}
                className="text-sm px-4 py-2 rounded-lg font-semibold disabled:opacity-40"
                style={{ background: '#6db3ae', color: '#000' }}
              >
                Change Plan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

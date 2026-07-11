"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { AlertTriangleIcon, MoreDotsIcon } from "@/components/ui/icons";
import { api } from "@/services/api";

const FINANCE_TAB_IDS = ["donations", "payouts", "suspicious", "invoices"] as const;
type FinanceTabId = (typeof FINANCE_TAB_IDS)[number];

interface DonationRow {
  id: string;
  donor_name: string | null;
  donor_email: string | null;
  recipient_name: string | null;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

interface PayoutRow {
  id: string;
  creator_name: string | null;
  creator_email: string | null;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

interface FraudFlag {
  id: string;
  flag_type: string;
  severity: string;
  status: string;
  user_email: string | null;
  amount: number | null;
  created_at: string;
  notes: string | null;
}

function fmt(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function RowActions({ onViewDetails }: { onViewDetails?: () => void }) {
  const ta = useTranslations("Dashboard.financePage.actions");
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number; placeAbove: boolean } | null>(null);

  const menuWidth = 160;
  const menuMargin = 8;

  const updatePosition = useMemo(() => {
    return () => {
      const btn = buttonRef.current;
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const viewportW = window.innerWidth;
      const viewportH = window.innerHeight;
      const left = Math.min(Math.max(8, rect.right - menuWidth), Math.max(8, viewportW - menuWidth - 8));
      const estimatedHeight = 2 * 40 + 12 + 8;
      const spaceBelow = viewportH - rect.bottom;
      const placeAbove = spaceBelow < estimatedHeight + menuMargin;
      const top = placeAbove ? rect.top - menuMargin : rect.bottom + menuMargin;
      setMenuPos({ top, left, placeAbove });
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePosition();
    function onDocMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }
    function onDocKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onDocKeyDown);
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onDocKeyDown);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, updatePosition]);

  return (
    <div className="relative flex justify-end">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg p-2 text-[var(--tott-muted)] transition-colors hover:bg-[var(--tott-dash-ghost-hover)] hover:text-foreground"
        aria-label={ta("rowAria")}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <MoreDotsIcon />
      </button>
      {open &&
        menuPos &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            className="fixed z-9999 w-[160px] rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] p-2 shadow-xl"
            style={{
              left: menuPos.left,
              top: menuPos.placeAbove ? undefined : menuPos.top,
              bottom: menuPos.placeAbove ? window.innerHeight - menuPos.top : undefined,
            }}
          >
            <div className="mb-1 border-t border-[var(--tott-card-border)]" />
            <button
              type="button"
              className="w-full rounded-md px-3 py-2 text-start text-sm text-foreground hover:bg-[var(--tott-dash-ghost-hover)]"
              onClick={() => { onViewDetails?.(); setOpen(false); }}
            >
              {ta("viewDetails")}
            </button>
            <button
              type="button"
              className="w-full rounded-md px-3 py-2 text-start text-sm text-foreground hover:bg-[var(--tott-dash-ghost-hover)]"
              onClick={() => setOpen(false)}
            >
              {ta("refund")}
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
}

export function FinanceContent() {
  const t = useTranslations("Dashboard.financePage");
  const td = useTranslations("Dashboard.financePage.donations");
  const tp = useTranslations("Dashboard.financePage.payouts");
  const ts = useTranslations("Dashboard.financePage.suspicious");

  const [activeTab, setActiveTab] = useState<FinanceTabId>("donations");

  const [donations, setDonations] = useState<DonationRow[]>([]);
  const [donationsMeta, setDonationsMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [donationsLoading, setDonationsLoading] = useState(false);

  const [payouts, setPayouts] = useState<PayoutRow[]>([]);
  const [payoutsMeta, setPayoutsMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [payoutsLoading, setPayoutsLoading] = useState(false);

  const [fraudFlags, setFraudFlags] = useState<FraudFlag[]>([]);
  const [fraudLoading, setFraudLoading] = useState(false);

  function loadDonations(page = 1) {
    setDonationsLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    api.get("/finance/donations", { params: { page, limit: 20 } }).then((r: { data: any }) => {
      const body = r.data?.data ?? r.data;
      setDonations(body?.rows ?? body?.donations ?? []);
      setDonationsMeta(body?.meta ?? { total: 0, page: 1, totalPages: 1 });
    }).finally(() => setDonationsLoading(false));
  }

  function loadPayouts(page = 1) {
    setPayoutsLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    api.get("/finance/payouts", { params: { page, limit: 20 } }).then((r: { data: any }) => {
      const body = r.data?.data ?? r.data;
      setPayouts(body?.rows ?? body?.payouts ?? []);
      setPayoutsMeta(body?.meta ?? { total: 0, page: 1, totalPages: 1 });
    }).finally(() => setPayoutsLoading(false));
  }

  function loadFraudFlags() {
    setFraudLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    api.get("/finance/fraud-flags", { params: { limit: 20 } }).then((r: { data: any }) => {
      const body = r.data?.data ?? r.data;
      setFraudFlags(body?.rows ?? body?.flags ?? []);
    }).finally(() => setFraudLoading(false));
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadDonations(); }, []);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadPayouts(); }, []);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadFraudFlags(); }, []);

  async function handleApprove(id: string) {
    await api.patch(`/finance/payouts/${id}/approve`);
    loadPayouts();
  }

  async function handleReject(id: string) {
    await api.patch(`/finance/payouts/${id}/reject`);
    loadPayouts();
  }

  async function handleInvestigate(id: string) {
    await api.patch(`/finance/fraud-flags/${id}/investigate`);
    loadFraudFlags();
  }

  async function handleBlock(id: string) {
    await api.patch(`/finance/fraud-flags/${id}/block`);
    loadFraudFlags();
  }

  return (
    <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
      <div className="flex w-fit gap-1 rounded-xl bg-[var(--tott-elevated)] p-1">
        {FINANCE_TAB_IDS.map((tabId) => {
          const label =
            tabId === "payouts"
              ? t("tabs.payouts", { count: payouts.length })
              : tabId === "suspicious"
                ? t("tabs.suspicious", { count: fraudFlags.length })
                : t(`tabs.${tabId}`);
          return (
            <button
              key={tabId}
              type="button"
              onClick={() => setActiveTab(tabId)}
              className={`rounded-md px-5 py-2.5 text-sm font-medium transition-all ${
                activeTab === tabId
                  ? "bg-[var(--tott-dash-control-bg)] text-foreground"
                  : "bg-transparent text-[var(--tott-tab-inactive)] hover:text-[var(--tott-tab-inactive-hover)]"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* ── PAYOUTS ── */}
      {activeTab === "payouts" ? (
        <div className="rounded-2xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-6 lg:p-8">
          <h2 className="text-2xl font-semibold text-foreground">{tp("title")}</h2>
          <p className="mt-1 text-sm text-[var(--tott-muted)]">{tp("subtitle")}</p>

          {payoutsLoading ? (
            <p className="mt-8 text-center text-sm text-[var(--tott-muted)]">{t("common.loading")}</p>
          ) : payouts.length === 0 ? (
            <p className="mt-8 text-center text-sm text-[var(--tott-muted)]">{tp("empty")}</p>
          ) : (
            <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--tott-card-border)]">
              <div className="grid grid-cols-[1.3fr_0.8fr_1fr_0.9fr_1fr] items-center bg-[var(--tott-dash-surface)] px-6 py-4 text-sm border-b border-[var(--tott-card-border)]">
                <div className="text-sm text-[var(--tott-dash-gold-text)]">{tp("colCreator")}</div>
                <div className="text-sm text-[var(--tott-dash-gold-text)]">{tp("colAmount")}</div>
                <div className="text-sm text-[var(--tott-dash-gold-text)]">{tp("colRequested")}</div>
                <div className="text-sm text-[var(--tott-dash-gold-text)]">{tp("colStatus")}</div>
                <div className="text-end text-sm text-[var(--tott-dash-gold-text)]">{tp("colActions")}</div>
              </div>

              <div className="divide-y divide-[var(--tott-card-border)]">
                {payouts.map((row) => (
                  <div
                    key={row.id}
                    className="grid grid-cols-[1.3fr_0.8fr_1fr_0.9fr_1fr] items-center px-6 py-4"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{row.creator_name ?? "—"}</p>
                      <p className="text-xs text-[var(--tott-muted)]">{row.creator_email ?? ""}</p>
                    </div>
                    <div className="text-sm text-[var(--tott-muted)]">{fmt(row.amount, row.currency)}</div>
                    <div className="text-sm text-[var(--tott-muted)]">{fmtDate(row.created_at)}</div>
                    <div
                      className={`text-sm font-medium capitalize ${
                        row.status === "pending" ? "text-[var(--tott-status-amber)]" : row.status === "approved" ? "text-emerald-400" : "text-blue-400"
                      }`}
                    >
                      {row.status}
                    </div>
                    {row.status === "pending" || row.status === "approved" ? (
                      <div className="flex justify-end gap-3">
                        {row.status === "pending" && (
                          <button
                            type="button"
                            onClick={() => handleApprove(row.id)}
                            className="inline-flex h-[36px] items-center gap-2 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] px-4 text-sm font-medium text-emerald-400 transition-colors hover:bg-[var(--tott-dash-control-bg)]"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            {tp("approve")}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleReject(row.id)}
                          className="inline-flex h-[36px] items-center gap-2 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] px-4 text-sm font-medium text-red-400 transition-colors hover:bg-[var(--tott-dash-control-bg)]"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                          {tp("reject")}
                        </button>
                      </div>
                    ) : (
                      <div />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {payoutsMeta.totalPages > 1 && (
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => loadPayouts(payoutsMeta.page - 1)}
                disabled={payoutsMeta.page <= 1}
                className="text-xs px-3 py-1.5 rounded-lg disabled:opacity-30 border border-[var(--tott-card-border)] text-[var(--tott-muted)]"
              >
                {t("common.prev")}
              </button>
              <span className="text-xs text-[var(--tott-muted)]">{t("common.pageInfo", { page: payoutsMeta.page, totalPages: payoutsMeta.totalPages })}</span>
              <button
                onClick={() => loadPayouts(payoutsMeta.page + 1)}
                disabled={payoutsMeta.page >= payoutsMeta.totalPages}
                className="text-xs px-3 py-1.5 rounded-lg disabled:opacity-30 border border-[var(--tott-card-border)] text-[var(--tott-muted)]"
              >
                {t("common.next")}
              </button>
            </div>
          )}
        </div>

      /* ── SUSPICIOUS ── */
      ) : activeTab === "suspicious" ? (
        <div className="rounded-2xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-6 lg:p-8">
          <h2 className="text-2xl font-semibold text-foreground">{ts("title")}</h2>
          <p className="mt-1 text-sm text-[var(--tott-muted)]">{ts("subtitle")}</p>

          {fraudLoading ? (
            <p className="mt-8 text-center text-sm text-[var(--tott-muted)]">{t("common.loading")}</p>
          ) : fraudFlags.length === 0 ? (
            <p className="mt-8 text-center text-sm text-[var(--tott-muted)]">{ts("empty")}</p>
          ) : (
            <div className="mt-6 space-y-4">
              {fraudFlags.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-6 rounded-2xl border border-red-500/60 bg-[var(--tott-dash-surface)] px-6 py-5"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] text-[var(--tott-muted)]">
                      <AlertTriangleIcon />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-foreground capitalize">{item.flag_type.replace(/_/g, " ")}</p>
                      <p className="mt-1 text-sm text-[var(--tott-muted)]">
                        {item.user_email ?? ts("unknown")}{item.amount ? ` • ${fmt(item.amount)}` : ""} • {fmtDate(item.created_at)}
                        {item.severity && <span className="ml-2 capitalize text-xs text-red-400">{item.severity}</span>}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    {item.status !== "investigating" && (
                      <button
                        type="button"
                        onClick={() => handleInvestigate(item.id)}
                        className="h-[36px] rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] px-4 text-sm font-medium text-foreground transition-colors hover:bg-[var(--tott-dash-control-bg)]"
                      >
                        {ts("investigate")}
                      </button>
                    )}
                    {item.status !== "blocked" && (
                      <button
                        type="button"
                        onClick={() => handleBlock(item.id)}
                        className="h-[36px] rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] px-4 text-sm font-medium text-red-400 transition-colors hover:bg-[var(--tott-dash-control-bg)]"
                      >
                        {ts("block")}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      /* ── INVOICES ── */
      ) : activeTab === "invoices" ? (
        <div className="rounded-2xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-10 text-center text-[var(--tott-muted)]">
          {t("invoices.comingSoon")}
        </div>

      /* ── DONATIONS ── */
      ) : (
        <div className="rounded-2xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-6 lg:p-8">
          <h2 className="text-2xl font-semibold text-foreground">{td("title")}</h2>
          <p className="mt-1 text-sm text-[var(--tott-muted)]">{td("subtitle")}</p>

          {donationsLoading ? (
            <p className="mt-8 text-center text-sm text-[var(--tott-muted)]">{t("common.loading")}</p>
          ) : donations.length === 0 ? (
            <p className="mt-8 text-center text-sm text-[var(--tott-muted)]">{td("empty")}</p>
          ) : (
            <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--tott-card-border)]">
              <div className="grid grid-cols-[1.4fr_1fr_0.8fr_0.9fr_0.9fr_56px] items-center bg-[var(--tott-dash-surface)] px-6 py-4 text-sm border-b border-[var(--tott-card-border)]">
                <div className="text-sm text-[var(--tott-dash-gold-text)]">{td("colDonor")}</div>
                <div className="text-sm text-[var(--tott-dash-gold-text)]">{td("colRecipient")}</div>
                <div className="text-sm text-[var(--tott-dash-gold-text)]">{td("colAmount")}</div>
                <div className="text-sm text-[var(--tott-dash-gold-text)]">{td("colDate")}</div>
                <div className="text-sm text-[var(--tott-dash-gold-text)]">{td("colStatus")}</div>
                <div />
              </div>

              <div className="divide-y divide-[var(--tott-card-border)]">
                {donations.map((row) => (
                  <div
                    key={row.id}
                    className="grid grid-cols-[1.4fr_1fr_0.8fr_0.9fr_0.9fr_56px] items-center px-6 py-4"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{row.donor_name ?? "—"}</p>
                      <p className="text-xs text-[var(--tott-muted)]">{row.donor_email ?? ""}</p>
                    </div>
                    <div className="text-sm text-foreground">{row.recipient_name ?? "—"}</div>
                    <div className="text-sm text-[var(--tott-muted)]">{fmt(row.amount, row.currency)}</div>
                    <div className="text-sm text-[var(--tott-muted)]">{fmtDate(row.created_at)}</div>
                    <div
                      className={`text-sm font-medium capitalize ${
                        row.status === "completed" ? "text-emerald-400" : "text-[var(--tott-status-amber)]"
                      }`}
                    >
                      {row.status === "completed" ? td("status.completed") : td("status.pending")}
                    </div>
                    <RowActions />
                  </div>
                ))}
              </div>
            </div>
          )}

          {donationsMeta.totalPages > 1 && (
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => loadDonations(donationsMeta.page - 1)}
                disabled={donationsMeta.page <= 1}
                className="text-xs px-3 py-1.5 rounded-lg disabled:opacity-30 border border-[var(--tott-card-border)] text-[var(--tott-muted)]"
              >
                {t("common.prev")}
              </button>
              <span className="text-xs text-[var(--tott-muted)]">{t("common.pageInfo", { page: donationsMeta.page, totalPages: donationsMeta.totalPages })}</span>
              <button
                onClick={() => loadDonations(donationsMeta.page + 1)}
                disabled={donationsMeta.page >= donationsMeta.totalPages}
                className="text-xs px-3 py-1.5 rounded-lg disabled:opacity-30 border border-[var(--tott-card-border)] text-[var(--tott-muted)]"
              >
                {t("common.next")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

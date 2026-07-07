"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChamferedPanel } from "@/components/ui/ChamferedPanel";
import { ChamferedCap } from "@/components/ui/ChamferedCap";
import { usePrintOrders } from "@/hooks/queries/print-orders";
import { useShipPrintOrder } from "@/hooks/mutations/print-orders";
import type { PrintOrder, PrintOrderStatus } from "@/services/print-orders.service";

const STATUSES: PrintOrderStatus[] = ["pending", "shipped", "cancelled"];

function formatAddress(o: PrintOrder): string {
  return [o.address_line1, o.address_line2, o.address_city, o.address_state, o.address_postal_code, o.address_country]
    .filter(Boolean)
    .join(", ");
}

export function PrintOrdersPanel() {
  const t = useTranslations("Dashboard.books.printOrders");
  const [status, setStatus] = useState<PrintOrderStatus | undefined>(undefined);
  const query = usePrintOrders({ status, limit: 50 });
  const ship = useShipPrintOrder();
  const [trackingDraft, setTrackingDraft] = useState<Record<string, string>>({});

  const orders = query.data?.rows ?? [];

  return (
    <div>
      <div className="mb-3 flex gap-1 rounded-xl bg-[var(--tott-elevated)] p-1">
        {([undefined, ...STATUSES] as const).map((s) => (
          <button
            key={s ?? "all"}
            type="button"
            onClick={() => setStatus(s)}
            className={`rounded-md px-3 py-2 text-xs font-medium transition-all ${
              status === s
                ? "bg-[var(--tott-dash-control-bg)] text-foreground"
                : "bg-transparent text-[var(--tott-tab-inactive)] hover:text-[var(--tott-tab-inactive-hover)]"
            }`}
          >
            {s ? t(`statuses.${s}`) : t("statuses.all")}
          </button>
        ))}
      </div>

      <ChamferedPanel>
        <ChamferedCap direction="top" />
        <div className="grid grid-cols-[24%_20%_22%_12%_22%] px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--tott-dash-gold-label)]">
          <span>{t("headers.book")}</span>
          <span>{t("headers.buyer")}</span>
          <span>{t("headers.address")}</span>
          <span>{t("headers.status")}</span>
          <span className="text-right">{t("headers.actions")}</span>
        </div>

        {query.isPending && (
          <div className="px-4 py-8 text-center text-sm text-[var(--tott-muted)]">{t("loading")}</div>
        )}
        {!query.isPending && orders.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-[var(--tott-muted)]">{t("empty")}</div>
        )}
        {!query.isPending &&
          orders.map((o) => (
            <div
              key={o.id}
              className="grid grid-cols-[24%_20%_22%_12%_22%] items-center border-t border-[var(--tott-card-border)] px-4 py-3 text-sm"
            >
              <span className="truncate font-medium">{o.book?.title ?? "—"}</span>
              <span className="truncate text-[var(--tott-muted)]">
                {o.user?.full_name || o.user?.email || "—"}
              </span>
              <span className="truncate text-xs text-[var(--tott-muted)]" title={formatAddress(o)}>
                {formatAddress(o) || "—"}
              </span>
              <span className="text-xs text-[var(--tott-muted)]">{t(`statuses.${o.status}`)}</span>
              <div className="flex items-center justify-end gap-1.5">
                {o.status === "pending" ? (
                  <>
                    <input
                      type="text"
                      value={trackingDraft[o.id] ?? ""}
                      onChange={(e) =>
                        setTrackingDraft((prev) => ({ ...prev, [o.id]: e.target.value }))
                      }
                      placeholder={t("trackingPlaceholder")}
                      className="w-28 rounded-md border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-2 py-1 text-xs text-foreground outline-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        ship.mutate({ id: o.id, trackingNumber: trackingDraft[o.id] })
                      }
                      disabled={ship.isPending}
                      className="rounded-md border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-2 py-1 text-xs font-medium text-foreground hover:bg-[var(--tott-dash-control-hover)] disabled:opacity-40"
                    >
                      {t("markShipped")}
                    </button>
                  </>
                ) : o.status === "shipped" && o.tracking_number ? (
                  <span className="truncate text-xs text-[var(--tott-muted)]">{o.tracking_number}</span>
                ) : null}
              </div>
            </div>
          ))}
        <ChamferedCap direction="bottom" />
      </ChamferedPanel>
    </div>
  );
}

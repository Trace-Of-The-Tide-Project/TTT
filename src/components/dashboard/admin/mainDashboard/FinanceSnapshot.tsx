"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { ComponentType } from "react";

type FinanceCard = {
  id: string;
  icon: ComponentType;
  amount: string;
  trend?: { value: string; direction: "up" | "down" };
};

type FinanceSnapshotProps = {
  cards: FinanceCard[];
  detailsHref?: string;
};

export function FinanceSnapshot({ cards, detailsHref }: FinanceSnapshotProps) {
  const t = useTranslations("Dashboard.adminHome.finance");
  return (
    <div className="rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">{t("title")}</h3>
        {detailsHref && (
          <Link
            href={detailsHref}
            className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-4 py-2 text-xs font-medium text-[var(--tott-dash-control-fg)] transition-colors hover:border-[var(--tott-dash-control-hover)]"
          >
            {t("viewDetails")}
          </Link>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className="rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] px-5 py-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[var(--tott-dash-gold-text)]">
                  <Icon />
                </span>
                {card.trend && (
                  <span
                    className="flex items-center gap-1 text-xs font-medium"
                    style={{ color: card.trend.direction === "up" ? "var(--tott-dash-positive)" : "var(--tott-dash-negative)" }}
                  >
                    {card.trend.direction === "up" ? "↗" : "↘"} {card.trend.value}
                  </span>
                )}
              </div>
              <p className="text-xl font-bold text-foreground">{card.amount}</p>
              <p className="mt-1 text-xs text-[var(--tott-muted)]">{t(`cards.${card.id}.label`)}</p>
              <p className="text-xs text-[var(--tott-muted)] opacity-60">{t(`cards.${card.id}.sublabel`)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

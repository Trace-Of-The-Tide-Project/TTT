"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { ComponentType } from "react";

type RoleBar = {
  id: string;
  icon: ComponentType;
  label: string;
  count: string;
  percentage: number;
  change?: string;
};

type UsersByRoleProps = {
  roles: RoleBar[];
  totalValue?: string;
  viewAllHref?: string;
};

export function UsersByRole({ roles, totalValue, viewAllHref }: UsersByRoleProps) {
  const t = useTranslations("Dashboard.adminHome.usersByRole");
  return (
    <div className="rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-7">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">{t("title")}</h3>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-4 py-2 text-xs font-medium text-[var(--tott-dash-control-fg)] transition-colors hover:border-[var(--tott-dash-control-hover)]"
          >
            {t("viewAll")}
          </Link>
        )}
      </div>

      <div className="divide-y divide-[var(--tott-dash-divider)]">
        {roles.map((role) => {
          const Icon = role.icon;
          return (
            <div key={role.id} className="py-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[var(--tott-muted)] opacity-70">
                    <Icon />
                  </span>
                  <span className="text-sm font-medium text-foreground capitalize">{role.label}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[var(--tott-muted)]">{role.count}</span>
                  {role.change && (
                    <span className="text-[var(--tott-dash-positive)]">{role.change}</span>
                  )}
                </div>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--tott-dash-progress-track)]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${role.percentage}%`,
                    background: "linear-gradient(to right, rgba(203,161,88,0.35), var(--tott-dash-gold-label))",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {totalValue && (
        <div className="mt-5 flex items-center justify-between border-t border-[var(--tott-card-border)] pt-4 text-sm text-[var(--tott-muted)]">
          <span>{t("totalLabel")}</span>
          <span className="font-medium text-foreground">{totalValue}</span>
        </div>
      )}
    </div>
  );
}

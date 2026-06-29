"use client";

import { useTranslations, useMessages } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { ComponentType } from "react";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";

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

function translateLabel(messages: unknown, label: string): string {
  try {
    const rolesMap = ((messages as Record<string, unknown>)?.Dashboard as Record<string, unknown>)
      ?.adminHome as Record<string, unknown>;
    const roles = rolesMap?.usersByRole as Record<string, unknown>;
    const roleLabels = roles?.roles as Record<string, string> | undefined;
    const key = label.toLowerCase();
    return roleLabels?.[key] ?? label;
  } catch {
    return label;
  }
}

export function UsersByRole({ roles, totalValue, viewAllHref }: UsersByRoleProps) {
  const t = useTranslations("Dashboard.adminHome.usersByRole");
  const messages = useMessages();
  return (
    <div className="relative p-7">
      <ChamferedFrame />
      <div className="relative mb-5 flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">{t("title")}</h3>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="rounded-lg bg-[var(--tott-elevated)] px-4 py-2 text-xs font-medium text-[var(--tott-dash-control-fg)] transition-colors hover:bg-[var(--tott-elevated-hover)]"
          >
            {t("viewAll")}
          </Link>
        )}
      </div>

      <div className="relative divide-y divide-[var(--tott-dash-divider)]">
        {roles.map((role) => {
          const Icon = role.icon;
          return (
            <div key={role.id} className="py-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[var(--tott-muted)] opacity-70">
                    <Icon />
                  </span>
                  <span className="text-sm font-medium text-foreground capitalize">{translateLabel(messages, role.label)}</span>
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
                    background: "linear-gradient(to right, color-mix(in srgb, var(--tott-accent-gold) 35%, transparent), var(--tott-dash-gold-label))",
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

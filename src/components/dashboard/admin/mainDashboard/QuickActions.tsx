"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { ComponentType } from "react";
import type { QuickActionId } from "@/lib/dashboard/admin-dashboard-constants";

export type QuickActionItem = {
  id: string;
  actionId: QuickActionId;
  icon: ComponentType;
  href?: string;
  onClick?: () => void;
};

type QuickActionsProps = {
  items: QuickActionItem[];
};

const ACTION_TONES: Record<QuickActionId, { bg: string; iconBg: string }> = {
  sendBroadcast: { bg: "var(--tott-dash-surface-inset)", iconBg: "var(--tott-dash-icon-bg)" },
  approveEditor: { bg: "var(--tott-dash-surface-inset)", iconBg: "var(--tott-dash-icon-bg)" },
  featureContent: { bg: "var(--tott-dash-surface-inset)", iconBg: "var(--tott-dash-icon-bg)" },
  maintenanceMode: { bg: "var(--tott-dash-surface-inset)", iconBg: "var(--tott-dash-icon-bg)" },
};

export function QuickActions({ items }: QuickActionsProps) {
  const t = useTranslations("Dashboard.adminHome.quickActions");
  return (
    <div className="rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-5">
      <h3 className="mb-4 text-lg font-bold text-foreground">{t("title")}</h3>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((item) => {
          const Icon = item.icon;
          const label = t(`${item.actionId}.label`);
          const description = t(`${item.actionId}.description`);
          const tone = ACTION_TONES[item.actionId];
          const className =
            "group flex items-center gap-4 rounded-xl border border-[var(--tott-card-border)] px-4 py-4 text-start transition-colors hover:bg-[var(--tott-dash-ghost-hover)]";
          const style = { backgroundColor: tone.bg };
          const iconStyle = { backgroundColor: tone.iconBg };

          const inner = (
            <>
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[var(--tott-card-border)] text-[var(--tott-muted)]"
                style={iconStyle}
              >
                <Icon />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-tight text-foreground">{label}</p>
                <p className="mt-0.5 text-xs leading-snug text-[var(--tott-muted)]">{description}</p>
              </div>
            </>
          );

          if (item.onClick) {
            return (
              <button key={item.id} type="button" onClick={item.onClick} className={`w-full ${className}`} style={style}>
                {inner}
              </button>
            );
          }
          return (
            <Link key={item.id} href={item.href ?? "#"} className={className} style={style}>
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

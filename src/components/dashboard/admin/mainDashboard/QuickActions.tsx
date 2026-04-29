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
  sendBroadcast: { bg: "#1e3a5f", iconBg: "rgba(255,255,255,0.18)" },
  approveEditor: { bg: "#3b6ea3", iconBg: "rgba(255,255,255,0.18)" },
  featureContent: { bg: "#3a7d6f", iconBg: "rgba(255,255,255,0.18)" },
  maintenanceMode: { bg: "#2c5d52", iconBg: "rgba(255,255,255,0.20)" },
};

export function QuickActions({ items }: QuickActionsProps) {
  const t = useTranslations("Dashboard.adminHome.quickActions");
  return (
    <div className="rounded-2xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-5 shadow-[0_1px_2px_rgba(22,36,58,0.04),0_4px_16px_rgba(22,36,58,0.04)]">
      <h3 className="mb-4 text-lg font-bold text-foreground">{t("title")}</h3>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((item) => {
          const Icon = item.icon;
          const label = t(`${item.actionId}.label`);
          const description = t(`${item.actionId}.description`);
          const tone = ACTION_TONES[item.actionId];
          const className =
            "group flex items-center gap-3 rounded-xl px-4 py-4 text-start text-white transition-all hover:brightness-105 hover:shadow-lg active:translate-y-px";
          const style = { backgroundColor: tone.bg };
          const iconStyle = { backgroundColor: tone.iconBg };

          const inner = (
            <>
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white"
                style={iconStyle}
              >
                <Icon />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-tight">{label}</p>
                <p className="mt-0.5 text-xs leading-snug text-white/80">{description}</p>
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

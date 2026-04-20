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

function HexIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 48 48" fill="none">
        <path
          d="M24 2L44 14V34L24 46L4 34V14Z"
          fill="var(--tott-dash-icon-bg)"
          stroke="var(--tott-card-border)"
          strokeWidth="1"
        />
      </svg>
      <span className="relative text-gray-400">{children}</span>
    </div>
  );
}

export function QuickActions({ items }: QuickActionsProps) {
  const t = useTranslations("Dashboard.adminHome.quickActions");
  return (
    <div className="rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-5">
      <h3 className="mb-4 text-lg font-bold text-foreground">{t("title")}</h3>

      <div className="flex flex-col gap-5">
        {items.map((item) => {
          const Icon = item.icon;
          const label = t(`${item.actionId}.label`);
          const description = t(`${item.actionId}.description`);
          const className =
            "flex items-center gap-4 rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-4 py-5 mx-4 transition-colors hover:bg-white/2";
          if (item.onClick) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                className={`w-full text-start ${className}`}
              >
                <HexIcon>
                  <Icon />
                </HexIcon>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{description}</p>
                </div>
              </button>
            );
          }
          return (
            <Link key={item.id} href={item.href ?? "#"} className={className}>
              <HexIcon>
                <Icon />
              </HexIcon>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="mt-0.5 text-xs text-gray-500">{description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

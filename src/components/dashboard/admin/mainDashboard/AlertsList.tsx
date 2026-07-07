"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { ComponentType } from "react";
import { DetailModal } from "@/components/dashboard/modals/DetailModal";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";

type ModalItem = {
  id: string;
  title: string;
  subtitle: string;
  actionLabel?: string;
  actionColor?: string;
  actionHref?: string;
  processButtons?: boolean;
};

export type AlertItem = {
  id: string;
  icon: ComponentType;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  modal?: {
    badge?: { label: string; color: string };
    items: ModalItem[];
    viewAllHref?: string;
  };
};

type AlertsListProps = {
  items: AlertItem[];
  onDismissAll?: () => void;
};

function HexIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 48 48"
        fill="none"
      >
        <path
          d="M24 2L44 14V34L24 46L4 34V14Z"
          fill="var(--tott-dash-surface)"
          stroke="var(--tott-card-border)"
          strokeWidth="1"
        />
      </svg>
      <span className="relative text-[var(--tott-muted)]">{children}</span>
    </div>
  );
}

export function AlertsList({ items, onDismissAll }: AlertsListProps) {
  const t = useTranslations("Dashboard.adminHome.notifications");
  const [activeAlert, setActiveAlert] = useState<AlertItem | null>(null);

  return (
    <>
      <div>
        <div className="mb-4 flex items-center justify-end">
          {onDismissAll && (
            <button
              type="button"
              onClick={onDismissAll}
              className="rounded-lg bg-[var(--tott-elevated)] px-4 py-2 text-xs font-medium text-[var(--tott-dash-control-fg)] transition-colors hover:bg-[var(--tott-elevated-hover)] hover:text-foreground"
            >
              {t("dismissAll")}
            </button>
          )}
        </div>

        <div className="flex flex-col gap-5">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="relative flex items-center gap-4 px-6 py-4"
              >
                <ChamferedFrame />
                <HexIcon>
                  <Icon />
                </HexIcon>
                <div className="relative min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="mt-0.5 text-xs text-[var(--tott-muted)]">{item.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveAlert(item)}
                  className="relative shrink-0 text-xs font-medium text-[var(--tott-muted)] transition-colors hover:text-foreground"
                >
                  {item.actionLabel} &rsaquo;
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {activeAlert && (
        <DetailModal
          open
          onClose={() => setActiveAlert(null)}
          title={activeAlert.title}
          description={activeAlert.description}
          badge={activeAlert.modal?.badge}
          items={activeAlert.modal?.items ?? []}
          viewAllHref={activeAlert.modal?.viewAllHref ?? activeAlert.actionHref}
          viewAllLabel={t("viewAllAlerts")}
        />
      )}
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getDashboardAlerts } from "@/services/dashboard.service";
import { AlertTriangleIcon, PersonIcon, ShieldIcon } from "@/components/ui/icons";
import type { ComponentType } from "react";

const ALERT_CONFIG: Record<string, { icon: ComponentType; href: string; label: string }> = {
  flagged:            { icon: AlertTriangleIcon, href: "/admin/reports",  label: "Review now" },
  editor_application: { icon: PersonIcon,         href: "/admin/users",    label: "Process" },
  pending_review:     { icon: ShieldIcon,          href: "/admin/content",  label: "Review" },
};

type AlertDisplay = {
  type: string;
  title: string;
  description: string;
  icon: ComponentType;
  href: string;
  label: string;
};

function HexIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 40 40" fill="none">
        <path
          d="M20 2L37 11.5V28.5L20 38L3 28.5V11.5Z"
          fill="var(--tott-dash-icon-bg)"
          stroke="var(--tott-card-border)"
          strokeWidth="1"
        />
      </svg>
      <span className="relative text-[var(--tott-muted)]">{children}</span>
    </div>
  );
}

function AlertCard({ item, onDismiss }: { item: AlertDisplay; onDismiss: (type: string) => void }) {
  const Icon = item.icon;
  return (
    <div className="flex items-center gap-4 rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] px-4 py-4 sm:px-5">
      <HexIcon>
        <Icon />
      </HexIcon>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{item.title}</p>
        <p className="mt-0.5 text-xs text-[var(--tott-muted)]">{item.description}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <Link
          href={item.href}
          className="whitespace-nowrap text-xs font-medium text-[var(--tott-dash-gold-label)] transition-colors hover:text-[var(--tott-dash-gold-text)]"
        >
          {item.label} →
        </Link>
        <button
          type="button"
          onClick={() => onDismiss(item.type)}
          className="text-xs text-[var(--tott-muted)] opacity-50 transition-opacity hover:opacity-100"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export function DashboardNotifications() {
  const t = useTranslations("Dashboard.adminHome.notifications");
  const [items, setItems] = useState<AlertDisplay[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    getDashboardAlerts()
      .then((data) => {
        const mapped: AlertDisplay[] = (data.items ?? []).map((item) => {
          const cfg = ALERT_CONFIG[item.type] ?? {
            icon: AlertTriangleIcon,
            href: "/admin",
            label: "View",
          };
          return {
            type: item.type,
            title: item.message,
            description: item.description,
            icon: cfg.icon,
            href: cfg.href,
            label: cfg.label,
          };
        });
        setItems(mapped);
      })
      .catch(() => setItems([]));
  }, []);

  const visible = items.filter((a) => !dismissed.has(a.type));
  const dismiss = (type: string) => setDismissed((prev) => new Set([...prev, type]));
  const dismissAll = () => setDismissed(new Set(items.map((a) => a.type)));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">{t("title")}</h3>
        <div className="flex items-center gap-4">
          {visible.length > 0 && (
            <button
              type="button"
              onClick={dismissAll}
              className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-3 py-1.5 text-xs font-medium text-[var(--tott-dash-control-fg)] transition-colors hover:border-[var(--tott-dash-control-hover)]"
            >
              Dismiss all
            </button>
          )}
          <Link
            href="/admin/notifications"
            className="text-xs font-medium text-[var(--tott-dash-gold-label)] transition-colors hover:text-[var(--tott-dash-gold-text)]"
          >
            {t("viewAll")} →
          </Link>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] px-5 py-8 text-center text-sm text-[var(--tott-muted)]">
          No new alerts
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((item) => (
            <AlertCard key={item.type} item={item} onDismiss={dismiss} />
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useDashboardAlerts, useDismissDashboardAlert } from "@/hooks/queries/dashboard";
import type { AlertsResponse, DismissableAlertType } from "@/services/dashboard.service";
import { AlertTriangleIcon, PersonIcon, ShieldIcon } from "@/components/ui/icons";
import type { ComponentType } from "react";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";

type AlertTone = "coral" | "amber" | "sea";

type AlertCfg = {
  icon: ComponentType;
  href: string;
  labelKey: string;
  titleKey: string;
  descKey: string;
  tone: AlertTone;
};

const ALERT_CONFIG: Record<string, AlertCfg> = {
  flagged:            { icon: AlertTriangleIcon, href: "/admin/reports",  labelKey: "reviewNow", titleKey: "flaggedTitle", descKey: "flaggedDesc",  tone: "coral" },
  editor_application: { icon: PersonIcon,         href: "/admin/users",    labelKey: "process",   titleKey: "editorTitle",  descKey: "editorDesc",   tone: "amber" },
  pending_review:     { icon: ShieldIcon,          href: "/admin/content",  labelKey: "review",    titleKey: "pendingTitle", descKey: "pendingDesc",  tone: "amber" },
};

// Use the numeric fields the API already returns instead of scraping the count
// out of the (English) message string — the widget renders in Arabic/RTL.
const COUNT_BY_TYPE: Record<string, keyof AlertsResponse> = {
  flagged: "flaggedContent",
  pending_review: "pendingReviews",
  editor_application: "pendingEditorApps",
};

const TONE_STYLES: Record<AlertTone, { bg: string; border: string; iconBg: string; iconFg: string; button: string }> = {
  coral: {
    bg: "var(--tott-dash-surface-inset)",
    border: "var(--tott-card-border)",
    iconBg: "var(--tott-dash-icon-bg)",
    iconFg: "var(--tott-muted)",
    button: "var(--tott-dash-control-bg)",
  },
  amber: {
    bg: "var(--tott-dash-surface-inset)",
    border: "var(--tott-card-border)",
    iconBg: "var(--tott-dash-icon-bg)",
    iconFg: "var(--tott-muted)",
    button: "var(--tott-dash-control-bg)",
  },
  sea: {
    bg: "var(--tott-dash-surface-inset)",
    border: "var(--tott-card-border)",
    iconBg: "var(--tott-dash-icon-bg)",
    iconFg: "var(--tott-muted)",
    button: "var(--tott-dash-control-bg)",
  },
};

type AlertDisplay = {
  type: string;
  count: number;
  titleKey: string;
  descKey: string;
  icon: ComponentType;
  href: string;
  labelKey: string;
  tone: AlertTone;
};

function AlertCard({
  item,
  onDismiss,
  disabled,
}: {
  item: AlertDisplay;
  onDismiss: (type: string) => void;
  disabled?: boolean;
}) {
  const t = useTranslations("Dashboard.adminHome.notifications");
  const Icon = item.icon;
  const styles = TONE_STYLES[item.tone];
  const title = item.titleKey ? t(item.titleKey, { count: item.count }) : item.type;
  const desc = item.descKey ? t(item.descKey) : "";
  const label = item.labelKey ? t(item.labelKey) : "→";
  return (
    <div className="relative flex items-center gap-4 px-5 py-4 sm:px-6">
      <ChamferedFrame />
      <span
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: styles.iconBg, color: styles.iconFg }}
      >
        <Icon />
      </span>
      <div className="relative min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 text-xs text-[var(--tott-muted)]">{desc}</p>
      </div>
      <div className="relative flex shrink-0 items-center gap-3">
        <Link
          href={item.href}
          className="whitespace-nowrap text-xs font-medium text-[var(--tott-dash-gold-label)] transition-colors hover:text-[var(--tott-dash-gold-text)]"
        >
          {label} →
        </Link>
        <button
          type="button"
          onClick={() => onDismiss(item.type)}
          disabled={disabled}
          className="text-xs text-[var(--tott-muted)] opacity-50 transition-opacity hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-30"
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
  const { data } = useDashboardAlerts();
  const { mutate: dismissAlert, isPending } = useDismissDashboardAlert();

  const items: AlertDisplay[] = useMemo(() => {
    return (data?.items ?? []).map((item) => {
      const cfg = ALERT_CONFIG[item.type] ?? {
        icon: AlertTriangleIcon,
        href: "/admin",
        labelKey: "review",
        titleKey: "pendingTitle",
        descKey: "pendingDesc",
        tone: "sea" as AlertTone,
      };
      const numericField = COUNT_BY_TYPE[item.type];
      const count = numericField
        ? Number(data?.[numericField] ?? 0)
        : // Fallback for unknown future types: scrape the message.
          parseInt(item.message.match(/\d+/)?.[0] ?? "1", 10);
      return {
        type: item.type,
        count,
        titleKey: cfg.titleKey,
        descKey: cfg.descKey,
        icon: cfg.icon,
        href: cfg.href,
        labelKey: cfg.labelKey,
        tone: cfg.tone,
      };
    });
  }, [data]);

  // Server already excludes alerts this admin has dismissed, so render `items`
  // directly. Dismissing persists via the mutation and the alerts query
  // refetches — the card stays gone across refreshes (until its count rises).
  const visible = items;
  const dismiss = (type: string) => dismissAlert(type as DismissableAlertType);
  const dismissAll = () =>
    items.forEach((a) => dismissAlert(a.type as DismissableAlertType));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">{t("title")}</h3>
        <div className="flex items-center gap-3">
          {visible.length > 0 && (
            <button
              type="button"
              onClick={dismissAll}
              disabled={isPending}
              className="rounded-lg bg-[var(--tott-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--tott-dash-control-fg)] transition-colors hover:bg-[var(--tott-elevated-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("dismissAll")}
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
        <div className="relative px-5 py-8 text-center text-sm text-[var(--tott-muted)]">
          <ChamferedFrame />
          {t("noAlerts")}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((item) => (
            <AlertCard key={item.type} item={item} onDismiss={dismiss} disabled={isPending} />
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useDashboardAlerts } from "@/hooks/queries/dashboard";
import { AlertTriangleIcon, PersonIcon, ShieldIcon } from "@/components/ui/icons";
import type { ComponentType } from "react";

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

const TONE_STYLES: Record<AlertTone, { wrapper: string; iconBg: string; iconFg: string; button: string }> = {
  coral: {
    wrapper: "bg-[var(--tott-coral-tint-bg)] border-[color:var(--tott-coral-soft)]",
    iconBg: "var(--tott-coral)",
    iconFg: "#ffffff",
    button: "bg-[var(--tott-coral)] hover:brightness-105",
  },
  amber: {
    wrapper: "bg-[var(--tott-amber-tint-bg)] border-[color:var(--tott-amber-soft)]",
    iconBg: "var(--tott-amber-warm)",
    iconFg: "#ffffff",
    button: "bg-[var(--tott-amber-warm)] hover:brightness-105",
  },
  sea: {
    wrapper: "bg-[var(--tott-sea-tint-bg)] border-[color:var(--tott-sea-soft)]",
    iconBg: "var(--tott-sea-mid)",
    iconFg: "#ffffff",
    button: "bg-[var(--tott-sea-mid)] hover:brightness-105",
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

function AlertCard({ item, onDismiss }: { item: AlertDisplay; onDismiss: (type: string) => void }) {
  const t = useTranslations("Dashboard.adminHome.notifications");
  const Icon = item.icon;
  const styles = TONE_STYLES[item.tone];
  const title = item.titleKey ? t(item.titleKey, { count: item.count }) : item.type;
  const desc = item.descKey ? t(item.descKey) : "";
  const label = item.labelKey ? t(item.labelKey) : "→";
  return (
    <div className={`flex items-center gap-4 rounded-xl border px-4 py-4 sm:px-5 ${styles.wrapper}`}>
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: styles.iconBg, color: styles.iconFg }}
      >
        <Icon />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 text-xs text-[var(--tott-muted)]">{desc}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Link
          href={item.href}
          className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-all ${styles.button}`}
        >
          {label} →
        </Link>
        <button
          type="button"
          onClick={() => onDismiss(item.type)}
          className="text-base text-[var(--tott-muted)] opacity-50 transition-opacity hover:opacity-100"
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
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

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
      const count = parseInt(item.message.match(/\d+/)?.[0] ?? "1", 10);
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

  const visible = items.filter((a) => !dismissed.has(a.type));
  const dismiss = (type: string) => setDismissed((prev) => new Set([...prev, type]));
  const dismissAll = () => setDismissed(new Set(items.map((a) => a.type)));

  return (
    <div className="rounded-2xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-5 shadow-[0_1px_2px_rgba(22,36,58,0.04),0_4px_16px_rgba(22,36,58,0.04)]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">{t("title")}</h3>
        <div className="flex items-center gap-3">
          {visible.length > 0 && (
            <button
              type="button"
              onClick={dismissAll}
              className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-3 py-1.5 text-xs font-medium text-[var(--tott-dash-control-fg)] transition-colors hover:border-[var(--tott-dash-control-hover)]"
            >
              {t("dismissAll")}
            </button>
          )}
          <Link
            href="/admin/notifications"
            className="text-xs font-medium text-[var(--tott-sea-deep)] transition-colors hover:underline"
          >
            {t("viewAll")} →
          </Link>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] px-5 py-8 text-center text-sm text-[var(--tott-muted)]">
          {t("noAlerts")}
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

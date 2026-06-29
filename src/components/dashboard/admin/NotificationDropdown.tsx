"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BellIcon } from "@/components/ui/icons";
import {
  useNotifications,
  useUnreadNotificationCount,
} from "@/hooks/queries/notifications";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from "@/hooks/mutations/notifications";
import type { NotificationListItem } from "@/services/notifications.service";
import { useAuthUser } from "@/components/providers/AuthProvider";
import { theme } from "@/lib/theme";


type TimeTranslate = (key: string, values?: Record<string, number>) => string;

function timeAgo(iso: string, t: TimeTranslate): string {
  const diff = Date.now() - new Date(iso).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return t("secondsAgo", { count: secs });
  const mins = Math.floor(secs / 60);
  if (mins < 60) return t("minutesAgo", { count: mins });
  const hours = Math.floor(mins / 60);
  if (hours < 24) return t("hoursAgo", { count: hours });
  const days = Math.floor(hours / 24);
  if (days < 30) return t("daysAgo", { count: days });
  return t("monthsAgo", { count: Math.floor(days / 30) });
}

/** Notification-type accents resolve to theme-aware CSS vars. */
const TYPE_COLORS: Record<string, string> = {
  system: "var(--tott-muted)",
  review: "var(--tott-accent-gold)",
  update: "var(--tott-status-blue)",
  announcement: "var(--tott-status-emerald)",
};

function NotifRow({
  n,
  onRead,
}: {
  n: NotificationListItem;
  onRead: (id: string) => void;
}) {
  const t = useTranslations("Dashboard.topbar");
  const isUnread = n.status === "unread";
  const typeColor = TYPE_COLORS[n.type] ?? TYPE_COLORS.system;
  return (
    <li>
      <button
        type="button"
        onClick={() => isUnread && onRead(n.id)}
        className="group w-full px-4 py-3 text-left transition-colors hover:bg-[var(--tott-dash-ghost-hover)] focus:outline-none"
        style={{
          borderLeft: isUnread ? `2px solid ${theme.accentGold}` : "2px solid transparent",
        }}
      >
        <div className="flex items-start gap-3">
          <span
            className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: isUnread ? "var(--tott-status-coral)" : "transparent", marginTop: "6px" }}
          />
          <div className="min-w-0 flex-1">
            <p
              className="text-sm leading-snug"
              style={{
                color: isUnread ? "var(--foreground)" : "var(--tott-muted)",
                fontWeight: isUnread ? 500 : 400,
              }}
            >
              {n.message}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span
                className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                style={{
                  backgroundColor: `color-mix(in srgb, ${typeColor} 13%, transparent)`,
                  color: typeColor,
                }}
              >
                {n.type}
              </span>
              <span className="text-xs" style={{ color: "var(--tott-muted)" }}>
                {timeAgo(n.created_at, t)}
              </span>
            </div>
          </div>
        </div>
      </button>
    </li>
  );
}

function Skeleton() {
  return (
    <div className="space-y-px px-4 py-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-3 py-2">
          <div className="mt-1.5 h-2 w-2 shrink-0 animate-pulse rounded-full bg-[var(--tott-card-border)]" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-3/4 animate-pulse rounded bg-[var(--tott-card-border)]" />
            <div className="h-2.5 w-1/3 animate-pulse rounded bg-[var(--tott-card-border)]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function NotificationDropdown() {
  const t = useTranslations("Dashboard.topbar");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const iconColor = "var(--tott-stat-icon)";
  const iconBtn = "hover:opacity-80";

  const user = useAuthUser();
  const { data: unreadCountData } = useUnreadNotificationCount(user?.id, {
    silent: true,
  });
  const { data: listData, isFetching: loading } = useNotifications(
    { limit: 8, sortBy: "created_at", order: "DESC" },
    { enabled: open },
  );

  const items: NotificationListItem[] = listData?.notifications ?? [];
  const unreadCount = unreadCountData ?? 0;

  const markReadMutation = useMarkNotificationRead();
  const markAllMutation = useMarkAllNotificationsRead();

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleRead = (id: string) => markReadMutation.mutate(id);
  const handleMarkAll = () => markAllMutation.mutate();

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`relative p-2 transition-colors ${iconBtn}`}
        style={{ color: iconColor }}
        aria-label={t("notifications")}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <BellIcon />
        {unreadCount > 0 ? (
          <span
            className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
            style={{ backgroundColor: "var(--tott-status-coral)" }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : (
          <span
            className="absolute right-1 top-1 h-2 w-2 rounded-full"
            style={{ backgroundColor: "var(--tott-status-coral)" }}
          />
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border shadow-2xl"
          style={{
            backgroundColor: "var(--tott-dash-surface-2)",
            borderColor: "var(--tott-card-border)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between border-b px-4 py-3"
            style={{ borderColor: "var(--tott-card-border)" }}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">{t("notifications")}</span>
              {unreadCount > 0 && (
                <span
                  className="rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white"
                  style={{ backgroundColor: "var(--tott-status-coral)" }}
                >
                  {t("newCount", { count: unreadCount })}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAll}
                className="text-xs transition-colors hover:opacity-80"
                style={{ color: theme.accentGold }}
              >
                {t("markAllRead")}
              </button>
            )}
          </div>

          {/* Body */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <Skeleton />
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                <span className="text-2xl">🔔</span>
                <p className="text-sm font-medium text-foreground">{t("allCaughtUp")}</p>
                <p className="text-xs" style={{ color: "var(--tott-muted)" }}>
                  {t("noNotifications")}
                </p>
              </div>
            ) : (
              <ul className="divide-y" style={{ borderColor: "var(--tott-card-border)" }}>
                {items.map((n) => (
                  <NotifRow key={n.id} n={n} onRead={handleRead} />
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          <div
            className="border-t px-4 py-2.5"
            style={{ borderColor: "var(--tott-card-border)" }}
          >
            <Link
              href="/admin/notifications"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between text-xs font-medium transition-colors hover:opacity-80"
              style={{ color: theme.accentGold }}
            >
              {t("viewAllNotifications")}
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

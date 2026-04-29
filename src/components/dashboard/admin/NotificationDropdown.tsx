"use client";

import { useState, useEffect, useRef } from "react";
import { Link } from "@/i18n/navigation";
import { BellIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useNotifications } from "@/hooks/queries/notifications";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from "@/hooks/mutations/notifications";
import type { NotificationListItem } from "@/services/notifications.service";
import { theme } from "@/lib/theme";

const ACCENT_MUTED = "#E8DDC0";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

const TYPE_COLORS: Record<string, string> = {
  system: "#6b7280",
  review: "#CBA158",
  update: "#60a5fa",
  announcement: "#a78bfa",
};

function NotifRow({
  n,
  onRead,
}: {
  n: NotificationListItem;
  onRead: (id: string) => void;
}) {
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
            style={{ backgroundColor: isUnread ? "#ef4444" : "transparent", marginTop: "6px" }}
          />
          <div className="min-w-0 flex-1">
            <p
              className="text-sm leading-snug"
              style={{ color: isUnread ? "#f3f4f6" : "#9ca3af", fontWeight: isUnread ? 500 : 400 }}
            >
              {n.message}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span
                className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                style={{ backgroundColor: `${typeColor}22`, color: typeColor }}
              >
                {n.type}
              </span>
              <span className="text-xs text-gray-600">{timeAgo(n.created_at)}</span>
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
          <div className="mt-1.5 h-2 w-2 shrink-0 animate-pulse rounded-full bg-gray-700" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-3/4 animate-pulse rounded bg-gray-700" />
            <div className="h-2.5 w-1/3 animate-pulse rounded bg-gray-700" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function NotificationDropdown() {
  const { isDark } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const iconColor = isDark ? ACCENT_MUTED : "#78716c";
  const iconBtn = isDark
    ? "hover:bg-[var(--tott-dash-ghost-hover)]"
    : "border border-[var(--tott-card-border)] bg-[var(--tott-dash-icon-bg)] hover:bg-[var(--tott-dash-ghost-hover)]";

  const { data: unreadData } = useNotifications({ limit: 1, status: "unread" });
  const { data: listData, isFetching: loading } = useNotifications(
    { limit: 8, sortBy: "created_at", order: "DESC" },
    { enabled: open },
  );

  const items: NotificationListItem[] = listData?.notifications ?? [];
  const unreadCount = unreadData?.meta.total ?? 0;

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
        className={`relative rounded-lg p-2 transition-colors ${iconBtn}`}
        style={{ color: iconColor }}
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <BellIcon />
        {unreadCount > 0 ? (
          <span
            className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
            style={{ backgroundColor: "#ef4444" }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : (
          <span
            className="absolute right-1 top-1 h-2 w-2 rounded-full"
            style={{ backgroundColor: "#ef4444" }}
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
              <span className="text-sm font-semibold text-foreground">Notifications</span>
              {unreadCount > 0 && (
                <span
                  className="rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white"
                  style={{ backgroundColor: "#ef4444" }}
                >
                  {unreadCount} new
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
                Mark all read
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
                <p className="text-sm font-medium text-foreground">You&apos;re all caught up!</p>
                <p className="text-xs text-gray-500">No notifications right now.</p>
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
              View all notifications
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

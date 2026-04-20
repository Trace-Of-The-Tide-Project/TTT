"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCallback, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import {
  BellIcon,
  FileTextIcon,
  SettingsIcon,
  StarIcon,
} from "@/components/ui/icons";
import { formatUserLastActiveRelative } from "@/lib/dashboard/user-table-formatters";
import { useStoredAuthUser } from "@/hooks/useStoredAuthUser";
import {
  filterNotificationsForUser,
  getNotifications,
  type NotificationListItem,
} from "@/services/notifications.service";

const DASH_LIMIT = 8;

function iconForNotificationType(type: string) {
  const t = type.trim().toLowerCase();
  if (t === "review") return FileTextIcon;
  if (t === "system") return SettingsIcon;
  if (t === "update") return StarIcon;
  return BellIcon;
}

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

function errMessage(e: unknown, fallback: string): string {
  if (isAxiosError(e)) {
    const d = e.response?.data;
    if (typeof d === "string" && d.trim()) return d;
    if (d && typeof d === "object") {
      const o = d as Record<string, unknown>;
      if (typeof o.message === "string") return o.message;
    }
    return e.message || fallback;
  }
  if (e instanceof Error) return e.message;
  return fallback;
}

export function DashboardNotifications() {
  const t = useTranslations("Dashboard.adminHome.notifications");
  const user = useStoredAuthUser();
  const [items, setItems] = useState<NotificationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const load = useCallback(async () => {
    if (!user?.id) {
      setItems([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await getNotifications({
        page: 1,
        limit: DASH_LIMIT,
        sortBy: "created_at",
        order: "DESC",
      });
      setItems(filterNotificationsForUser(res.notifications, user.id));
    } catch (e) {
      setError(errMessage(e, t("loadFailed")));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, t]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-bold text-foreground">{t("title")}</h3>
        <Link
          href="/admin/notifications"
          className="shrink-0 text-xs font-medium text-[#C9A96E] transition-colors hover:text-[#DBC99E]"
        >
          {t("viewAll")}
        </Link>
      </div>

      {!user?.id ? (
        <p className="rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-5 py-8 text-center text-sm text-gray-500">
          {t("signInPrompt")}
        </p>
      ) : null}

      {user?.id && error ? (
        <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-200">
          <p className="wrap-break-word">{error}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-2 text-xs font-medium text-amber-400 underline hover:text-amber-300"
          >
            {t("tryAgain")}
          </button>
        </div>
      ) : null}

      {user?.id && !error && loading ? (
        <p className="rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-5 py-8 text-center text-sm text-gray-500">
          {t("loading")}
        </p>
      ) : null}

      {user?.id && !error && !loading && items.length === 0 ? (
        <p className="rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-5 py-8 text-center text-sm text-gray-500">
          {t("empty")}
        </p>
      ) : null}

      {user?.id && !error && !loading && items.length > 0 ? (
        <div className="flex flex-col gap-5">
          {items.map((n) => {
            const Icon = iconForNotificationType(n.type);
            const time = formatUserLastActiveRelative(n.created_at, nowMs);
            return (
              <div
                key={n.id}
                className="flex items-center gap-4 rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-4 py-4 sm:px-5"
              >
                <HexIcon>
                  <Icon />
                </HexIcon>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{n.message}</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    <span className="capitalize">{n.type}</span>
                    {n.status === "unread" ? (
                      <span className="text-[#C9A96E]"> · {t("unread")}</span>
                    ) : null}
                    <span className="text-gray-600"> · {time}</span>
                  </p>
                </div>
                <Link
                  href="/admin/notifications"
                  className="shrink-0 text-xs font-medium text-gray-400 transition-colors hover:text-foreground"
                >
                  {t("open")}
                </Link>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

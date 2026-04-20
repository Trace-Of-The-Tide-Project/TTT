"use client";

import { useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { normalizeAppPathname } from "@/lib/i18n/strip-locale-from-path";
import { AdminNotificationPreferences } from "@/components/dashboard/admin/settings/AdminNotificationPreferences";
import { NotificationsAdminContent } from "./NotificationsAdminContent";

type Tab = "settings" | "inbox";

export function NotificationsAdminPage() {
  const t = useTranslations("Dashboard.notificationsPage.adminTabs");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab: Tab = searchParams.get("tab") === "inbox" ? "inbox" : "settings";

  const setTab = useCallback(
    (next: Tab) => {
      const q = next === "inbox" ? "?tab=inbox" : "";
      const base = normalizeAppPathname(pathname) ?? "/admin/notifications";
      router.replace(`${base}${q}`, { scroll: false });
    },
    [pathname, router],
  );

  const tabBtn =
    "rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--tott-dash-surface-inset)]";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-[var(--tott-card-border)] pb-4">
        <button
          type="button"
          onClick={() => setTab("settings")}
          className={`${tabBtn} ${
            tab === "settings"
              ? "bg-[var(--tott-dash-control-bg)] text-foreground"
              : "text-gray-500 hover:bg-[var(--tott-dash-control-hover)] hover:text-foreground"
          }`}
        >
          {t("settings")}
        </button>
        <button
          type="button"
          onClick={() => setTab("inbox")}
          className={`${tabBtn} ${
            tab === "inbox"
              ? "bg-[var(--tott-dash-control-bg)] text-foreground"
              : "text-gray-500 hover:bg-[var(--tott-dash-control-hover)] hover:text-foreground"
          }`}
        >
          {t("inbox")}
        </button>
      </div>

      {tab === "settings" ? <AdminNotificationPreferences /> : <NotificationsAdminContent />}
    </div>
  );
}

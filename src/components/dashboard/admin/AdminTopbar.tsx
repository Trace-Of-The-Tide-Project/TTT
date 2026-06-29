"use client";

import { useTranslations } from "next-intl";
import { SettingsIcon, HelpCircleIcon, SearchIcon } from "@/components/ui/icons";
import { NotificationDropdown } from "./NotificationDropdown";

export function AdminTopbar() {
  const t = useTranslations("Dashboard.topbar");

  return (
    <div className="hidden items-center gap-6 border-b border-[var(--tott-card-border)] py-3 pb-4 lg:flex">
      {/* Search */}
      <div className="relative min-w-0 flex-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tott-muted)]">
          <SearchIcon />
        </span>
        <input
          type="text"
          placeholder={t("searchPlaceholder")}
          className="w-full max-w-md rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-elevated)] py-2.5 pl-10 pr-4 text-sm text-foreground placeholder-[var(--tott-muted)] outline-none transition-colors focus:border-[var(--tott-dash-control-hover)]"
        />
      </div>

      {/* Right icons */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="p-2 text-[var(--tott-stat-icon)] transition-colors hover:opacity-80"
          aria-label={t("help")}
        >
          <HelpCircleIcon />
        </button>
        <button
          type="button"
          className="p-2 text-[var(--tott-stat-icon)] transition-colors hover:opacity-80"
          aria-label={t("settings")}
        >
          <SettingsIcon />
        </button>
        <NotificationDropdown />

        <span
          className="ml-1 rounded-full bg-[var(--tott-dash-control-bg)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--tott-dash-positive)]"
        >
          {t("systemHealthy")}
        </span>
      </div>
    </div>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { SettingsIcon, BellIcon, ClockIcon, SearchIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/providers/ThemeProvider";

const ACCENT_MUTED = "#E8DDC0";

export function AdminTopbar() {
  const t = useTranslations("Dashboard.topbar");
  const { isDark } = useTheme();
  const iconBtn = isDark
    ? "hover:bg-[var(--tott-dash-ghost-hover)]"
    : "border border-[var(--tott-card-border)] bg-[var(--tott-dash-icon-bg)] hover:bg-[var(--tott-dash-ghost-hover)]";
  const inputClass = isDark
    ? "w-full max-w-md rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] py-2.5 pl-10 pr-4 text-sm text-foreground placeholder-gray-600 outline-none transition-colors focus:border-gray-600"
    : "w-full max-w-md rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 outline-none transition-colors focus:border-gray-400";

  return (
    <div className="hidden items-center gap-6 border-b border-[var(--tott-card-border)] py-3 pb-4 lg:flex">
    
      {/* Search */}
      <div className="relative min-w-0 flex-1">
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: isDark ? ACCENT_MUTED : "#78716c" }}
        >
          <SearchIcon />
        </span>
        <input
          type="text"
          placeholder={t("searchPlaceholder")}
          className={inputClass}
        />
      </div>

      {/* Right icons */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          className={`rounded-lg p-2 transition-colors ${iconBtn}`}
          style={{ color: isDark ? ACCENT_MUTED : "#78716c" }}
          aria-label={t("activity")}
        >
          <ClockIcon />
        </button>
        <button
          type="button"
          className={`rounded-lg p-2 transition-colors ${iconBtn}`}
          style={{ color: isDark ? ACCENT_MUTED : "#78716c" }}
          aria-label={t("settings")}
        >
          <SettingsIcon />
        </button>
        <button
          type="button"
          className={`relative rounded-lg p-2 transition-colors ${iconBtn}`}
          style={{ color: isDark ? ACCENT_MUTED : "#78716c" }}
          aria-label={t("notifications")}
        >
          <BellIcon />
          <span
            className="absolute right-1 top-1 h-2 w-2 rounded-full"
            style={{ backgroundColor: isDark ? ACCENT_MUTED : "#a8a29e" }}
          />
        </button>

        <span
          className="ml-1 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
          style={{ backgroundColor: "rgba(52, 211, 153, 0.15)", color: "#34d399" }}
        >
          {t("systemHealthy")}
        </span>
      </div>
    </div>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { DownloadIcon } from "@/components/ui/icons";
import { securityStats } from "@/lib/dashboard/security-constants";

const ACCENT = "#E8DDC0";

/**
 * Security-only command row: export action + stat cards. Used below {@link AdminSettingsPageHeader} on `/admin/security`.
 */
export function SecurityPageToolbar() {
  const t = useTranslations("Dashboard.securityPage");

  return (
    <div className="px-6 pb-6 sm:px-8">
      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          className="inline-flex h-[40px] items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-[#111] whitespace-nowrap transition-opacity hover:opacity-90"
          style={{ backgroundColor: ACCENT }}
        >
          <span className="[&_svg]:h-4 [&_svg]:w-4">
            <DownloadIcon />
          </span>
          {t("toolbar.exportLogs")}
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {securityStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              className="flex min-h-[132px] flex-col items-center justify-center gap-2 rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-4 py-5"
            >
              <span className="text-[#E8DDC0]">
                <Icon />
              </span>
              <span className="text-center text-xs text-gray-500">{t(`stats.${stat.id}`)}</span>
              <span className="text-2xl font-bold text-foreground">{t(`statValues.${stat.id}`)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { ComponentType } from "react";
import type { ContentCategoryKey } from "@/lib/dashboard/admin-dashboard-constants";

type ContentRow = {
  id: string;
  icon: ComponentType;
  categoryKey: ContentCategoryKey;
  published: number;
  drafts: number;
  flagged: number | string;
};

type ContentOverviewProps = {
  rows: ContentRow[];
  totalValue?: string;
  manageHref?: string;
};

export function ContentOverview({ rows, totalValue, manageHref }: ContentOverviewProps) {
  const t = useTranslations("Dashboard.adminHome.contentOverview");
  return (
    <div className="rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">{t("title")}</h3>
        {manageHref && (
          <Link
            href={manageHref}
            className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-4 py-2 text-xs font-medium text-gray-300 transition-colors hover:border-gray-500 hover:text-foreground"
          >
            {t("manageAll")}
          </Link>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--tott-card-border)]">
        <table className="w-full text-start text-sm">
          <thead>
            <tr className="border-b border-[var(--tott-card-border)]">
              <th className="px-5 py-3 text-xs font-medium" style={{ color: "#CBA158" }}>
                {t("headers.category")}
              </th>
              <th className="px-4 py-3 text-xs font-medium" style={{ color: "#CBA158" }}>
                {t("headers.published")}
              </th>
              <th className="px-4 py-3 text-xs font-medium" style={{ color: "#CBA158" }}>
                {t("headers.drafts")}
              </th>
              <th className="px-4 py-3 text-xs font-medium" style={{ color: "#CBA158" }}>
                {t("headers.flagged")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#333]/40">
            {rows.map((row) => {
              const Icon = row.icon;
              return (
                <tr key={row.id} className="text-gray-300">
                  <td className="flex items-center gap-2.5 px-5 py-3.5">
                    <span className="text-gray-500">
                      <Icon />
                    </span>
                    <span className="font-medium text-foreground">
                      {t(`categories.${row.categoryKey}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">{row.published.toLocaleString()}</td>
                  <td className="px-4 py-3.5">{row.drafts}</td>
                  <td className="px-4 py-3.5">
                    {row.flagged === "—" || row.flagged === 0 ? (
                      <span className="text-gray-600">—</span>
                    ) : (
                      <span className="font-medium text-red-400">{row.flagged}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalValue && (
        <div className="mt-4 flex items-center justify-between px-1 text-sm text-gray-500">
          <span>{t("totalLabel")}</span>
          <span className="font-medium text-foreground">{totalValue}</span>
        </div>
      )}
    </div>
  );
}

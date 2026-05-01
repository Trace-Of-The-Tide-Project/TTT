"use client";

import { useTranslations, useMessages } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { ComponentType } from "react";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";

const CATEGORY_KEY_MAP: Record<string, string> = {
  photography: "photography", artwork: "artwork", "personal story": "personalStory",
  music: "music", literature: "literature", testimony: "testimony",
  "history document": "historyDocument", other: "other", biography: "biography",
  articles: "articles", films: "films", essays: "essays", podcasts: "podcasts",
};

function translateCategory(messages: unknown, label: string): string {
  try {
    const key = CATEGORY_KEY_MAP[label.toLowerCase()];
    if (!key) return label;
    const overviewMap = ((messages as Record<string, unknown>)?.Dashboard as Record<string, unknown>)
      ?.adminHome as Record<string, unknown>;
    const contentOverview = overviewMap?.contentOverview as Record<string, unknown>;
    const categories = contentOverview?.categories as Record<string, string> | undefined;
    return categories?.[key] ?? label;
  } catch {
    return label;
  }
}

type ContentRow = {
  id: string;
  icon: ComponentType;
  label: string;
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
  const messages = useMessages();
  return (
    <div className="relative px-6 pb-6 pt-6">
      <ChamferedFrame />
      <div className="relative mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">{t("title")}</h3>
        {manageHref && (
          <Link
            href={manageHref}
            className="rounded-lg bg-[var(--tott-elevated)] px-4 py-2 text-xs font-medium text-[var(--tott-dash-control-fg)] transition-colors hover:bg-[var(--tott-elevated-hover)]"
          >
            {t("manageAll")}
          </Link>
        )}
      </div>

      <div className="relative overflow-x-auto">
        <ChamferedFrame size={20} />
        <table className="w-full text-start text-sm">
          <thead>
            <tr className="border-b border-[var(--tott-card-border)]">
              <th className="px-6 py-4 text-start text-xs font-medium text-[var(--tott-dash-gold-label)]">
                {t("headers.category")}
              </th>
              <th className="px-4 py-4 text-start text-xs font-medium text-[var(--tott-dash-gold-label)]">
                {t("headers.published")}
              </th>
              <th className="px-4 py-4 text-start text-xs font-medium text-[var(--tott-dash-gold-label)]">
                {t("headers.drafts")}
              </th>
              <th className="px-4 py-4 text-start text-xs font-medium text-[var(--tott-dash-gold-label)]">
                {t("headers.flagged")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--tott-dash-divider)]">
            {rows.map((row) => {
              const Icon = row.icon;
              const isFlaggedActive = row.flagged !== "—" && row.flagged !== 0;
              return (
                <tr key={row.id} className="border-b border-[var(--tott-dash-divider)]">
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-2.5">
                      <span className="text-[var(--tott-muted)] opacity-60">
                        <Icon />
                      </span>
                      <span className="sr-only capitalize">{translateCategory(messages, row.label)}</span>
                    </span>
                  </td>
                  <td className="px-4 py-4 text-[var(--tott-muted)]">{row.published.toLocaleString()}</td>
                  <td className="px-4 py-4 text-[var(--tott-muted)]">{row.drafts}</td>
                  <td className="px-4 py-4">
                    {isFlaggedActive ? (
                      <span className="font-medium text-[var(--tott-status-coral)]">{row.flagged}</span>
                    ) : (
                      <span className="text-[var(--tott-muted)] opacity-50">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
            <tr>
              <td colSpan={4} className="px-6 py-4 text-sm text-[var(--tott-muted)]">
                <span className="flex items-center justify-between">
                  <span>{t("totalLabel")}</span>
                  {totalValue && (
                    <span className="font-medium text-foreground">{totalValue}</span>
                  )}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

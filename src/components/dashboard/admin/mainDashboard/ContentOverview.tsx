"use client";

import { useTranslations, useMessages } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { ComponentType } from "react";

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
    <div className="rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">{t("title")}</h3>
        {manageHref && (
          <Link
            href={manageHref}
            className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-4 py-2 text-xs font-medium text-[var(--tott-dash-control-fg)] transition-colors hover:border-[var(--tott-dash-control-hover)]"
          >
            {t("manageAll")}
          </Link>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--tott-card-border)]">
        <table className="w-full text-start text-sm">
          <thead>
            <tr className="border-b border-[var(--tott-card-border)]">
              <th className="px-5 py-3 text-xs font-medium text-[var(--tott-dash-gold-label)]">
                {t("headers.category")}
              </th>
              <th className="px-4 py-3 text-xs font-medium text-[var(--tott-dash-gold-label)]">
                {t("headers.published")}
              </th>
              <th className="px-4 py-3 text-xs font-medium text-[var(--tott-dash-gold-label)]">
                {t("headers.drafts")}
              </th>
              <th className="px-4 py-3 text-xs font-medium text-[var(--tott-dash-gold-label)]">
                {t("headers.flagged")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--tott-dash-divider)]">
            {rows.map((row) => {
              const Icon = row.icon;
              return (
                <tr key={row.id} className="text-[var(--tott-muted)]">
                  <td className="flex items-center gap-2.5 px-5 py-3.5">
                    <span className="text-[var(--tott-muted)] opacity-60">
                      <Icon />
                    </span>
                    <span className="font-medium text-foreground capitalize">
                      {translateCategory(messages, row.label)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">{row.published.toLocaleString()}</td>
                  <td className="px-4 py-3.5">{row.drafts}</td>
                  <td className="px-4 py-3.5">
                    {row.flagged === "—" || row.flagged === 0 ? (
                      <span className="opacity-40">—</span>
                    ) : (
                      <span className="font-medium text-[var(--tott-dash-negative)]">{row.flagged}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalValue && (
        <div className="mt-4 flex items-center justify-between px-1 text-sm text-[var(--tott-muted)]">
          <span>{t("totalLabel")}</span>
          <span className="font-medium text-foreground">{totalValue}</span>
        </div>
      )}
    </div>
  );
}

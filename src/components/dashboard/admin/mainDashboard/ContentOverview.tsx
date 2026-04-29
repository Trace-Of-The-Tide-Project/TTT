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

function HeaderTotal({ label, total, bg, fg }: { label: string; total: number; bg: string; fg: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span>{label}</span>
      <span
        className="inline-flex h-5 min-w-[1.5rem] items-center justify-center rounded-full px-1.5 text-[10px] font-bold tabular-nums"
        style={{ backgroundColor: bg, color: fg }}
      >
        {total}
      </span>
    </span>
  );
}

export function ContentOverview({ rows, totalValue, manageHref }: ContentOverviewProps) {
  const t = useTranslations("Dashboard.adminHome.contentOverview");
  const messages = useMessages();
  const totals = rows.reduce(
    (acc, r) => ({
      published: acc.published + r.published,
      drafts: acc.drafts + r.drafts,
      flagged: acc.flagged + (typeof r.flagged === "number" ? r.flagged : 0),
    }),
    { published: 0, drafts: 0, flagged: 0 },
  );
  return (
    <div className="rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">{t("title")}</h3>
        {manageHref && (
          <Link
            href={manageHref}
            className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-3 py-1.5 text-xs font-medium text-[var(--tott-dash-control-fg)] transition-colors hover:border-[var(--tott-dash-control-hover)]"
          >
            {t("manageAll")}
          </Link>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl">
        <table className="w-full text-start text-sm">
          <thead>
            <tr className="border-b border-[var(--tott-card-border)]">
              <th className="px-5 py-3 text-start text-xs font-medium text-[var(--tott-dash-gold-label)]">
                {t("headers.category")}
              </th>
              <th className="px-4 py-3 text-start text-xs font-medium text-[var(--tott-dash-gold-label)]">
                <HeaderTotal label={t("headers.published")} total={totals.published} bg="var(--tott-dash-control-bg)" fg="var(--tott-muted)" />
              </th>
              <th className="px-4 py-3 text-start text-xs font-medium text-[var(--tott-dash-gold-label)]">
                <HeaderTotal label={t("headers.drafts")} total={totals.drafts} bg="var(--tott-dash-control-bg)" fg="var(--tott-muted)" />
              </th>
              <th className="px-4 py-3 text-start text-xs font-medium text-[var(--tott-dash-gold-label)]">
                <HeaderTotal label={t("headers.flagged")} total={totals.flagged} bg="var(--tott-dash-control-bg)" fg="var(--tott-muted)" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--tott-dash-divider)]">
            {rows.map((row) => {
              const Icon = row.icon;
              const isFlaggedActive = row.flagged !== "—" && row.flagged !== 0;
              return (
                <tr key={row.id}>
                  <td className="flex items-center gap-2.5 px-5 py-3.5">
                    <span className="text-[var(--tott-muted)] opacity-60">
                      <Icon />
                    </span>
                    <span className="font-medium capitalize text-foreground">
                      {translateCategory(messages, row.label)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-[var(--tott-muted)]">{row.published.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-[var(--tott-muted)]">{row.drafts}</td>
                  <td className="px-4 py-3.5">
                    {isFlaggedActive ? (
                      <span className="font-medium text-[var(--tott-dash-negative)]">{row.flagged}</span>
                    ) : (
                      <span className="text-[var(--tott-muted)] opacity-50">—</span>
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

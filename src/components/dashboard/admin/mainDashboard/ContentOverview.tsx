"use client";

import { useTranslations, useMessages } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { ComponentType } from "react";
import { ChamferedPanel } from "@/components/ui/ChamferedPanel";
import { ChamferedCap } from "@/components/ui/ChamferedCap";

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
  const headerCellClass = "px-5 py-3 text-start text-sm font-medium text-[var(--tott-dash-gold-label)]";
  const dataCellClass = "px-5 py-3 text-sm text-foreground";
  return (
    <ChamferedPanel className="px-3 pb-4 pt-4 min-[504px]:px-6 min-[504px]:pb-6 min-[504px]:pt-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h3 className="text-base font-bold text-foreground min-[504px]:text-lg">{t("title")}</h3>
        {manageHref && (
          <Link
            href={manageHref}
            className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dark-pill)] px-3 py-1.5 text-xs font-medium text-[var(--tott-dark-pill-fg)] transition-colors hover:bg-[var(--tott-elevated-hover)] min-[504px]:px-4 min-[504px]:py-2"
          >
            {t("manageAll")}
          </Link>
        )}
      </div>

      {/* Empty chamfered top cap (decorative) */}
      <ChamferedCap direction="top" />

      {/* Wide layout — ≥504px: 4-column table grid */}
      <div className="hidden min-[504px]:block">
        {/* Header rectangle */}
        <div className="grid grid-cols-[30%_23%_23%_24%] border-x border-y border-[var(--tott-card-border)]">
          <div className={headerCellClass}>{t("headers.category")}</div>
          <div className={headerCellClass}>{t("headers.published")}</div>
          <div className={headerCellClass}>{t("headers.drafts")}</div>
          <div className={headerCellClass}>{t("headers.flagged")}</div>
        </div>

        {/* Data rows */}
        {rows.map((row) => {
          const Icon = row.icon;
          const isFlaggedActive = row.flagged !== "—" && row.flagged !== 0;
          return (
            <div
              key={row.id}
              className="grid grid-cols-[30%_23%_23%_24%] border-x border-b border-[var(--tott-card-border)] transition-colors hover:bg-[var(--tott-elevated)]"
            >
              <div className="px-5 py-3">
                <span className="inline-flex items-center gap-2.5">
                  <span className="text-[var(--tott-muted)]">
                    <Icon />
                  </span>
                  <span className="text-sm capitalize text-foreground">
                    {translateCategory(messages, row.label)}
                  </span>
                </span>
              </div>
              <div className={dataCellClass}>{row.published.toLocaleString()}</div>
              <div className={dataCellClass}>{row.drafts}</div>
              <div className="px-5 py-3 text-sm">
                {isFlaggedActive ? (
                  <span className="font-medium text-[var(--tott-dash-negative)]">
                    {typeof row.flagged === "number" ? row.flagged.toLocaleString() : row.flagged}
                  </span>
                ) : (
                  <span className="text-[var(--tott-muted)] opacity-60">—</span>
                )}
              </div>
            </div>
          );
        })}

        {/* Total rectangle */}
        <div className="flex items-center justify-between border-x border-b border-[var(--tott-card-border)] px-5 py-4">
          <span className="text-sm text-[var(--tott-muted)]">{t("totalLabel")}</span>
          <span className="text-base font-semibold text-foreground">{totalValue}</span>
        </div>
      </div>

      {/* Narrow layout — <504px: stacked cards (each row becomes a card with the
          category in the heading and the three stats inline below). */}
      <div className="border-x border-y border-[var(--tott-card-border)] min-[504px]:hidden">
        {rows.map((row) => {
          const Icon = row.icon;
          const isFlaggedActive = row.flagged !== "—" && row.flagged !== 0;
          return (
            <div
              key={row.id}
              className="border-b border-[var(--tott-card-border)] px-3 py-3 last:border-b-0"
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="text-[var(--tott-muted)]">
                  <Icon />
                </span>
                <span className="text-sm font-medium capitalize text-foreground">
                  {translateCategory(messages, row.label)}
                </span>
              </div>
              <dl className="grid grid-cols-3 gap-2 text-xs">
                <div className="flex flex-col gap-0.5">
                  <dt className="text-[10px] uppercase text-[var(--tott-dash-gold-label)]">{t("headers.published")}</dt>
                  <dd className="text-sm text-foreground">{row.published.toLocaleString()}</dd>
                </div>
                <div className="flex flex-col gap-0.5">
                  <dt className="text-[10px] uppercase text-[var(--tott-dash-gold-label)]">{t("headers.drafts")}</dt>
                  <dd className="text-sm text-foreground">{row.drafts}</dd>
                </div>
                <div className="flex flex-col gap-0.5">
                  <dt className="text-[10px] uppercase text-[var(--tott-dash-gold-label)]">{t("headers.flagged")}</dt>
                  <dd className="text-sm">
                    {isFlaggedActive ? (
                      <span className="font-medium text-[var(--tott-dash-negative)]">
                        {typeof row.flagged === "number" ? row.flagged.toLocaleString() : row.flagged}
                      </span>
                    ) : (
                      <span className="text-[var(--tott-muted)] opacity-60">—</span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          );
        })}
      </div>

      {/* Narrow total — sits below the card stack, mirroring the wide layout */}
      <div className="flex items-center justify-between border-x border-b border-[var(--tott-card-border)] px-3 py-3 min-[504px]:hidden">
        <span className="text-sm text-[var(--tott-muted)]">{t("totalLabel")}</span>
        <span className="text-sm font-semibold text-foreground">{totalValue}</span>
      </div>

      {/* Empty chamfered bottom cap (decorative, mirror of top) */}
      <ChamferedCap direction="bottom" />
    </ChamferedPanel>
  );
}

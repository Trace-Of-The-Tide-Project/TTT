"use client";

import { useTranslations, useMessages } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { ComponentType } from "react";
import { ChamferedPanel } from "@/components/ui/ChamferedPanel";
import {
  ChamferedTable,
  type ChamferedTableColumn,
} from "@/components/ui/ChamferedTable";

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

function FlaggedCell({ value }: { value: number | string }) {
  const isActive = value !== "—" && value !== 0;
  if (!isActive) {
    return <span className="text-[var(--tott-muted)] opacity-60">—</span>;
  }
  return (
    <span className="font-medium text-[var(--tott-dash-negative)]">
      {typeof value === "number" ? value.toLocaleString() : value}
    </span>
  );
}

export function ContentOverview({ rows, totalValue, manageHref }: ContentOverviewProps) {
  const t = useTranslations("Dashboard.adminHome.contentOverview");
  const messages = useMessages();

  const columns: ChamferedTableColumn<ContentRow>[] = [
    {
      key: "category",
      header: t("headers.category"),
      width: "30%",
      cell: (row) => {
        const Icon = row.icon;
        return (
          <span className="inline-flex items-center gap-2.5">
            <span className="text-[var(--tott-muted)]">
              <Icon />
            </span>
            <span className="text-sm capitalize text-foreground">
              {translateCategory(messages, row.label)}
            </span>
          </span>
        );
      },
    },
    {
      key: "published",
      header: t("headers.published"),
      width: "23%",
      cell: (row) => row.published.toLocaleString(),
    },
    {
      key: "drafts",
      header: t("headers.drafts"),
      width: "23%",
      cell: (row) => row.drafts,
    },
    {
      key: "flagged",
      header: t("headers.flagged"),
      width: "24%",
      cell: (row) => <FlaggedCell value={row.flagged} />,
    },
  ];

  const wideFooter = (
    <div className="flex items-center justify-between px-5 py-4">
      <span className="text-sm text-[var(--tott-muted)]">{t("totalLabel")}</span>
      <span className="text-base font-semibold text-foreground">{totalValue}</span>
    </div>
  );

  const narrowFooter = (
    <div className="flex items-center justify-between px-3 py-3">
      <span className="text-sm text-[var(--tott-muted)]">{t("totalLabel")}</span>
      <span className="text-sm font-semibold text-foreground">{totalValue}</span>
    </div>
  );

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

      <ChamferedTable
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        footer={wideFooter}
        footerNarrow={narrowFooter}
        renderNarrow={(row) => {
          const Icon = row.icon;
          return (
            <div className="px-3 py-3">
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
                  <dt className="text-[10px] uppercase text-[var(--tott-dash-gold-label)]">
                    {t("headers.published")}
                  </dt>
                  <dd className="text-sm text-foreground">
                    {row.published.toLocaleString()}
                  </dd>
                </div>
                <div className="flex flex-col gap-0.5">
                  <dt className="text-[10px] uppercase text-[var(--tott-dash-gold-label)]">
                    {t("headers.drafts")}
                  </dt>
                  <dd className="text-sm text-foreground">{row.drafts}</dd>
                </div>
                <div className="flex flex-col gap-0.5">
                  <dt className="text-[10px] uppercase text-[var(--tott-dash-gold-label)]">
                    {t("headers.flagged")}
                  </dt>
                  <dd className="text-sm">
                    <FlaggedCell value={row.flagged} />
                  </dd>
                </div>
              </dl>
            </div>
          );
        }}
      />
    </ChamferedPanel>
  );
}

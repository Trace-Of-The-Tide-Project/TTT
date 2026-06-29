"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageBubbleIcon } from "@/components/ui/icons";
import { theme } from "@/lib/theme";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ChamferedPanel } from "@/components/ui/ChamferedPanel";
import { api } from "@/services/api";

type FilterType = "all" | "one-time" | "recurring";

interface SupporterUser {
  id: string;
  username: string;
  full_name?: string;
}

interface SupporterRow {
  id: string;
  amount: number;
  type: string;
  createdAt: string;
  User?: SupporterUser;
}

interface SupportersResponse {
  supporters: SupporterRow[];
  total: number;
  page: number;
  total_pages: number;
}

function normalizeRow(raw: unknown): SupporterRow {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const user = (o.user ?? o.User);
  const u = user && typeof user === "object" ? (user as Record<string, unknown>) : null;
  return {
    id: typeof o.id === "string" ? o.id : "",
    amount: typeof o.amount === "number" ? o.amount : 0,
    type: typeof o.type === "string" ? o.type : "one-time",
    createdAt: typeof o.createdAt === "string" ? o.createdAt : "",
    User: u
      ? {
          id: typeof u.id === "string" ? u.id : "",
          username: typeof u.username === "string" ? u.username : "",
          full_name: typeof u.full_name === "string" ? u.full_name : undefined,
        }
      : undefined,
  };
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "?";
}

type RelativeTranslate = (key: string, values?: Record<string, number>) => string;

function formatRelativeTime(iso: string, t: RelativeTranslate, locale: string): string {
  if (!iso) return "";
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return t("justNow");
    if (mins < 60) return t("minutesAgo", { count: mins });
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return t("hoursAgo", { count: hrs });
    const days = Math.floor(hrs / 24);
    if (days < 30) return t("daysAgo", { count: days });
    return new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric" }).format(new Date(iso));
  } catch {
    return "";
  }
}

const PAGE_SIZE = 10;

export function SupportersContent() {
  const t = useTranslations("Dashboard.profileSupporters");
  const locale = useLocale();
  const _qc = useQueryClient();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");
  const [page, setPage] = useState(1);
  const [thankedIds, setThankedIds] = useState<Set<string>>(new Set());

  const filters = useMemo(
    () => [
      { id: "all" as const, label: t("filterAll") },
      { id: "one-time" as const, label: t("filterOneTime") },
      { id: "recurring" as const, label: t("filterRecurring") },
    ],
    [t],
  );

  const queryKey = ["supporters", selectedFilter, page];

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: async (): Promise<SupportersResponse> => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
        ...(selectedFilter !== "all" ? { type: selectedFilter } : {}),
      });
      const { data: raw } = await api.get<unknown>(`/author/supporters?${params}`);
      const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
      return {
        supporters: Array.isArray(o.supporters) ? o.supporters.map(normalizeRow) : [],
        total: typeof o.total === "number" ? o.total : 0,
        page: typeof o.page === "number" ? o.page : 1,
        total_pages: typeof o.total_pages === "number" ? o.total_pages : 1,
      };
    },
  });

  const thankMutation = useMutation({
    mutationFn: (donationId: string) =>
      api.post(`/author/supporters/${donationId}/thank`),
    onSuccess: (_res, donationId) => {
      setThankedIds((prev) => new Set(prev).add(donationId));
    },
  });

  function handleFilterChange(f: FilterType) {
    setSelectedFilter(f);
    setPage(1);
  }

  const supporters = data?.supporters ?? [];
  const totalPages = data?.total_pages ?? 1;

  const typeLabel = (type: string) =>
    type === "recurring" ? t("typeRecurring") : t("typeOneTime");

  return (
    <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
      <SegmentedControl
        options={filters.map((opt) => ({ id: opt.id, label: opt.label }))}
        value={selectedFilter}
        onChange={handleFilterChange}
      />

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => (
            <ChamferedPanel key={i} className="px-4 py-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[var(--tott-dash-surface-2)] shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-32 rounded bg-[var(--tott-dash-surface-2)]" />
                  <div className="h-2 w-20 rounded bg-[var(--tott-dash-surface-2)]" />
                </div>
              </div>
            </ChamferedPanel>
          ))}
        </div>
      ) : isError ? (
        <div className="flex items-center justify-center py-12 text-sm text-[var(--tott-muted)]">
          {t("loadError")}
        </div>
      ) : supporters.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16">
          <p className="text-sm text-[var(--tott-muted)]">{t("emptyTitle")}</p>
          <p className="text-xs text-[var(--tott-muted)]">{t("emptySubtitle")}</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {supporters.map((entry) => {
              const name = entry.User?.full_name || entry.User?.username || t("anonymous");
              const initials = getInitials(name);
              const isThanked = thankedIds.has(entry.id);
              const isThanking = thankMutation.isPending && thankMutation.variables === entry.id;

              return (
                <ChamferedPanel key={entry.id} className="px-4 py-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-medium"
                        style={{ backgroundColor: theme.accentGoldFocus, color: theme.bgDark }}
                      >
                        {initials}
                      </span>
                      <div>
                        <p className="text-sm font-medium" style={{ color: theme.accentGoldFocus }}>
                          {name}
                        </p>
                        <p className="text-xs text-[var(--tott-muted)]">{formatRelativeTime(entry.createdAt, t, locale)}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                      <div className="flex flex-col items-start sm:items-end">
                        <p className="text-sm font-medium" style={{ color: theme.accentGoldFocus }}>
                          ${entry.amount}
                        </p>
                        <p className="text-xs capitalize text-foreground">{typeLabel(entry.type)}</p>
                      </div>
                      <button
                        type="button"
                        disabled={isThanked || isThanking}
                        onClick={() => thankMutation.mutate(entry.id)}
                        className="flex cursor-pointer items-center justify-center gap-2 self-start rounded-lg bg-[var(--tott-dash-control-bg)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--tott-dash-control-hover)] disabled:opacity-50 disabled:cursor-default"
                      >
                        <MessageBubbleIcon />
                        {isThanked ? t("thanked") : isThanking ? t("sending") : t("thankContributor")}
                      </button>
                    </div>
                  </div>
                </ChamferedPanel>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border border-[var(--tott-card-border)] px-3 py-1.5 text-xs text-[var(--tott-muted)] transition-colors hover:border-[var(--tott-card-border)] hover:text-foreground disabled:opacity-30 disabled:cursor-default"
              >
                ← {t("prev")}
              </button>
              <span className="text-xs text-[var(--tott-muted)]">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-[var(--tott-card-border)] px-3 py-1.5 text-xs text-[var(--tott-muted)] transition-colors hover:border-[var(--tott-card-border)] hover:text-foreground disabled:opacity-30 disabled:cursor-default"
              >
                {t("next")} →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

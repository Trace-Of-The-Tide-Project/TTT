"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { isAxiosError } from "axios";
import { PlusIcon, EyeIcon, TrashIcon } from "@/components/ui/icons";
import type { TripListItem } from "@/services/trips.service";
import { useTrips } from "@/hooks/queries/trips";
import { useDeleteTrip } from "@/hooks/mutations/trips";
import { TripEditorLayout } from "@/components/dashboard/admin/articles/articles-editor/trip/TripEditorLayout";
import { ChamferedPanel } from "@/components/ui/ChamferedPanel";
import { ChamferedCap } from "@/components/ui/ChamferedCap";
import { TripPreviewModal } from "@/components/dashboard/admin/articles/articles-editor/trip/TripPreviewModal";

const ROWS_PER_PAGE = 6;

function errMessage(e: unknown, requestFailed: string, generic: string): string {
  if (isAxiosError(e)) {
    const d = e.response?.data;
    if (typeof d === "string" && d.trim()) return d;
    if (d && typeof d === "object") {
      const o = d as Record<string, unknown>;
      if (typeof o.message === "string") return o.message;
    }
    return e.message || requestFailed;
  }
  if (e instanceof Error) return e.message;
  return generic;
}

function formatDate(iso: string | null, locale: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" });
}

function durationLabel(hours: number, t: (key: string, values?: Record<string, number>) => string): string {
  if (hours >= 24) {
    const days = Math.round(hours / 24);
    return t("management.duration.days", { count: days });
  }
  return t("management.duration.hours", { count: hours });
}

type StatusStyle = { label: string; color: string };

function statusDisplay(status: string, t: (key: string) => string): StatusStyle {
  const s = status.toLowerCase();
  if (s === "published" || s === "completed")
    return { label: t("management.status.completed"), color: "#2ECC71" };
  if (s === "archived") return { label: t("management.status.archived"), color: "#E67E22" };
  if (s === "draft") return { label: t("management.status.draft"), color: "#3498DB" };
  return { label: t("management.status.past"), color: "#9ca3af" };
}

function SearchIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

type ArchiveViewProps = {
  trips: TripListItem[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onDelete: (id: string) => void;
  deletingId: string | null;
  onPreview: (trip: TripListItem) => void;
};

function ArchiveView({ trips, loading, error, onRetry, onDelete, deletingId, onPreview }: ArchiveViewProps) {
  const t = useTranslations("Dashboard.trips");
  const locale = useLocale();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search.trim()) return trips;
    const q = search.toLowerCase();
    return trips.filter(
      (tr) =>
        tr.title.toLowerCase().includes(q) ||
        (tr.route_summary ?? "").toLowerCase().includes(q) ||
        tr.category.toLowerCase().includes(q),
    );
  }, [trips, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const fromRow = (safePage - 1) * ROWS_PER_PAGE + 1;
  const toRow = Math.min(safePage * ROWS_PER_PAGE, filtered.length);

  return (
    <>
      {error && (
        <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-200">
          <p>{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 text-xs font-medium text-amber-400 underline hover:text-amber-300"
          >
            {t("management.tryAgain")}
          </button>
        </div>
      )}

      {loading ? (
        <div className="rounded-lg border border-[var(--tott-card-border)] px-5 py-12 text-center text-sm text-gray-500">
          {t("management.loading")}
        </div>
      ) : (
        <ChamferedPanel className="px-3 pb-4 pt-4 min-[504px]:px-6 min-[504px]:pb-6 min-[504px]:pt-6">
          {/* Search bar — lives inside the panel above the table */}
          <div className="relative mb-4">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <SearchIcon />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("management.searchPlaceholder")}
              className="w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] py-2.5 pl-10 pr-4 text-sm text-foreground placeholder-gray-500 outline-none focus:border-gray-500"
            />
          </div>

          {/* Decorative chamfered top cap (matches ContentOverview) */}
          <ChamferedCap direction="top" />

          {/* Wide layout — ≥504px: 7-column grid */}
          {pageRows.length === 0 ? (
            <div className="border-x border-y border-[var(--tott-card-border)] px-5 py-10 text-center text-sm text-gray-500">
              {search.trim() ? t("management.empty.noMatch") : t("management.empty.none")}
            </div>
          ) : (
            <>
              <div className="hidden min-[504px]:block">
                {/* Header row */}
                <div className="grid grid-cols-[24%_18%_12%_12%_11%_13%_10%] border-x border-y border-[var(--tott-card-border)]">
                  <div className="px-5 py-3 text-start text-sm font-medium text-[var(--tott-dash-gold-label)]">
                    {t("management.headers.title")}
                  </div>
                  <div className="px-4 py-3 text-start text-sm font-medium text-[var(--tott-dash-gold-label)]">
                    {t("management.headers.route")}
                  </div>
                  <div className="px-4 py-3 text-start text-sm font-medium text-[var(--tott-dash-gold-label)]">
                    {t("management.headers.startDate")}
                  </div>
                  <div className="px-4 py-3 text-start text-sm font-medium text-[var(--tott-dash-gold-label)]">
                    {t("management.headers.endDate")}
                  </div>
                  <div className="px-4 py-3 text-start text-sm font-medium text-[var(--tott-dash-gold-label)]">
                    {t("management.headers.duration")}
                  </div>
                  <div className="px-4 py-3 text-start text-sm font-medium text-[var(--tott-dash-gold-label)]">
                    {t("management.headers.status")}
                  </div>
                  <div className="px-4 py-3" aria-hidden />
                </div>

                {/* Data rows */}
                {pageRows.map((trip) => {
                  const st = statusDisplay(trip.status, t as (key: string) => string);
                  return (
                    <div
                      key={trip.id}
                      className="grid grid-cols-[24%_18%_12%_12%_11%_13%_10%] border-x border-b border-[var(--tott-card-border)] transition-colors hover:bg-[var(--tott-elevated)]"
                    >
                      <div className="px-5 py-3 text-sm font-medium text-foreground">{trip.title}</div>
                      <div className="px-4 py-3 text-sm text-[var(--tott-muted)]">{trip.route_summary ?? "—"}</div>
                      <div className="px-4 py-3 text-sm text-[var(--tott-muted)]">{formatDate(trip.start_date, locale)}</div>
                      <div className="px-4 py-3 text-sm text-[var(--tott-muted)]">{formatDate(trip.end_date, locale)}</div>
                      <div className="px-4 py-3 text-sm text-[var(--tott-muted)]">
                        {durationLabel(trip.duration_hours, t as (key: string, v?: Record<string, number>) => string)}
                      </div>
                      <div className="px-4 py-3 text-xs font-medium" style={{ color: st.color }}>
                        {st.label}
                      </div>
                      <div className="flex items-center justify-end gap-2 px-4 py-3">
                        <button
                          type="button"
                          onClick={() => onPreview(trip)}
                          className="text-gray-500 transition-colors hover:text-foreground"
                          aria-label={t("management.previewAria", { title: trip.title })}
                        >
                          <EyeIcon />
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === trip.id}
                          onClick={() => onDelete(trip.id)}
                          className="text-red-400 transition-colors hover:text-red-300 disabled:opacity-40"
                          aria-label={t("management.deleteAria", { title: trip.title })}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Narrow layout — <504px: stacked cards (one per trip) */}
              <div className="border-x border-y border-[var(--tott-card-border)] min-[504px]:hidden">
                {pageRows.map((trip) => {
                  const st = statusDisplay(trip.status, t as (key: string) => string);
                  return (
                    <div
                      key={trip.id}
                      className="border-b border-[var(--tott-card-border)] px-3 py-3 last:border-b-0"
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <span className="text-sm font-medium text-foreground">{trip.title}</span>
                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onPreview(trip)}
                            className="text-gray-500 transition-colors hover:text-foreground"
                            aria-label={t("management.previewAria", { title: trip.title })}
                          >
                            <EyeIcon />
                          </button>
                          <button
                            type="button"
                            disabled={deletingId === trip.id}
                            onClick={() => onDelete(trip.id)}
                            className="text-gray-500 transition-colors hover:text-red-400 disabled:opacity-40"
                            aria-label={t("management.deleteAria", { title: trip.title })}
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </div>
                      <dl className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex flex-col gap-0.5">
                          <dt className="text-[10px] uppercase text-[var(--tott-dash-gold-label)]">{t("management.headers.route")}</dt>
                          <dd className="text-sm text-[var(--tott-muted)]">{trip.route_summary ?? "—"}</dd>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <dt className="text-[10px] uppercase text-[var(--tott-dash-gold-label)]">{t("management.headers.startDate")}</dt>
                          <dd className="text-sm text-[var(--tott-muted)]">{formatDate(trip.start_date, locale)}</dd>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <dt className="text-[10px] uppercase text-[var(--tott-dash-gold-label)]">{t("management.headers.endDate")}</dt>
                          <dd className="text-sm text-[var(--tott-muted)]">{formatDate(trip.end_date, locale)}</dd>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <dt className="text-[10px] uppercase text-[var(--tott-dash-gold-label)]">{t("management.headers.duration")}</dt>
                          <dd className="text-sm text-[var(--tott-muted)]">
                            {durationLabel(trip.duration_hours, t as (key: string, v?: Record<string, number>) => string)}
                          </dd>
                        </div>
                        <div className="col-span-2 flex flex-col gap-0.5">
                          <dt className="text-[10px] uppercase text-[var(--tott-dash-gold-label)]">{t("management.headers.status")}</dt>
                          <dd className="text-xs font-medium" style={{ color: st.color }}>{st.label}</dd>
                        </div>
                      </dl>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Decorative chamfered bottom cap */}
          <ChamferedCap direction="bottom" />

          {/* Pagination — lives inside the panel below the table */}
          {filtered.length > 0 ? (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="text-gray-500">
                {t("management.pagination.showing", {
                  from: fromRow,
                  to: toRow,
                  total: filtered.length,
                })}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-4 py-2 text-gray-400 transition-colors hover:text-foreground disabled:opacity-40"
                >
                  {t("management.pagination.previous")}
                </button>
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-4 py-2 text-gray-400 transition-colors hover:text-foreground disabled:opacity-40"
                >
                  {t("management.pagination.next")}
                </button>
              </div>
            </div>
          ) : null}
        </ChamferedPanel>
      )}
    </>
  );
}

export function TripsManagementContent() {
  const t = useTranslations("Dashboard.trips");
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") === "archive" ? "archive" : "create";

  const setTab = useCallback(
    (tab: "create" | "archive") => {
      router.replace(tab === "archive" ? "/admin/trips?tab=archive" : "/admin/trips", { scroll: false });
    },
    [router],
  );

  const [previewTrip, setPreviewTrip] = useState<TripListItem | null>(null);

  const tripsQuery = useTrips();
  const trips = tripsQuery.data ?? [];
  const tripsLoading = tripsQuery.isFetching;
  const tripsError = tripsQuery.error
    ? errMessage(tripsQuery.error, t("editor.errors.requestFailed"), t("editor.errors.generic"))
    : null;

  const deleteMutation = useDeleteTrip();
  const deletingId = deleteMutation.isPending ? deleteMutation.variables : null;

  const handleDelete = useCallback(
    (id: string) => {
      deleteMutation.mutate(id);
    },
    [deleteMutation],
  );

  return (
    <div className="space-y-4">
      <TripPreviewModal
        open={previewTrip !== null}
        onClose={() => setPreviewTrip(null)}
        trip={previewTrip ?? undefined}
      />

      <div className="flex w-full gap-1 rounded-xl bg-[var(--tott-elevated)] p-1">
        <button
          type="button"
          onClick={() => setTab("create")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md py-3 text-sm font-medium transition-all ${
            activeTab === "create"
              ? "bg-[var(--tott-dash-control-bg)] text-foreground"
              : "bg-transparent text-[var(--tott-tab-inactive)] hover:text-[var(--tott-tab-inactive-hover)]"
          }`}
        >
          <PlusIcon />
          {t("management.tabs.create")}
        </button>
        <button
          type="button"
          onClick={() => setTab("archive")}
          className={`flex-1 rounded-md py-3 text-sm font-medium transition-all ${
            activeTab === "archive"
              ? "bg-[var(--tott-dash-control-bg)] text-foreground"
              : "bg-transparent text-[var(--tott-tab-inactive)] hover:text-[var(--tott-tab-inactive-hover)]"
          }`}
        >
          {t("management.tabs.archive")}
        </button>
      </div>

      <div className={activeTab === "create" ? "" : "hidden"}>
        <TripEditorLayout />
      </div>
      <div className={activeTab === "archive" ? "space-y-4" : "hidden"}>
        <ArchiveView
          trips={trips}
          loading={tripsLoading}
          error={tripsError}
          onRetry={() => void tripsQuery.refetch()}
          onDelete={(id) => void handleDelete(id)}
          deletingId={deletingId}
          onPreview={setPreviewTrip}
        />
      </div>
    </div>
  );
}

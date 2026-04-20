"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  AlertTriangleIcon,
  ClockIcon,
  EyeIcon,
  FlagIcon,
  MessageSquareIcon,
  SearchIcon,
  ShieldIcon,
} from "@/components/ui/icons";
import {
  sampleAuditLog,
  sampleReportedUsers,
  sampleReports,
  type AuditLogEntry,
  type ReportItem,
  type ReportedUserItem,
} from "@/lib/dashboard/reports-constants";

const AVATAR_GOLD = "#E8DDC0";

const REPORT_TAB_IDS = ["content", "users", "audit"] as const;
type ReportTabId = (typeof REPORT_TAB_IDS)[number];

const FILTER_IDS = ["all", "pending", "underReview"] as const;
type FilterId = (typeof FILTER_IDS)[number];

function reportStatusKey(status: ReportItem["status"] | ReportedUserItem["status"]): "pending" | "underReview" {
  return status === "Pending" ? "pending" : "underReview";
}

function reportTypeKey(label: ReportItem["typeLabel"]): "comment" | "content" {
  return label === "Comment" ? "comment" : "content";
}

export function ReportsContent() {
  const t = useTranslations("Dashboard.reportsPage");
  const [activeTab, setActiveTab] = useState<ReportTabId>("content");
  const [filter, setFilter] = useState<FilterId>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filteredReports = useMemo(() => {
    return sampleReports.filter((r) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.reporter.toLowerCase().includes(q);
      const matchesFilter =
        filter === "all" ||
        (filter === "pending" && r.status === "Pending") ||
        (filter === "underReview" && r.status === "Under review");
      return matchesQuery && matchesFilter;
    });
  }, [query, filter]);

  const selected = filteredReports.find((r) => r.id === selectedId) ?? null;

  return (
    <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
      <div className="rounded-2xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-6 lg:p-8">
        <div className="flex w-fit gap-1 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] p-1">
          {REPORT_TAB_IDS.map((tabId) => {
            const label =
              tabId === "content"
                ? t("tabs.content", { count: sampleReports.length })
                : tabId === "users"
                  ? t("tabs.users", { count: sampleReportedUsers.length })
                  : t("tabs.audit");
            return (
              <button
                key={tabId}
                type="button"
                onClick={() => setActiveTab(tabId)}
                className={`rounded-md px-5 py-2.5 text-sm font-medium transition-all ${
                  activeTab === tabId
                    ? "border border-[#4A4A4A] bg-[var(--tott-dash-control-bg)] text-foreground shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
                    : "border border-transparent bg-transparent text-[#AAAAAA] hover:text-[#E0E0E0]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {activeTab === "content" ? (
          <>
            <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#E8DDC0]">
                  <SearchIcon />
                </span>
                <input
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] py-2.5 pl-10 pr-4 text-sm text-foreground placeholder-gray-500 focus:border-[#555] focus:outline-none"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {FILTER_IDS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                      filter === f
                        ? "border-[#555] bg-[var(--tott-dash-control-bg)] text-foreground"
                        : "border-[var(--tott-card-border)] bg-transparent text-gray-400 hover:text-foreground"
                    }`}
                  >
                    {t(`filters.${f}`)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
              <div className="space-y-3">
                {filteredReports.map((report) => (
                  <ReportListCard
                    key={report.id}
                    report={report}
                    selected={selectedId === report.id}
                    onSelect={() => setSelectedId(report.id)}
                  />
                ))}
                {filteredReports.length === 0 && (
                  <p className="py-8 text-center text-sm text-gray-500">{t("emptyFiltered")}</p>
                )}
              </div>

              <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-[var(--tott-card-border)] bg-[#0f0f0f] px-6 py-12 text-center">
                {selected ? (
                  <div className="w-full max-w-md text-start">
                    <h3 className="text-lg font-semibold text-foreground">{selected.title}</h3>
                    <p className="mt-2 text-sm text-gray-500">{selected.timeAgo}</p>
                    <p className="mt-4 text-sm text-gray-400">
                      {t("reportedBy")} <span className="text-foreground">{selected.reporter}</span>
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-1 text-xs text-gray-300">
                        {t(`typeLabels.${reportTypeKey(selected.typeLabel)}`)}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          selected.status === "Pending"
                            ? "border border-amber-500/40 bg-amber-500/10 text-amber-400"
                            : "border border-blue-500/40 bg-blue-500/10 text-blue-400"
                        }`}
                      >
                        {t(`statusLabels.${reportStatusKey(selected.status)}`)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] text-[#E8DDC0]">
                      <FlagIcon />
                    </div>
                    <p className="mt-4 text-sm text-gray-500">{t("selectPrompt")}</p>
                  </>
                )}
              </div>
            </div>
          </>
        ) : activeTab === "users" ? (
          <div className="mt-6 space-y-3">
            {sampleReportedUsers.map((user) => (
              <ReportedUserCard key={user.id} user={user} />
            ))}
          </div>
        ) : (
          <AuditLogSection entries={sampleAuditLog} />
        )}
      </div>
    </div>
  );
}

/** Chamfered / “technical” card corners (clip-path). */
const AUDIT_CARD_CLIP =
  "polygon(11px 0, calc(100% - 11px) 0, 100% 11px, 100% calc(100% - 11px), calc(100% - 11px) 100%, 11px 100%, 0 calc(100% - 11px), 0 11px)";

function AuditLogSection({ entries }: { entries: AuditLogEntry[] }) {
  const t = useTranslations("Dashboard.reportsPage.audit");
  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold text-foreground sm:text-xl">{t("title")}</h2>
      <p className="mt-1 text-sm text-[#a0a0a0]">{t("subtitle")}</p>
      <div className="mt-6 space-y-3">
        {entries.map((entry) => (
          <AuditLogCard key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}

function AuditLogCard({ entry }: { entry: AuditLogEntry }) {
  return (
    <div
      className="flex items-center gap-4 px-4 py-4 sm:gap-5 sm:px-5 sm:py-4"
      style={{
        clipPath: AUDIT_CARD_CLIP,
        backgroundColor: "#1a1a1a",
        boxShadow: "inset 0 0 0 1px var(--tott-card-border)",
      }}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] text-[#E8DDC0]"
        aria-hidden
      >
        <span className="[&_svg]:h-[18px] [&_svg]:w-[18px]">
          <ShieldIcon />
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-foreground">{entry.title}</p>
        <p className="mt-0.5 text-sm text-[#a0a0a0]">{entry.meta}</p>
      </div>
      <p className="shrink-0 text-end text-sm text-[#a0a0a0]">{entry.timeAgo}</p>
    </div>
  );
}

function ReportedUserCard({ user }: { user: ReportedUserItem }) {
  const t = useTranslations("Dashboard.reportsPage");
  const tu = useTranslations("Dashboard.reportsPage.users");
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold text-[#111]"
          style={{ backgroundColor: AVATAR_GOLD }}
        >
          {user.avatarInitial}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-foreground">{user.displayName}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="text-[#E8DDC0] [&_svg]:h-3.5 [&_svg]:w-3.5">
                <FlagIcon />
              </span>
              {tu("reportsCount", { count: user.reportCount })}
            </span>
            <span className="hidden text-gray-600 sm:inline">·</span>
            <span>{user.reasonSummary}</span>
            <span className="hidden text-gray-600 sm:inline">·</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="text-[#E8DDC0] [&_svg]:h-3.5 [&_svg]:w-3.5">
                <ClockIcon />
              </span>
              {user.timeAgo}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 lg:shrink-0 lg:justify-end">
        <span className="rounded-full border border-amber-500/35 bg-[var(--tott-dash-input-bg)] px-3 py-1 text-xs font-medium text-amber-400">
          {t(`statusLabels.${reportStatusKey(user.status)}`)}
        </span>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--tott-dash-surface-inset)]"
        >
          <span className="text-[#E8DDC0] [&_svg]:h-4 [&_svg]:w-4">
            <EyeIcon />
          </span>
          {tu("viewProfile")}
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--tott-dash-surface-inset)]"
        >
          <span className="text-[#E8DDC0] [&_svg]:h-4 [&_svg]:w-4">
            <MessageSquareIcon />
          </span>
          {tu("warn")}
        </button>
        <button
          type="button"
          className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-[var(--tott-dash-surface-inset)]"
        >
          {tu("suspend")}
        </button>
      </div>
    </div>
  );
}

function ReportListCard({
  report,
  selected,
  onSelect,
}: {
  report: ReportItem;
  selected: boolean;
  onSelect: () => void;
}) {
  const t = useTranslations("Dashboard.reportsPage");
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-xl border px-4 py-4 text-start transition-colors ${
        selected
          ? "border-[#5a4a2a] bg-[#151515]"
          : "border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] hover:bg-[#151515]"
      }`}
    >
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] text-[#E8DDC0]">
          <AlertTriangleIcon />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{report.title}</p>
          <p className="mt-1 text-xs text-gray-500">{report.timeAgo}</p>
          <p className="mt-2 text-xs text-gray-400">
            {t("reportedBy")} <span className="text-gray-300">{report.reporter}</span>
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-2 py-0.5 text-[11px] text-gray-400">
              {t(`typeLabels.${reportTypeKey(report.typeLabel)}`)}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                report.status === "Pending"
                  ? "bg-amber-500/15 text-amber-400"
                  : "bg-blue-500/15 text-blue-400"
              }`}
            >
              {t(`statusLabels.${reportStatusKey(report.status)}`)}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

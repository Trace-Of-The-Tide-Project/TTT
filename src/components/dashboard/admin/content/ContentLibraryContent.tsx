"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { isAxiosError } from "axios";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  SearchIcon,
  FilterIcon,
  MoreDotsIcon,
  EyeIcon,
  MusicIcon,
  FilmIcon,
  CameraIcon,
  BookIcon,
  FileTextIcon,
  MicIcon,
} from "@/components/ui/icons";
import { FilterDropdown } from "@/components/dashboard/admin/users/FilterDropdown";
import { HexIconOutlined } from "@/components/dashboard/admin/articles/articles-create/HexIconOutlined";
import { AuthedContributionImage } from "@/components/dashboard/admin/content/AuthedContributionImage";
import { ChamferedPanel } from "@/components/ui/ChamferedPanel";
import {
  ChamferedTable,
  type ChamferedTableColumn,
} from "@/components/ui/ChamferedTable";
import {
  contributionFilePublicUrl,
  type ContributionFile,
  type ContributionListItem,
  type ContributionListMeta,
} from "@/services/contributions.service";
import { useContributions } from "@/hooks/queries/contributions";
import {
  useDeleteContribution,
  useUpdateContributionStatus,
} from "@/hooks/mutations/contributions";
import { formatApiError } from "@/lib/api/error-message";

const ROWS_PER_PAGE = 10;

/** Match image extensions when API omits image/* mime type. */
const CONTRIBUTION_IMAGE_EXT = /\.(jpe?g|png|gif|webp|avif|bmp|svg)(\?.*)?$/i;

function contributionFileRef(f: ContributionFile): string {
  const u = f.url?.trim();
  if (u) return u;
  return (f.path ?? "").trim();
}

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

type ContributionStatus = "all" | "pending" | "published" | "archived" | "rejected";

const TYPE_FILTER_ALL = "__all__";

const TAB_IDS: ContributionStatus[] = ["all", "published", "pending", "archived", "rejected"];

const statusColorMap: Record<string, string> = {
  published: "#2ECC71",
  pending: "#E67E22",
  archived: "#9CA3AF",
  rejected: "#ef4444",
  draft: "#3498DB",
};

function statusColor(status: string): string {
  return statusColorMap[status.toLowerCase()] ?? "#9CA3AF";
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}


function formatDate(iso: string | null, locale: string): string {
  if (!iso) return "—";
  const loc = locale.startsWith("ar") ? "ar" : "en-US";
  return new Date(iso).toLocaleDateString(loc, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ContentActionsDropdown({
  contentId,
  onAction,
}: {
  contentId: string;
  onAction?: (actionId: string, contentId: string) => void;
}) {
  const ta = useTranslations("Dashboard.contentLibrary.actions");
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="rounded p-1.5 transition-colors hover:bg-[var(--tott-dash-ghost-hover)]"
        style={{ color: "#A3A3A3" }}
        aria-label={ta("menuAria")}
        aria-expanded={isOpen}
      >
        <MoreDotsIcon />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full z-20 mt-1 min-w-[140px] rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] py-1 shadow-lg">
          {(
            [
              { id: "view", labelKey: "view" as const },
              { id: "archive", labelKey: "archive" as const },
              { id: "delete", labelKey: "delete" as const, destructive: true },
            ] as const
          ).map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => {
                onAction?.(action.id, contentId);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-[var(--tott-dash-surface-inset)] ${
                "destructive" in action && action.destructive
                  ? "text-red-400 hover:bg-red-500/10"
                  : "text-foreground"
              }`}
            >
              {ta(action.labelKey)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TypeIconInline({ typeName }: { typeName: string | null | undefined }) {
  const n = (typeName ?? "").toLowerCase();
  if (n.includes("music") || n.includes("audio")) return <MusicIcon />;
  if (n.includes("film") || n.includes("video")) return <FilmIcon />;
  if (n.includes("photo") || n.includes("image")) return <CameraIcon />;
  if (n.includes("story") || n.includes("personal")) return <BookIcon />;
  if (n.includes("podcast") || n.includes("oral")) return <MicIcon />;
  return <FileTextIcon />;
}

function ContributionDetailModal({
  item,
  onClose,
}: {
  item: ContributionListItem;
  onClose: () => void;
}) {
  const td = useTranslations("Dashboard.contentLibrary.detail");
  const ts = useTranslations("Dashboard.contentLibrary");
  const locale = useLocale();

  const statusText = (raw: string) => {
    const k = raw.trim().toLowerCase();
    if (["published", "pending", "archived", "rejected", "draft"].includes(k)) {
      return (ts as (key: string) => string)(`statusLabels.${k}`);
    }
    return capitalize(raw);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-md"
        onClick={onClose}
        aria-label={td("closeModalAria")}
      />

      <div
        className="relative flex max-h-[94vh] w-full max-w-[757px] flex-col overflow-hidden rounded-[20px] border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between border-b border-[var(--tott-card-border)] px-6 py-5">
          <div className="flex items-center gap-3">
            <HexIconOutlined size="sm">
              <TypeIconInline typeName={item.type?.name} />
            </HexIconOutlined>
            <div>
              <h2 className="text-base font-bold text-foreground">{item.title}</h2>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                {item.type?.name && <span>{item.type.name}</span>}
                <span
                  className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase"
                  style={{
                    backgroundColor: `${statusColor(item.status)}20`,
                    color: statusColor(item.status),
                  }}
                >
                  {statusText(item.status)}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-[var(--tott-dash-ghost-hover)] hover:text-foreground"
            aria-label={td("closeAria")}
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {/* Description */}
          {item.description && (
            <div>
              <h3 className="mb-1.5 text-xs font-semibold uppercase text-gray-500">{td("description")}</h3>
              <p className="text-sm leading-relaxed text-gray-300">{item.description}</p>
            </div>
          )}

          {/* Info grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoCard label={td("labelContributor")} value={item.user?.full_name ?? item.contributor_name ?? "—"} />
            <InfoCard label={td("labelEmail")} value={item.user?.email ?? item.contributor_email ?? "—"} />
            <InfoCard label={td("labelPhone")} value={item.phone_number ?? item.contributor_phone ?? "—"} />
            <InfoCard label={td("labelSubmitted")} value={formatDate(item.submission_date, locale)} />
            <InfoCard
              label={td("labelConsent")}
              value={item.consent_given ? td("consentYes") : td("consentNo")}
            />
            {item.open_call_id && (
              <InfoCard label={td("labelOpenCall")} value={item.open_call_id.slice(0, 8) + "…"} />
            )}
          </div>

          {/* Files */}
          {(item.files ?? []).length > 0 && (
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase text-gray-500">
                {td("filesHeading", { count: (item.files ?? []).length })}
              </h3>
              <div className="space-y-2">
                {(item.files ?? []).map((f) => {
                  const ref = contributionFileRef(f);
                  const isImage =
                    (f.mime_type ?? "").startsWith("image/") ||
                    CONTRIBUTION_IMAGE_EXT.test(`${f.file_name ?? ""} ${f.path ?? ""} ${f.url ?? ""}`);
                  const isAudio = (f.mime_type ?? "").startsWith("audio/");
                  const isVideo = (f.mime_type ?? "").startsWith("video/");
                  const fileUrl = contributionFilePublicUrl(ref);

                  return (
                    <div
                      key={f.id}
                      className="overflow-hidden rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-2)]"
                    >
                      {isImage && ref && (
                        <div className="relative w-full bg-black/30">
                          <AuthedContributionImage
                            path={ref}
                            alt={f.file_name}
                            className="max-h-64 w-full object-contain"
                          />
                        </div>
                      )}
                      {isAudio && (
                        <div className="px-4 pt-3">
                          <audio controls className="w-full" preload="metadata">
                            <source src={fileUrl} type={f.mime_type} />
                          </audio>
                        </div>
                      )}
                      {isVideo && (
                        <div className="relative w-full bg-black/30">
                          <video
                            controls
                            className="max-h-64 w-full"
                            preload="metadata"
                          >
                            <source src={fileUrl} type={f.mime_type} />
                          </video>
                        </div>
                      )}
                      <div className="flex items-center justify-between px-4 py-2.5">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">{f.file_name}</p>
                          <p className="text-[11px] text-gray-500">
                            {f.mime_type} &middot; {formatFileSize(f.file_size)}
                            {f.duration ? ` \u00b7 ${f.duration}` : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Collections */}
          {item.collections.length > 0 && (
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase text-gray-500">
                {td("collectionsHeading", { count: item.collections.length })}
              </h3>
              <div className="flex flex-wrap gap-2">
                {item.collections.map((c) => (
                  <span
                    key={c.id}
                    className="rounded-full border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-1 text-xs text-gray-300"
                  >
                    {c.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 justify-end border-t border-[var(--tott-card-border)] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-6 py-2 text-sm font-medium text-gray-300 transition-colors hover:border-gray-500 hover:text-foreground"
          >
            {td("close")}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-2)] px-3 py-2">
      <span className="text-[10px] font-medium uppercase text-gray-500">{label}</span>
      <p className="mt-0.5 truncate text-sm text-foreground">{value}</p>
    </div>
  );
}

export function ContentLibraryContent() {
  const t = useTranslations("Dashboard.contentLibrary");
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<ContributionStatus>("all");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState(TYPE_FILTER_ALL);

  const [page, setPage] = useState(1);
  const [previewItem, setPreviewItem] = useState<ContributionListItem | null>(null);

  // Advanced (popover) filters — applied client-side on top of the
  // status tab + type pill + search box. Backend list endpoint doesn't
  // support these fields yet, so we filter the visible page.
  const [advFilterSubmittedAfter, setAdvFilterSubmittedAfter] = useState("");
  const [advFilterCollection, setAdvFilterCollection] = useState("");
  const [advFilterHasFiles, setAdvFilterHasFiles] = useState(false);

  const contributionsQuery = useContributions(page, ROWS_PER_PAGE);
  const items: ContributionListItem[] = contributionsQuery.data?.items ?? [];
  const meta: ContributionListMeta | null = contributionsQuery.data?.meta ?? null;
  const loading = contributionsQuery.isFetching;
  const error = contributionsQuery.error
    ? errMessage(contributionsQuery.error, t("errors.requestFailed"), t("errors.generic"))
    : null;

  const typeOptions = useMemo(() => {
    const types = new Set<string>();
    items.forEach((i) => {
      if (i.type?.name) types.add(i.type.name);
    });
    return [
      { value: TYPE_FILTER_ALL, label: t("allTypes") },
      ...Array.from(types)
        .sort()
        .map((ty) => ({ value: ty, label: ty })),
    ];
  }, [items, t]);

  const filtered = useMemo(() => {
    const submittedAfterMs = advFilterSubmittedAfter.trim()
      ? new Date(advFilterSubmittedAfter).getTime()
      : null;
    const collectionNeedle = advFilterCollection.trim().toLowerCase();
    return items.filter((item) => {
      const matchesTab =
        activeTab === "all" || item.status.toLowerCase() === activeTab;
      const matchesSearch =
        !search.trim() ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        (item.description ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (item.user?.full_name ?? "").toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === TYPE_FILTER_ALL || item.type?.name === typeFilter;
      const matchesSubmittedAfter =
        submittedAfterMs == null ||
        Number.isNaN(submittedAfterMs) ||
        (item.submission_date != null &&
          new Date(item.submission_date).getTime() >= submittedAfterMs);
      const matchesCollection =
        !collectionNeedle ||
        item.collections.some((c) => c.name.toLowerCase().includes(collectionNeedle));
      const matchesHasFiles = !advFilterHasFiles || (item.files ?? []).length > 0;
      return (
        matchesTab &&
        matchesSearch &&
        matchesType &&
        matchesSubmittedAfter &&
        matchesCollection &&
        matchesHasFiles
      );
    });
  }, [
    items,
    activeTab,
    search,
    typeFilter,
    advFilterSubmittedAfter,
    advFilterCollection,
    advFilterHasFiles,
  ]);

  const tabButtons = useMemo(
    () =>
      TAB_IDS.map((id) => ({
        id,
        label: (t as (key: string) => string)(`tabs.${id}`),
      })),
    [t],
  );

  const statusLabel = (raw: string) => {
    const k = raw.trim().toLowerCase();
    if (["published", "pending", "archived", "rejected", "draft"].includes(k)) {
      return (t as (key: string) => string)(`statusLabels.${k}`);
    }
    return capitalize(raw);
  };

  const totalPages = meta?.totalPages ?? 1;

  const archiveMutation = useUpdateContributionStatus();
  const deleteMutation = useDeleteContribution();

  const handleRowAction = useCallback(
    (actionId: string, contentId: string) => {
      const item = items.find((i) => i.id === contentId);
      if (!item) return;
      if (actionId === "view") {
        setPreviewItem(item);
        return;
      }
      if (actionId === "archive") {
        archiveMutation.mutate(
          { id: contentId, status: "archived" },
          {
            onSuccess: () => toast.success(`Archived "${item.title}"`),
            onError: (e) => toast.error(formatApiError(e, "Failed to archive")),
          },
        );
        return;
      }
      if (actionId === "delete") {
        const ok = window.confirm(
          `Delete "${item.title}"? This cannot be undone.`,
        );
        if (!ok) return;
        deleteMutation.mutate(contentId, {
          onSuccess: () => toast.success(`Deleted "${item.title}"`),
          onError: (e) => toast.error(formatApiError(e, "Failed to delete")),
        });
      }
    },
    [items, archiveMutation, deleteMutation],
  );

  return (
    <div className="space-y-6 px-3 py-4 sm:px-4 sm:py-6">
      {previewItem && (
        <ContributionDetailModal
          item={previewItem}
          onClose={() => setPreviewItem(null)}
        />
      )}

      {/* Tabs */}
      <div className="flex flex-col gap-1 rounded-xl bg-[var(--tott-elevated)] p-1 sm:w-fit sm:flex-row">
        {tabButtons.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap rounded-md px-4 py-2.5 text-sm font-medium transition-all sm:px-6 sm:py-3 ${
              activeTab === tab.id
                ? "bg-[var(--tott-dash-control-bg)] text-foreground"
                : "bg-transparent text-[var(--tott-tab-inactive)] hover:text-[var(--tott-tab-inactive-hover)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <ChamferedPanel className="px-4 py-4 sm:px-6 sm:py-5">
      <div className="space-y-6">
      {/* Search and filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="relative max-w-md flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] py-2.5 pl-10 pr-4 text-sm text-foreground placeholder-gray-500 focus:border-[#555] focus:outline-none"
          />
        </div>
        <div className="flex items-center justify-center gap-2">
          <FilterDropdown
            options={typeOptions}
            value={typeFilter}
            onChange={setTypeFilter}
          />
          <ContentAdvancedFilterPopover
            submittedAfter={advFilterSubmittedAfter}
            onSubmittedAfterChange={setAdvFilterSubmittedAfter}
            collection={advFilterCollection}
            onCollectionChange={setAdvFilterCollection}
            hasFiles={advFilterHasFiles}
            onHasFilesChange={setAdvFilterHasFiles}
            label={t("filterAria")}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-200">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => void contributionsQuery.refetch()}
            className="mt-2 text-xs font-medium text-amber-400 underline hover:text-amber-300"
          >
            {t("tryAgain")}
          </button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="rounded-xl border border-[var(--tott-card-border)] px-5 py-16 text-center text-sm text-gray-500">
          {t("loading")}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-[var(--tott-card-border)] px-5 py-16 text-center text-sm text-gray-500">
          {search.trim() || activeTab !== "all" ? t("emptyFiltered") : t("emptyNone")}
        </div>
      ) : (
        <>
          {/* Card layout — small screens */}
          <div className="space-y-3 lg:hidden">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-2)] p-4"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">{item.title}</p>
                    {item.description && (
                      <p className="mt-0.5 whitespace-pre-wrap break-words text-xs text-gray-500">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPreviewItem(item)}
                      className="rounded p-1.5 text-gray-500 transition-colors hover:text-foreground"
                      aria-label={t("table.viewItemAria", { title: item.title })}
                    >
                      <EyeIcon />
                    </button>
                    <ContentActionsDropdown contentId={item.id} onAction={handleRowAction} />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                  {item.type?.name && <span>{item.type.name}</span>}
                  <span>{item.user?.full_name ?? item.contributor_name ?? "—"}</span>
                  <span
                    className="font-medium"
                    style={{ color: statusColor(item.status) }}
                  >
                    {statusLabel(item.status)}
                  </span>
                  {(item.files ?? []).length > 0 && (
                    <span>{t("table.fileCount", { count: (item.files ?? []).length })}</span>
                  )}
                  <span>{formatDate(item.submission_date, locale)}</span>
                </div>
                {item.collections.length > 0 && (
                  <p className="mt-2 text-xs text-gray-500">
                    <span className="font-semibold text-gray-400">{t("table.collection")}: </span>
                    {item.collections.map((c) => c.name).join(", ")}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Table layout — large screens. The inner band is fluid: columns
              are sized in `fr` units so they always sum to the panel's
              available width, and every cell has `min-w-0` so `truncate`
              actually works when a row's text is longer than its column. */}
          <div className="hidden lg:block">
            {(() => {
              const headerCellClass =
                "px-3 py-3 flex items-center min-w-0 text-xs font-semibold text-[var(--tott-dash-gold-label)]";
              const cellBase = "px-3 py-3 flex items-center min-w-0 text-sm";
              const columns: ChamferedTableColumn<ContributionListItem>[] = [
                {
                  key: "title",
                  header: t("table.title"),
                  width: "1.5fr",
                  headerClassName: headerCellClass,
                  cellClassName: cellBase,
                  cell: (item) => (
                    <span
                      className="min-w-0 truncate font-medium text-foreground"
                      title={item.title}
                    >
                      {item.title}
                    </span>
                  ),
                },
                {
                  key: "type",
                  header: t("table.type"),
                  width: "1fr",
                  headerClassName: `${headerCellClass} whitespace-nowrap`,
                  cellClassName: `${cellBase} text-gray-400`,
                  cell: (item) => (
                    <span className="min-w-0 truncate" title={item.type?.name ?? ""}>
                      {item.type?.name ?? "—"}
                    </span>
                  ),
                },
                {
                  key: "contributor",
                  header: t("table.contributor"),
                  width: "1.2fr",
                  headerClassName: headerCellClass,
                  cellClassName: `${cellBase} text-gray-400`,
                  cell: (item) => {
                    const text =
                      item.user?.full_name ?? item.contributor_name ?? "—";
                    return (
                      <span className="min-w-0 truncate" title={text}>
                        {text}
                      </span>
                    );
                  },
                },
                {
                  key: "status",
                  header: t("table.status"),
                  width: "0.8fr",
                  headerClassName: `${headerCellClass} whitespace-nowrap`,
                  cellClassName: `${cellBase} whitespace-nowrap`,
                  cell: (item) => (
                    <span
                      className="text-xs font-medium"
                      style={{ color: statusColor(item.status) }}
                    >
                      {statusLabel(item.status)}
                    </span>
                  ),
                },
                {
                  key: "files",
                  header: t("table.files"),
                  width: "0.7fr",
                  headerClassName: `${headerCellClass} whitespace-nowrap`,
                  cellClassName: `${cellBase} whitespace-nowrap text-gray-400`,
                  cell: (item) =>
                    (item.files ?? []).length > 0
                      ? t("table.fileCount", { count: (item.files ?? []).length })
                      : "—",
                },
                {
                  key: "collection",
                  header: t("table.collection"),
                  width: "1.2fr",
                  headerClassName: headerCellClass,
                  cellClassName: `${cellBase} text-gray-400`,
                  cell: (item) => {
                    const text =
                      item.collections.length > 0
                        ? item.collections.map((c) => c.name).join(", ")
                        : "—";
                    return (
                      <span className="min-w-0 truncate" title={text}>
                        {text}
                      </span>
                    );
                  },
                },
                {
                  key: "submitted",
                  header: t("table.submitted"),
                  width: "1fr",
                  headerClassName: `${headerCellClass} whitespace-nowrap`,
                  cellClassName: `${cellBase} whitespace-nowrap text-gray-400`,
                  cell: (item) => formatDate(item.submission_date, locale),
                },
                {
                  key: "actions",
                  header: "",
                  width: "5rem",
                  headerClassName: headerCellClass,
                  cellClassName: "px-3 py-3 flex items-center justify-end min-w-0",
                  cell: (item) => (
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setPreviewItem(item)}
                        className="rounded p-1.5 text-gray-500 transition-colors hover:text-foreground"
                        aria-label={t("table.viewItemAria", { title: item.title })}
                      >
                        <EyeIcon />
                      </button>
                      <ContentActionsDropdown contentId={item.id} onAction={handleRowAction} />
                    </div>
                  ),
                },
              ];
              return (
                <ChamferedTable
                  className="w-full"
                  columns={columns}
                  rows={filtered}
                  rowKey={(item) => item.id}
                />
              );
            })()}
          </div>
        </>
      )}

      {/* Pagination */}
      {!loading && meta && meta.total > 0 && (
        <div className="flex flex-col items-center gap-3 text-sm sm:flex-row sm:justify-between">
          <span className="text-gray-500">
            {t("pagination.summary", { page, totalPages, total: meta.total })}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-4 py-2 text-gray-400 transition-colors hover:text-foreground disabled:opacity-40"
            >
              {t("pagination.previous")}
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-4 py-2 text-gray-400 transition-colors hover:text-foreground disabled:opacity-40"
            >
              {t("pagination.next")}
            </button>
          </div>
        </div>
      )}
      </div>
      </ChamferedPanel>
    </div>
  );
}

/**
 * "Premium" multi-condition filter popover for the Content Library.
 * Trigger is the FilterIcon button; click opens a panel with content-
 * specific filter conditions (submitted-after date, collection name,
 * has-files toggle). The active filter count shows as a badge on the
 * trigger.
 */
function ContentAdvancedFilterPopover({
  submittedAfter,
  onSubmittedAfterChange,
  collection,
  onCollectionChange,
  hasFiles,
  onHasFilesChange,
  label,
}: {
  submittedAfter: string;
  onSubmittedAfterChange: (v: string) => void;
  collection: string;
  onCollectionChange: (v: string) => void;
  hasFiles: boolean;
  onHasFilesChange: (v: boolean) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const activeCount =
    (submittedAfter.trim() ? 1 : 0) +
    (collection.trim() ? 1 : 0) +
    (hasFiles ? 1 : 0);

  const clearAll = () => {
    onSubmittedAfterChange("");
    onCollectionChange("");
    onHasFilesChange(false);
  };

  const inputClass =
    "w-full rounded-md border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] px-3 py-2 text-sm text-foreground placeholder:text-[var(--tott-muted)] focus:border-[var(--tott-muted)] focus:outline-none";

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={label}
        title={label}
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] text-gray-400 transition-colors hover:bg-[var(--tott-dash-surface-inset)] hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--tott-muted)]"
      >
        <FilterIcon />
        {activeCount > 0 ? (
          <span
            aria-hidden
            className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold"
            style={{
              backgroundColor: "var(--tott-dark-pill)",
              color: "var(--tott-dark-pill-fg)",
            }}
          >
            {activeCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label={label}
          className="absolute right-0 top-full z-30 mt-2 w-80 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-2)] p-4 shadow-lg"
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Filters</p>
            {activeCount > 0 ? (
              <button
                type="button"
                onClick={clearAll}
                className="text-xs font-medium text-[var(--tott-muted)] transition-colors hover:text-foreground"
              >
                Clear all
              </button>
            ) : null}
          </div>

          <div className="mb-3 flex flex-col gap-1.5">
            <label className="text-[11px] font-medium uppercase tracking-wide text-[var(--tott-dash-gold-label)]">
              Submitted after
            </label>
            <input
              type="date"
              value={submittedAfter}
              onChange={(e) => onSubmittedAfterChange(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="mb-3 flex flex-col gap-1.5">
            <label className="text-[11px] font-medium uppercase tracking-wide text-[var(--tott-dash-gold-label)]">
              Collection contains
            </label>
            <input
              type="text"
              value={collection}
              onChange={(e) => onCollectionChange(e.target.value)}
              placeholder="e.g. Heritage 2025"
              className={inputClass}
            />
          </div>

          <div className="mb-3 flex flex-col gap-1.5">
            <label className="flex cursor-pointer items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-[var(--tott-dash-gold-label)]">
              <input
                type="checkbox"
                checked={hasFiles}
                onChange={(e) => onHasFilesChange(e.target.checked)}
                className="h-4 w-4 rounded border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)]"
              />
              <span>Only entries with files</span>
            </label>
          </div>

          <div className="mt-1 flex justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-[var(--tott-dash-control-hover)]"
            >
              Done
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

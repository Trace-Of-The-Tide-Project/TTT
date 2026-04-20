"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isAxiosError } from "axios";
import { useLocale, useTranslations } from "next-intl";
import { theme } from "@/lib/theme";
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
import {
  contributionFilePublicUrl,
  getContributions,
  type ContributionFile,
  type ContributionListItem,
  type ContributionListMeta,
} from "@/services/contributions.service";

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label={td("closeModalAria")}
      />

      <div
        className="relative mx-2 flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] shadow-2xl sm:mx-4 sm:max-h-[85vh]"
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
    </div>
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

  const [items, setItems] = useState<ContributionListItem[]>([]);
  const [meta, setMeta] = useState<ContributionListMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [previewItem, setPreviewItem] = useState<ContributionListItem | null>(null);
  const loadedPagesRef = useRef<Set<number>>(new Set());

  const fetchData = useCallback(
    async (p: number, force = false) => {
      if (!force && loadedPagesRef.current.has(p)) return;
      setLoading(true);
      setError(null);
      try {
        const res = await getContributions(p, ROWS_PER_PAGE);
        setItems(res.items);
        setMeta(res.meta);
        loadedPagesRef.current.add(p);
      } catch (e) {
        setError(errMessage(e, t("errors.requestFailed"), t("errors.generic")));
      } finally {
        setLoading(false);
      }
    },
    [t],
  );

  useEffect(() => {
    void fetchData(page);
  }, [page, fetchData]);

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
    return items.filter((item) => {
      const matchesTab =
        activeTab === "all" || item.status.toLowerCase() === activeTab;
      const matchesSearch =
        !search.trim() ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        (item.description ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (item.user?.full_name ?? "").toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === TYPE_FILTER_ALL || item.type?.name === typeFilter;
      return matchesTab && matchesSearch && matchesType;
    });
  }, [items, activeTab, search, typeFilter]);

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

  return (
    <div className="space-y-6 px-3 py-4 sm:px-4 sm:py-6">
      {previewItem && (
        <ContributionDetailModal
          item={previewItem}
          onClose={() => setPreviewItem(null)}
        />
      )}

      {/* Tabs */}
      <div className="flex flex-col gap-1 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] p-1 sm:w-fit sm:flex-row">
        {tabButtons.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap rounded-md px-4 py-2.5 text-sm font-medium transition-all sm:px-6 sm:py-3 ${
              activeTab === tab.id
                ? "border border-[#4A4A4A] bg-[var(--tott-dash-control-bg)] text-foreground shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
                : "border border-transparent bg-transparent text-[#AAAAAA] hover:text-[#E0E0E0]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

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
          <button
            type="button"
            className="flex items-center justify-center rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] p-2.5 text-gray-400 transition-colors hover:bg-[var(--tott-dash-surface-inset)] hover:text-foreground"
            aria-label={t("filterAria")}
          >
            <FilterIcon />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-200">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => void fetchData(page, true)}
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
                    <ContentActionsDropdown contentId={item.id} />
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

          {/* Table layout — large screens (horizontal scroll keeps all columns + full text visible) */}
          <div className="hidden overflow-x-auto rounded-xl border border-[var(--tott-card-border)] lg:block">
            <table className="w-full min-w-[56rem] border-collapse text-start text-sm">
              <thead>
                <tr className="border-b border-[var(--tott-card-border)]">
                  <th className="min-w-[12rem] px-3 py-3 text-xs font-semibold" style={{ color: theme.accentGoldFocus }}>
                    {t("table.title")}
                  </th>
                  <th className="whitespace-nowrap px-2 py-3 text-xs font-semibold" style={{ color: theme.accentGoldFocus }}>
                    {t("table.type")}
                  </th>
                  <th className="min-w-[8rem] px-2 py-3 text-xs font-semibold" style={{ color: theme.accentGoldFocus }}>
                    {t("table.contributor")}
                  </th>
                  <th className="whitespace-nowrap px-2 py-3 text-xs font-semibold" style={{ color: theme.accentGoldFocus }}>
                    {t("table.status")}
                  </th>
                  <th className="whitespace-nowrap px-2 py-3 text-xs font-semibold" style={{ color: theme.accentGoldFocus }}>
                    {t("table.files")}
                  </th>
                  <th className="min-w-[10rem] px-2 py-3 text-xs font-semibold" style={{ color: theme.accentGoldFocus }}>
                    {t("table.collection")}
                  </th>
                  <th className="whitespace-nowrap px-2 py-3 text-xs font-semibold" style={{ color: theme.accentGoldFocus }}>
                    {t("table.submitted")}
                  </th>
                  <th className="w-16 px-2 py-3" aria-hidden />
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-[var(--tott-card-border)] transition-colors last:border-b-0"
                  >
                    <td className="align-top px-3 py-3">
                      <span className="block break-words font-medium text-foreground">
                        {item.title}
                      </span>
                      {item.description && (
                        <span className="mt-1 block whitespace-pre-wrap break-words text-xs text-gray-500">
                          {item.description}
                        </span>
                      )}
                    </td>
                    <td className="align-top whitespace-nowrap px-2 py-3 text-gray-400">
                      {item.type?.name ?? "—"}
                    </td>
                    <td className="align-top break-words px-2 py-3 text-gray-400">
                      {item.user?.full_name ?? item.contributor_name ?? "—"}
                    </td>
                    <td className="align-top whitespace-nowrap px-2 py-3">
                      <span
                        className="text-xs font-medium"
                        style={{ color: statusColor(item.status) }}
                      >
                        {statusLabel(item.status)}
                      </span>
                    </td>
                    <td className="align-top whitespace-nowrap px-2 py-3 text-gray-400">
                      {(item.files ?? []).length > 0 ? t("table.fileCount", { count: (item.files ?? []).length }) : "—"}
                    </td>
                    <td className="align-top break-words px-2 py-3 text-gray-400">
                      {item.collections.length > 0
                        ? item.collections.map((c) => c.name).join(", ")
                        : "—"}
                    </td>
                    <td className="align-top whitespace-nowrap px-2 py-3 text-gray-400">
                      {formatDate(item.submission_date, locale)}
                    </td>
                    <td className="align-top whitespace-nowrap px-2 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setPreviewItem(item)}
                          className="rounded p-1.5 text-gray-500 transition-colors hover:text-foreground"
                          aria-label={t("table.viewItemAria", { title: item.title })}
                        >
                          <EyeIcon />
                        </button>
                        <ContentActionsDropdown contentId={item.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
  );
}

"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { formatArticleListDate } from "@/lib/dashboard/map-articles-list";
import { useSearchParams } from "next/navigation";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { normalizeAppPathname } from "@/lib/i18n/strip-locale-from-path";
import { PlusIcon, MoreDotsIcon } from "@/components/ui/icons";
import { ConfirmDeleteArticleModal } from "@/components/dashboard/admin/articles/articles-editor/modals/ConfirmDeleteArticleModal";
import { useDeleteArticle } from "@/hooks/mutations/articles";
import { previewHrefForContentType } from "@/lib/content/public-article-preview-href";
import { formatApiError } from "@/lib/api/error-message";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";
import {
  ChamferedTable,
  type ChamferedTableColumn,
} from "@/components/ui/ChamferedTable";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import {
  CreatePageFilters,
  type FilterOption,
} from "@/components/dashboard/admin/articles/articles-create/CreatePageFilters";

type Tab = { id: string; labelKey: string };

export type ArticleRow = {
  id: string;
  slug: string;
  title: string;
  content_type: string;
  /** BCP-47 language code, e.g. "en", "ar", "es", "fr" */
  language: string;
  /** Normalized lifecycle key for filtering and i18n labels */
  status: "draft" | "published" | "scheduled";
  statusColor: string;
  /** ISO timestamp for locale-aware relative formatting in the table */
  updatedAtIso: string;
  views: string;
  supporters: string;
};

type ArticlesTableProps = {
  tabs: readonly Tab[];
  rows: ArticleRow[];
  addNewHref?: string;
  /** Update list after a row is deleted (e.g. remove locally; no refetch). */
  onArticleDeleted?: (articleId: string) => void | Promise<void>;
};

const statusColorMap: Record<string, string> = {
  emerald: "var(--tott-status-emerald)",
  blue: "var(--tott-status-blue)",
  coral: "var(--tott-status-coral)",
};

const TAB_TO_STATUS: Record<string, ArticleRow["status"] | null> = {
  all: null,
  drafts: "draft",
  published: "published",
  scheduled: "scheduled",
};

// Canonical type-filter ids in display order. Unknown types are appended after.
const TYPE_FILTER_ORDER = [
  "article",
  "video",
  "audio",
  "thread",
  "artwork",
  "open-call",
] as const;

// Filter id -> `create.templates.<key>` label key. (open-call uses a camelCase key.)
const FILTER_ID_TO_TEMPLATE_KEY: Record<string, string> = {
  article: "article",
  video: "video",
  audio: "audio",
  thread: "thread",
  artwork: "artwork",
  "open-call": "openCall",
};

/**
 * Normalize a raw API `content_type` to a stable filter id. Mirrors the
 * normalizer in content-form-config.ts (`contentFormConfigForType`): lowercase
 * and treat dashes/underscores the same. Keeps `open-call` kebab so it matches
 * TYPE_FILTER_ORDER; FILTER_ID_TO_TEMPLATE_KEY bridges to the `openCall` key.
 */
function contentTypeToFilterId(raw: string | undefined): string {
  const t = (raw || "article").toLowerCase().replace(/-/g, "_");
  if (t === "video") return "video";
  if (t === "audio") return "audio";
  if (t === "thread") return "thread";
  if (t === "artwork") return "artwork";
  if (t === "open_call" || t === "opencall") return "open-call";
  if (t === "article") return "article";
  // Unknown type: keep a stable kebab id derived from the raw value.
  return t.replace(/_/g, "-");
}

/** Title-cased fallback label for an unknown type that has no template key. */
function fallbackTypeLabel(filterId: string): string {
  return filterId
    .split("-")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

const ARTICLE_MENU_WIDTH_PX = 160;

function menuCoordsFromAnchor(anchor: HTMLElement) {
  const r = anchor.getBoundingClientRect();
  const left = Math.min(
    Math.max(8, r.right - ARTICLE_MENU_WIDTH_PX),
    window.innerWidth - ARTICLE_MENU_WIDTH_PX - 8,
  );
  return { top: r.bottom + 4, left };
}

export function ArticlesTable({
  tabs,
  rows,
  addNewHref = "/admin/articles/create",
  onArticleDeleted,
}: ArticlesTableProps) {
  const t = useTranslations("Dashboard.articles.list");
  const tType = useTranslations("Dashboard.articles.create.templates");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const defaultTab = tabs[0]?.id ?? "all";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [activeType, setActiveType] = useState("all");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ArticleRow | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const deleteMutation = useDeleteArticle({ silent: true });
  const deleteBusy = deleteMutation.isPending;

  // Sync the active tab to the `?tab=` query param. Render-phase
  // prev-value pattern instead of an effect.
  const urlTab = searchParams.get("tab");
  const [prevUrlTab, setPrevUrlTab] = useState(urlTab);
  if (urlTab !== prevUrlTab) {
    setPrevUrlTab(urlTab);
    if (urlTab && tabs.some((t) => t.id === urlTab)) {
      setActiveTab(urlTab);
    }
  }

  const selectTab = useCallback(
    (tabId: string) => {
      setActiveTab(tabId);
      const params = new URLSearchParams(searchParams.toString());
      if (tabId === defaultTab) {
        params.delete("tab");
      } else {
        params.set("tab", tabId);
      }
      const q = params.toString();
      const base = normalizeAppPathname(pathname) ?? pathname ?? "/admin/articles";
      router.replace(q ? `${base}?${q}` : base, { scroll: false });
    },
    [defaultTab, pathname, router, searchParams]
  );

  // Type-filter chips, derived from the content types actually present in the
  // rows. "All" first, then canonical-ordered known types, then any unknown
  // types in first-seen order. Empty filters never appear.
  const typeOptions = useMemo<FilterOption[]>(() => {
    const present = new Set<string>();
    for (const r of rows) present.add(contentTypeToFilterId(r.content_type));
    const ordered: string[] = TYPE_FILTER_ORDER.filter((id) => present.has(id));
    for (const r of rows) {
      const id = contentTypeToFilterId(r.content_type);
      if (
        !TYPE_FILTER_ORDER.includes(id as (typeof TYPE_FILTER_ORDER)[number]) &&
        !ordered.includes(id)
      ) {
        ordered.push(id);
      }
    }
    const labelFor = (id: string): string => {
      const key = FILTER_ID_TO_TEMPLATE_KEY[id];
      return key ? tType(`${key}.title`) : fallbackTypeLabel(id);
    };
    return [
      { id: "all", label: t("tabs.all") },
      ...ordered.map((id) => ({ id, label: labelFor(id) })),
    ];
  }, [rows, t, tType]);

  // Sync the active type to the `?type=` query param. Render-phase prev-value
  // pattern (mirrors the `?tab=` sync). Validated against the derived options
  // so an invalid deep-link is ignored.
  const urlType = searchParams.get("type");
  const [prevUrlType, setPrevUrlType] = useState(urlType);
  if (urlType !== prevUrlType) {
    setPrevUrlType(urlType);
    if (urlType && typeOptions.some((o) => o.id === urlType)) {
      setActiveType(urlType);
    }
  }

  const selectType = useCallback(
    (typeId: string) => {
      setActiveType(typeId);
      const params = new URLSearchParams(searchParams.toString());
      if (typeId === "all") {
        params.delete("type");
      } else {
        params.set("type", typeId);
      }
      const q = params.toString();
      const base = normalizeAppPathname(pathname) ?? pathname ?? "/admin/articles";
      router.replace(q ? `${base}?${q}` : base, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const filteredRows = useMemo(() => {
    const wantStatus = TAB_TO_STATUS[activeTab];
    return rows.filter((r) => {
      if (wantStatus && r.status !== wantStatus) return false;
      if (activeType !== "all" && contentTypeToFilterId(r.content_type) !== activeType) {
        return false;
      }
      return true;
    });
  }, [rows, activeTab, activeType]);

  const rowsWithRelativeTime = useMemo(
    () =>
      filteredRows.map((row) => ({
        ...row,
        relativeUpdated: formatArticleListDate(row.updatedAtIso, locale, t("table.justNow")),
      })),
    [filteredRows, locale, t],
  );

  useLayoutEffect(() => {
    if (openMenuId == null) return;
    const reposition = () => {
      const safe = openMenuId.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
      const el = document.querySelector(
        `[data-article-menu-trigger="${safe}"]`,
      ) as HTMLElement | null;
      if (!el) {
        setOpenMenuId(null);
        setMenuPosition(null);
        return;
      }
      setMenuPosition(menuCoordsFromAnchor(el));
    };
    reposition();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [openMenuId]);

  useEffect(() => {
    if (openMenuId == null) return;
    const onDown = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest("[data-article-actions-menu]")) return;
      const wrap = el.closest("[data-article-actions]");
      if (wrap?.getAttribute("data-article-actions") === openMenuId) return;
      setOpenMenuId(null);
      setMenuPosition(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [openMenuId]);

  const openMenuRow = useMemo(
    () => (openMenuId ? rows.find((r) => r.id === openMenuId) ?? null : null),
    [openMenuId, rows],
  );

  // Close the open row menu if the row it points at vanishes (e.g.
  // delete). Render-phase pattern instead of an effect.
  if (openMenuId && !openMenuRow) {
    setOpenMenuId(null);
    setMenuPosition(null);
  }

  const openDeleteModal = useCallback((row: ArticleRow) => {
    setDeleteError(null);
    setDeleteTarget(row);
    setOpenMenuId(null);
    setMenuPosition(null);
  }, []);

  const closeArticleMenu = useCallback(() => {
    setOpenMenuId(null);
    setMenuPosition(null);
  }, []);

  const toggleArticleMenu = useCallback((row: ArticleRow, anchor: HTMLElement) => {
    if (openMenuId === row.id) {
      closeArticleMenu();
      return;
    }
    setMenuPosition(menuCoordsFromAnchor(anchor));
    setOpenMenuId(row.id);
  }, [openMenuId, closeArticleMenu]);

  const closeDeleteModal = useCallback(() => {
    if (deleteBusy) return;
    setDeleteTarget(null);
    setDeleteError(null);
  }, [deleteBusy]);

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    setDeleteError(null);
    const id = deleteTarget.id;
    deleteMutation.mutate(id, {
      onSuccess: async () => {
        setDeleteTarget(null);
        await onArticleDeleted?.(id);
      },
      onError: (e) => {
        setDeleteError(formatApiError(e, t("errors.deleteFailed")));
      },
    });
  }, [deleteTarget, onArticleDeleted, t, deleteMutation]);

  return (
    <div>
      {openMenuRow && menuPosition != null && typeof document !== "undefined"
        ? createPortal(
            <div
              data-article-actions-menu
              className="fixed z-300 min-w-[160px] bg-[var(--tott-dash-surface)] shadow-lg"
              style={{ top: menuPosition.top, left: menuPosition.left }}
            >
              <ChamferedFrame size={12} />
              <ul
                id={`article-actions-${openMenuRow.id}`}
                className="relative py-2"
                role="menu"
                aria-label={t("table.menuAriaFor", { title: openMenuRow.title })}
              >
                <li role="none">
                  <Link
                    role="menuitem"
                    href={previewHrefForContentType(openMenuRow.content_type, openMenuRow.id)}
                    className="block px-4 py-2 text-sm text-gray-200 transition-colors hover:bg-[var(--tott-dash-ghost-hover)] hover:text-foreground"
                    onClick={closeArticleMenu}
                  >
                    {t("table.preview")}
                  </Link>
                </li>
                <li role="none">
                  <Link
                    role="menuitem"
                    href={`/admin/articles/edit/${encodeURIComponent(openMenuRow.id)}`}
                    className="block px-4 py-2 text-sm text-gray-200 transition-colors hover:bg-[var(--tott-dash-ghost-hover)] hover:text-foreground"
                    onClick={closeArticleMenu}
                  >
                    {t("table.edit")}
                  </Link>
                </li>
                <li role="none">
                  <button
                    type="button"
                    role="menuitem"
                    className="w-full px-4 py-2 text-start text-sm text-red-300 transition-colors hover:bg-red-950/40 hover:text-red-200"
                    disabled={deleteBusy && deleteTarget?.id === openMenuRow.id}
                    onClick={() => openDeleteModal(openMenuRow)}
                  >
                    {t("table.delete")}
                  </button>
                </li>
              </ul>
            </div>,
            document.body,
          )
        : null}

      <ConfirmDeleteArticleModal
        open={deleteTarget != null}
        articleTitle={deleteTarget?.title ?? ""}
        busy={deleteBusy}
        error={deleteError}
        onClose={closeDeleteModal}
        onConfirm={() => void confirmDelete()}
      />
      <SegmentedControl
        className="mb-4"
        options={tabs.map((tab) => ({ id: tab.id, label: t(`tabs.${tab.labelKey}`) }))}
        value={activeTab}
        onChange={selectTab}
      />

      {/* Type filter chips — only shown when there are 2+ real types. */}
      {typeOptions.length > 2 ? (
        <CreatePageFilters
          options={typeOptions}
          selectedId={activeType}
          onSelect={selectType}
          variant="outlined"
        />
      ) : null}

      <div className="mt-4 flex w-full">
        <Link
          href={addNewHref}
          className="ms-auto flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors"
          style={{ color: "var(--tott-dash-gold-label)" }}
        >
          <PlusIcon />
          {t("table.addNew")}
        </Link>
      </div>

      {/* Table — chamfered caps + rectangular rows pattern */}
      {(() => {
        const headerCellClass =
          "px-5 py-3 flex items-center text-start align-middle text-xs font-semibold text-[var(--tott-dash-gold-label)]";
        const bodyCellBase =
          "px-5 py-3 flex items-center text-start align-middle text-sm font-medium";
        const columns: ChamferedTableColumn<typeof rowsWithRelativeTime[number]>[] = [
          {
            key: "title",
            header: t("table.title"),
            width: "32%",
            headerClassName: headerCellClass,
            cellClassName: bodyCellBase,
            cell: (row) => (
              <span className="flex items-center gap-2">
                <span style={{ color: "var(--tott-dash-gold-text)" }}>{row.title}</span>
                {row.language && row.language !== "en" ? (
                  <span className="shrink-0 rounded bg-[var(--tott-elevated)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    {row.language}
                  </span>
                ) : null}
              </span>
            ),
          },
          {
            key: "status",
            header: t("table.status"),
            width: "14%",
            headerClassName: headerCellClass,
            cellClassName: bodyCellBase,
            cell: (row) => (
              <span style={{ color: statusColorMap[row.statusColor] ?? "var(--tott-muted)" }}>
                {t(`table.statusValues.${row.status}`)}
              </span>
            ),
          },
          {
            key: "lastUpdated",
            header: t("table.lastUpdated"),
            width: "20%",
            headerClassName: `${headerCellClass} whitespace-nowrap`,
            cellClassName: `${bodyCellBase} whitespace-nowrap text-[var(--tott-muted)]`,
            cell: (row) => row.relativeUpdated,
          },
          {
            key: "views",
            header: t("table.views"),
            width: "12%",
            headerClassName: headerCellClass,
            cellClassName: `${bodyCellBase} tabular-nums text-[var(--tott-muted)]`,
            cell: (row) => row.views,
          },
          {
            key: "supporters",
            header: t("table.supporters"),
            width: "12%",
            headerClassName: headerCellClass,
            cellClassName: `${bodyCellBase} tabular-nums text-[var(--tott-muted)]`,
            cell: (row) => row.supporters,
          },
          {
            key: "actions",
            header: "",
            width: "10%",
            headerClassName: headerCellClass,
            cellClassName: "flex items-center justify-end px-4 py-3",
            cell: (row) => (
              <span data-article-actions={row.id}>
                <button
                  type="button"
                  data-article-menu-trigger={row.id}
                  className="p-1.5 transition-colors hover:bg-[var(--tott-dash-ghost-hover)] disabled:opacity-40"
                  style={{ color: "var(--tott-muted)" }}
                  aria-label={t("table.menuAria")}
                  aria-expanded={openMenuId === row.id}
                  aria-haspopup="menu"
                  aria-controls={
                    openMenuId === row.id ? `article-actions-${row.id}` : undefined
                  }
                  id={`article-actions-trigger-${row.id}`}
                  disabled={deleteBusy && deleteTarget?.id === row.id}
                  onClick={(e) => toggleArticleMenu(row, e.currentTarget)}
                >
                  <MoreDotsIcon />
                </button>
              </span>
            ),
          },
        ];
        return (
          <ChamferedTable
            columns={columns}
            rows={rowsWithRelativeTime}
            rowKey={(row) => row.id}
            emptyLabel={t("table.emptyView")}
          />
        );
      })()}
    </div>
  );
}

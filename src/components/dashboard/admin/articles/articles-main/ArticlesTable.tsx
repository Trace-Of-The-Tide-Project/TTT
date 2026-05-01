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

type Tab = { id: string; labelKey: string };

export type ArticleRow = {
  id: string;
  slug: string;
  title: string;
  content_type: string;
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
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const defaultTab = tabs[0]?.id ?? "all";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ArticleRow | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const deleteMutation = useDeleteArticle({ silent: true });
  const deleteBusy = deleteMutation.isPending;

  useEffect(() => {
    const fromUrl = searchParams.get("tab");
    if (fromUrl && tabs.some((t) => t.id === fromUrl)) {
      setActiveTab(fromUrl);
    }
  }, [searchParams, tabs]);

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

  const filteredRows = useMemo(() => {
    const want = TAB_TO_STATUS[activeTab];
    if (!want) return rows;
    return rows.filter((r) => r.status === want);
  }, [rows, activeTab]);

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

  useEffect(() => {
    if (openMenuId && !openMenuRow) {
      setOpenMenuId(null);
      setMenuPosition(null);
    }
  }, [openMenuId, openMenuRow]);

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
              <ChamferedFrame />
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
      {/* Tabs - segment control */}
      <div className="relative mb-4 flex w-full gap-1 p-2">
        <ChamferedFrame />
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => selectTab(tab.id)}
            className={`relative flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "text-foreground"
                : "text-[var(--tott-tab-inactive)] hover:text-[var(--tott-tab-inactive-hover)]"
            }`}
          >
            {activeTab === tab.id ? <ChamferedFrame size={14} /> : null}
            <span className="relative">{t(`tabs.${tab.labelKey}`)}</span>
          </button>
        ))}
      </div>

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

      {/* Table */}
      <div className="relative">
        <ChamferedFrame />
        <div className="overflow-x-auto px-1 py-1">
        <table className="w-full border-collapse text-start text-sm">
          <thead>
            <tr className="border-b border-[var(--tott-card-border)]">
              <th
                className="bg-transparent px-5 py-2 text-start align-middle text-xs font-semibold"
                style={{ color: "var(--tott-dash-gold-label)" }}
              >
                {t("table.title")}
              </th>
              <th
                className="bg-transparent px-4 py-2 text-start align-middle text-xs font-semibold"
                style={{ color: "var(--tott-dash-gold-label)" }}
              >
                {t("table.status")}
              </th>
              <th
                className="bg-transparent whitespace-nowrap px-4 py-2 text-start align-middle text-xs font-semibold"
                style={{ color: "var(--tott-dash-gold-label)" }}
              >
                {t("table.lastUpdated")}
              </th>
              <th
                className="bg-transparent px-4 py-2 text-start align-middle text-xs font-semibold"
                style={{ color: "var(--tott-dash-gold-label)" }}
              >
                {t("table.views")}
              </th>
              <th
                className="bg-transparent px-4 py-2 text-start align-middle text-xs font-semibold"
                style={{ color: "var(--tott-dash-gold-label)" }}
              >
                {t("table.supporters")}
              </th>
              <th className="w-10 px-4 py-2 align-middle" aria-hidden />
            </tr>
          </thead>
          <tbody>
            {rowsWithRelativeTime.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center text-sm text-gray-500"
                >
                  {t("table.emptyView")}
                </td>
              </tr>
            ) : (
              rowsWithRelativeTime.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-[var(--tott-card-border)] last:border-b-0 transition-colors"
                >
                  <td
                    className="px-5 py-3 text-start align-middle font-medium"
                    style={{ color: "var(--tott-dash-gold-text)" }}
                  >
                    {row.title}
                  </td>
                  <td
                    className="px-4 py-3 text-start align-middle"
                    style={{ color: statusColorMap[row.statusColor] ?? "#9ca3af" }}
                  >
                    {t(`table.statusValues.${row.status}`)}
                  </td>
                  <td
                    className="whitespace-nowrap px-4 py-3 text-start align-middle font-medium"
                    style={{ color: "var(--tott-muted)" }}
                  >
                    {row.relativeUpdated}
                  </td>
                  <td
                    className="px-4 py-3 text-start align-middle font-medium tabular-nums"
                    style={{ color: "var(--tott-muted)" }}
                  >
                    {row.views}
                  </td>
                  <td
                    className="px-4 py-3 text-start align-middle font-medium tabular-nums"
                    style={{ color: "var(--tott-muted)" }}
                  >
                    {row.supporters}
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="flex justify-end" data-article-actions={row.id}>
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
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { formatApiError } from "@/lib/api/error-message";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ChevronDownIcon, FolderIcon } from "@/components/ui/icons";
import { useMediaFolders, useMediaAssets } from "@/hooks/queries/media-library";
import {
  useRunMediaScan,
  useCreateMediaFolder,
  useUpdateMediaFolder,
  useDeleteMediaFolder,
  useBulkDeleteMediaAssets,
} from "@/hooks/mutations/media-library";
import {
  downloadMediaAssetsZip,
  type MediaAsset,
  type MediaFolder,
} from "@/services/media-library.service";
import { FolderTree } from "./FolderTree";
import { AssetGrid } from "./AssetGrid";
import { AssetDetailsModal } from "./AssetDetailsModal";
import { UploadDropzone } from "./UploadDropzone";
import { MoveToFolderModal } from "./MoveToFolderModal";
import { PageHeroesTab } from "./PageHeroesTab";

type FolderModalState =
  | { type: "closed" }
  | { type: "create"; parentId: string | null }
  | { type: "rename"; folder: MediaFolder };

const secondaryButtonClass =
  "rounded-lg border border-[var(--tott-card-border)] px-4 py-2 text-sm font-medium text-foreground disabled:opacity-50";

/** Mirrors the backend's DownloadZipDto cap (dto/bulk.dto.ts MAX_ZIP_ASSETS). */
const MAX_ZIP_ASSETS = 50;

export function MediaLibraryContent() {
  const t = useTranslations("Dashboard.mediaLibrary");

  const [topTab, setTopTab] = useState<"library" | "heroes">("library");
  const [mobileFoldersOpen, setMobileFoldersOpen] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [scope, setScope] = useState<"all" | "main" | "magazine">("all");
  const [unusedOnly, setUnusedOnly] = useState(false);
  const [imagesOnly, setImagesOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [openAsset, setOpenAsset] = useState<MediaAsset | null>(null);
  const [folderModal, setFolderModal] = useState<FolderModalState>({ type: "closed" });
  const [folderNameInput, setFolderNameInput] = useState("");
  const [deletingFolder, setDeletingFolder] = useState<MediaFolder | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);

  // Selecting across a folder/filter/page change is confusing (ids you can no
  // longer see) — start fresh whenever the visible set changes.
  useEffect(() => {
    setSelectedIds(new Set());
  }, [selectedFolderId, search, scope, unusedOnly, imagesOnly, page]);

  const foldersQuery = useMediaFolders();
  const selectedFolderName = selectedFolderId
    ? (foldersQuery.data?.find((f) => f.id === selectedFolderId)?.name ?? t("folders.root"))
    : t("folders.root");
  const assetsQuery = useMediaAssets({
    folder_id: selectedFolderId ?? undefined,
    search: search || undefined,
    unused: unusedOnly || undefined,
    images_only: imagesOnly || undefined,
    scope: scope === "all" ? undefined : scope,
    page,
    limit: 24,
  });
  const scanMutation = useRunMediaScan();
  const createFolderMutation = useCreateMediaFolder();
  const updateFolderMutation = useUpdateMediaFolder();
  const deleteFolderMutation = useDeleteMediaFolder();
  const bulkDeleteMutation = useBulkDeleteMediaAssets();

  const hasActiveFilters = !!search || unusedOnly || imagesOnly || scope !== "all";

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    const pageIds = (assetsQuery.data?.assets ?? []).map((a) => a.id);
    const allSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
    setSelectedIds(allSelected ? new Set() : new Set(pageIds));
  }

  async function handleDownloadZip() {
    if (selectedIds.size > MAX_ZIP_ASSETS) {
      toast.error(t("bulk.zipTooMany"));
      return;
    }
    const toastId = toast.loading(t("bulk.zip"));
    try {
      await downloadMediaAssetsZip([...selectedIds]);
      toast.dismiss(toastId);
    } catch (err) {
      toast.error(formatApiError(err, t("bulk.zip")), { id: toastId });
    }
  }

  async function handleBulkDelete() {
    try {
      const result = await bulkDeleteMutation.mutateAsync({ assetIds: [...selectedIds] });
      if (result.blocked.length > 0) {
        toast.error(
          t("bulk.partialBlocked", { blocked: result.blocked.length, total: selectedIds.size }),
        );
      } else {
        toast.success(t("bulk.deleted"));
      }
      setSelectedIds(new Set());
    } catch (err) {
      toast.error(formatApiError(err, t("bulk.deleted")));
    } finally {
      setBulkDeleteConfirmOpen(false);
    }
  }

  function clearFilters() {
    setSearch("");
    setUnusedOnly(false);
    setImagesOnly(false);
    setScope("all");
    setPage(1);
  }

  async function handleRescan() {
    const toastId = toast.loading(t("rescanning"));
    try {
      const result = await scanMutation.mutateAsync();
      toast.success(t("rescanDone", { count: result.assets_created }), { id: toastId });
    } catch (err) {
      toast.error(formatApiError(err, t("upload.failed")), { id: toastId });
    }
  }

  async function handleSaveFolder() {
    try {
      if (folderModal.type === "create") {
        await createFolderMutation.mutateAsync({
          name: folderNameInput,
          parent_id: folderModal.parentId ?? undefined,
        });
        toast.success(t("folders.created"));
      } else if (folderModal.type === "rename") {
        await updateFolderMutation.mutateAsync({
          id: folderModal.folder.id,
          patch: { name: folderNameInput },
        });
        toast.success(t("folders.updated"));
      }
      setFolderModal({ type: "closed" });
    } catch (err) {
      // No generic "save failed" key in this slice; reuse the same
      // last-resort fallback the rescan handler above uses.
      toast.error(formatApiError(err, t("upload.failed")));
    }
  }

  function handleDeleteFolder() {
    if (!deletingFolder) return;
    const id = deletingFolder.id;
    deleteFolderMutation.mutate(id, {
      onSuccess: () => {
        toast.success(t("folders.deleted"));
        if (selectedFolderId === id) setSelectedFolderId(null);
        setDeletingFolder(null);
      },
      onError: (err) => toast.error(formatApiError(err, t("folders.notEmpty"))),
    });
  }

  return (
    <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">{t("title")}</h1>
        <p className="mt-1 text-sm text-[var(--tott-muted)]">{t("subtitle")}</p>
      </div>

      <SegmentedControl
        options={[
          { id: "library", label: t("libraryTab") },
          { id: "heroes", label: t("heroes.tab") },
        ]}
        value={topTab}
        onChange={setTopTab}
        className="w-auto"
      />

      {topTab === "heroes" ? (
        <PageHeroesTab />
      ) : (
        <>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder={t("searchPlaceholder")}
          className="min-w-0 flex-1 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] px-4 py-2 text-sm text-foreground placeholder:text-[var(--tott-muted)]"
        />
        <button type="button" onClick={handleRescan} className={secondaryButtonClass}>
          {t("rescan")}
        </button>
        <SegmentedControl
          options={[
            { id: "all", label: t("filters.all") },
            { id: "main", label: t("filters.main") },
            { id: "magazine", label: t("filters.magazine") },
          ]}
          value={scope}
          onChange={(id) => {
            setScope(id);
            setPage(1);
          }}
          className="w-auto"
          ariaLabel={t("filters.scope")}
        />
        <button
          type="button"
          onClick={() => {
            setUnusedOnly((v) => !v);
            setPage(1);
          }}
          className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
            unusedOnly
              ? "border-transparent text-[var(--tott-on-accent)]"
              : "border-[var(--tott-card-border)] text-[var(--tott-muted)]"
          }`}
          style={unusedOnly ? { backgroundColor: "var(--tott-stat-icon)" } : undefined}
        >
          {t("filters.unused")}
        </button>
        <button
          type="button"
          onClick={() => {
            setImagesOnly((v) => !v);
            setPage(1);
          }}
          className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
            imagesOnly
              ? "border-transparent text-[var(--tott-on-accent)]"
              : "border-[var(--tott-card-border)] text-[var(--tott-muted)]"
          }`}
          style={imagesOnly ? { backgroundColor: "var(--tott-stat-icon)" } : undefined}
        >
          {t("filters.imagesOnly")}
        </button>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm font-medium text-[var(--tott-muted)] hover:text-foreground"
          >
            {t("filters.clear")}
          </button>
        )}
      </div>

      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-4 py-3">
          <span className="text-sm font-medium text-foreground">
            {t("select.selectedCount", { count: selectedIds.size })}
          </span>
          <button
            type="button"
            onClick={toggleSelectAll}
            className="text-sm font-medium text-[var(--tott-muted)] hover:text-foreground"
          >
            {t("select.selectAll")}
          </button>
          <button
            type="button"
            onClick={() => setSelectedIds(new Set())}
            className="text-sm font-medium text-[var(--tott-muted)] hover:text-foreground"
          >
            {t("select.clear")}
          </button>
          <div className="ms-auto flex items-center gap-2">
            <button type="button" onClick={() => setMoveModalOpen(true)} className={secondaryButtonClass}>
              {t("bulk.move")}
            </button>
            <button type="button" onClick={handleDownloadZip} className={secondaryButtonClass}>
              {t("bulk.zip")}
            </button>
            <button
              type="button"
              onClick={() => setBulkDeleteConfirmOpen(true)}
              className="rounded-lg border border-red-900/60 bg-red-950/50 px-4 py-2 text-sm font-medium text-red-200"
            >
              {t("bulk.delete")}
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        <div className="w-full shrink-0 lg:w-64">
          <button
            type="button"
            onClick={() => setMobileFoldersOpen((v) => !v)}
            className="mb-2 flex w-full items-center justify-between gap-2 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-4 py-2 text-sm font-medium text-foreground lg:hidden"
          >
            <span className="flex min-w-0 items-center gap-2">
              <FolderIcon />
              <span className="truncate">{selectedFolderName}</span>
            </span>
            <span
              className={`inline-block shrink-0 transition-transform ${mobileFoldersOpen ? "rotate-180" : ""}`}
            >
              <ChevronDownIcon />
            </span>
          </button>
          <div className={`${mobileFoldersOpen ? "block" : "hidden"} lg:block`}>
          <FolderTree
            folders={foldersQuery.data ?? []}
            selectedFolderId={selectedFolderId}
            onSelect={(id) => {
              setSelectedFolderId(id);
              setPage(1);
            }}
            onCreateFolder={(parentId) => {
              setFolderNameInput("");
              setFolderModal({ type: "create", parentId });
            }}
            onRenameFolder={(folder) => {
              setFolderNameInput(folder.name);
              setFolderModal({ type: "rename", folder });
            }}
            onDeleteFolder={setDeletingFolder}
          />
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-6">
          <UploadDropzone folderId={selectedFolderId} />
          <AssetGrid
            assets={assetsQuery.data?.assets ?? []}
            loading={assetsQuery.isLoading}
            selectedIds={selectedIds}
            selectable
            onToggleSelect={toggleSelect}
            onOpen={setOpenAsset}
            emptyLabel={hasActiveFilters ? t("emptyFiltered") : t("empty")}
          />
          {assetsQuery.data && assetsQuery.data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className={secondaryButtonClass}
              >
                {t("pagination.previous")}
              </button>
              <span className="text-sm text-[var(--tott-muted)]">
                {t("pagination.pageOf", { page, totalPages: assetsQuery.data.meta.totalPages })}
              </span>
              <button
                type="button"
                disabled={page >= assetsQuery.data.meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className={secondaryButtonClass}
              >
                {t("pagination.next")}
              </button>
            </div>
          )}
        </div>
      </div>

      <AssetDetailsModal asset={openAsset} onClose={() => setOpenAsset(null)} />

      <Modal
        open={folderModal.type !== "closed"}
        title={folderModal.type === "create" ? t("folders.createTitle") : t("folders.renameTitle")}
        onClose={() => setFolderModal({ type: "closed" })}
        footer={
          <button
            type="button"
            onClick={handleSaveFolder}
            className="rounded-lg px-4 py-2 text-sm font-semibold"
            style={{ backgroundColor: "var(--tott-stat-icon)", color: "var(--tott-on-accent)" }}
          >
            {t("folders.rename")}
          </button>
        }
      >
        <input
          value={folderNameInput}
          onChange={(e) => setFolderNameInput(e.target.value)}
          placeholder={t("folders.namePlaceholder")}
          className="w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] px-4 py-2 text-sm text-foreground"
        />
      </Modal>

      <ConfirmDialog
        open={!!deletingFolder}
        title={t("folders.deleteConfirmTitle")}
        description={t("folders.deleteConfirmDescription")}
        destructive
        confirmLabel={t("folders.delete")}
        busy={deleteFolderMutation.isPending}
        onClose={() => setDeletingFolder(null)}
        onConfirm={handleDeleteFolder}
      />

      <MoveToFolderModal
        open={moveModalOpen}
        assetIds={[...selectedIds]}
        onClose={() => setMoveModalOpen(false)}
      />

      <ConfirmDialog
        open={bulkDeleteConfirmOpen}
        title={t("bulk.deleteConfirmTitle", { count: selectedIds.size })}
        description={t("bulk.deleteConfirmDescription")}
        destructive
        confirmLabel={t("bulk.delete")}
        busy={bulkDeleteMutation.isPending}
        onClose={() => setBulkDeleteConfirmOpen(false)}
        onConfirm={handleBulkDelete}
      />
        </>
      )}
    </div>
  );
}

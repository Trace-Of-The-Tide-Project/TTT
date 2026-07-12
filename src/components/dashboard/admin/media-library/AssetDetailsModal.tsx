"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FilmIcon, MusicIcon, FileTextIcon } from "@/components/ui/icons";
import { formatBytes } from "@/lib/format-bytes";
import { mutationToast } from "@/hooks/useMutationToast";
import {
  getMediaDownloadUrl,
  copyMediaShareLink,
  MediaAssetInUseError,
  type MediaAsset,
} from "@/services/media-library.service";
import { useUpdateMediaAsset, useDeleteMediaAsset } from "@/hooks/mutations/media-library";

interface AssetDetailsModalProps {
  asset: MediaAsset | null;
  onClose: () => void;
}

export function AssetDetailsModal(props: AssetDetailsModalProps) {
  const t = useTranslations("Dashboard.mediaLibrary");

  if (!props.asset) return null;
  const asset = props.asset;

  return <AssetDetailsModalContent asset={asset} onClose={props.onClose} t={t} />;
}

function AssetDetailsModalContent({
  asset,
  onClose,
  t,
}: {
  asset: MediaAsset;
  onClose: () => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const [fileName, setFileName] = useState(asset.file_name);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [blockedUsages, setBlockedUsages] = useState<string[] | null>(null);
  const updateMutation = useUpdateMediaAsset();
  const deleteMutation = useDeleteMediaAsset();

  async function handleRename() {
    try {
      await mutationToast(
        () => updateMutation.mutateAsync({ id: asset.id, patch: { file_name: fileName } }),
        { loading: `${t("asset.rename")}…`, success: t("asset.renameSaved") },
      );
    } catch {
      // mutationToast already showed the error toast.
    }
  }

  async function handleDelete() {
    try {
      await mutationToast(() => deleteMutation.mutateAsync({ id: asset.id }), {
        loading: `${t("asset.delete")}…`,
        success: t("asset.deleted"),
      });
      setConfirmOpen(false);
      onClose();
    } catch (err) {
      setConfirmOpen(false);
      if (err instanceof MediaAssetInUseError) {
        setBlockedUsages(err.usages);
      }
    }
  }

  async function handleForceDelete() {
    try {
      await mutationToast(() => deleteMutation.mutateAsync({ id: asset.id, force: true }), {
        loading: `${t("asset.forceDelete")}…`,
        success: t("asset.deleted"),
      });
      setBlockedUsages(null);
      onClose();
    } catch {
      // mutationToast already showed the error toast.
    }
  }

  async function handleDownload() {
    const url = await getMediaDownloadUrl(asset.id);
    const a = document.createElement("a");
    a.href = url;
    a.download = asset.file_name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async function handleCopyLink() {
    await copyMediaShareLink(asset.id);
    toast.success(t("share.copied"));
  }

  const isImage = asset.mime_type?.startsWith("image/") && asset.url;
  const isVideo = asset.mime_type?.startsWith("video/");
  const isAudio = asset.mime_type?.startsWith("audio/");

  const modal = (
    <Modal
      open
      title={t("asset.detailsTitle")}
      maxWidthClassName="max-w-2xl"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={handleCopyLink}
            className="rounded-lg border border-[var(--tott-card-border)] px-4 py-2 text-sm font-medium text-foreground"
          >
            {t("share.copyLink")}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="rounded-lg border border-[var(--tott-card-border)] px-4 py-2 text-sm font-medium text-foreground"
          >
            {t("asset.download")}
          </button>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="rounded-lg border border-red-900/60 bg-red-950/50 px-4 py-2 text-sm font-medium text-red-200"
          >
            {t("asset.delete")}
          </button>
        </>
      }
    >
      <div className="mb-4 flex max-h-80 w-full items-center justify-center overflow-hidden rounded-lg bg-[var(--tott-dash-surface-inset)]">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={asset.url ?? undefined} alt="" loading="lazy" className="max-h-80 w-full object-contain" />
        ) : isVideo ? (
          <FilmIcon />
        ) : isAudio ? (
          <MusicIcon />
        ) : (
          <FileTextIcon />
        )}
      </div>

      <div className="mb-4 flex items-end gap-2">
        <label className="flex-1">
          <span className="mb-1 block text-xs font-medium text-[var(--tott-muted)]">
            {t("asset.name")}
          </span>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] px-3 py-2 text-sm text-foreground"
          />
        </label>
        {fileName !== asset.file_name ? (
          <button
            type="button"
            onClick={handleRename}
            disabled={updateMutation.isPending}
            style={{ backgroundColor: "var(--tott-stat-icon)" }}
            className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--tott-on-accent)] disabled:opacity-50"
          >
            {t("asset.rename")}
          </button>
        ) : null}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-[var(--tott-muted)]">{t("asset.size")}</span>
          <span className="text-foreground">{formatBytes(asset.size_bytes)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-[var(--tott-muted)]">{t("asset.dimensions")}</span>
          <span className="text-foreground">
            {asset.width && asset.width > 0 && asset.height
              ? `${asset.width}×${asset.height}`
              : "—"}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-[var(--tott-muted)]">{t("asset.uploaded")}</span>
          <span className="text-foreground">
            {new Date(asset.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div>
          <span className="mb-1 block text-[var(--tott-muted)]">{t("asset.usages")}</span>
          {asset.usages.length === 0 ? (
            <span className="text-foreground">{t("asset.noUsages")}</span>
          ) : (
            <div className="flex flex-wrap gap-2">
              {asset.usages.map((u) => (
                <span
                  key={u.id}
                  className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] px-2 py-1 text-xs text-foreground"
                >
                  {u.entity_type}.{u.field}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );

  const firstConfirmDialog = (
    <ConfirmDialog
      open={confirmOpen}
      title={t("asset.deleteConfirmTitle")}
      description={t("asset.deleteConfirmDescription")}
      destructive
      confirmLabel={t("asset.delete")}
      busy={deleteMutation.isPending}
      onClose={() => setConfirmOpen(false)}
      onConfirm={handleDelete}
    />
  );

  const secondConfirmDialog = (
    <ConfirmDialog
      open={blockedUsages !== null}
      title={t("asset.deleteBlockedTitle")}
      description={`${t("asset.deleteBlockedDescription")} ${(blockedUsages ?? []).join(", ")}`}
      destructive
      confirmLabel={t("asset.forceDelete")}
      busy={deleteMutation.isPending}
      onClose={() => setBlockedUsages(null)}
      onConfirm={handleForceDelete}
    />
  );

  return (
    <>
      {modal}
      {firstConfirmDialog}
      {secondConfirmDialog}
    </>
  );
}

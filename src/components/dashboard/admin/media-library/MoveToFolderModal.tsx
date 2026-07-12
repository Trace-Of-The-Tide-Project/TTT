"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/Modal";
import { FolderTree } from "./FolderTree";
import { useMediaFolders } from "@/hooks/queries/media-library";
import { useBulkMoveMediaAssets } from "@/hooks/mutations/media-library";
import { mutationToast } from "@/hooks/useMutationToast";

export interface MoveToFolderModalProps {
  open: boolean;
  assetIds: string[];
  onClose: () => void;
}

export function MoveToFolderModal(props: MoveToFolderModalProps) {
  const t = useTranslations("Dashboard.mediaLibrary");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const foldersQuery = useMediaFolders();
  const moveMutation = useBulkMoveMediaAssets();

  async function handleMove() {
    try {
      await mutationToast(
        () => moveMutation.mutateAsync({ assetIds: props.assetIds, folderId: selectedFolderId }),
        { loading: `${t("bulk.move")}…`, success: t("bulk.moved") },
      );
      props.onClose();
    } catch {
      // mutationToast already showed the error toast.
    }
  }

  return (
    <Modal
      open={props.open}
      title={t("bulk.moveTitle")}
      onClose={props.onClose}
      busy={moveMutation.isPending}
      footer={
        <button
          type="button"
          onClick={handleMove}
          disabled={moveMutation.isPending}
          style={{ backgroundColor: "var(--tott-stat-icon)" }}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-[var(--tott-on-accent)] disabled:opacity-50"
        >
          {t("bulk.move")}
        </button>
      }
    >
      <FolderTree
        folders={foldersQuery.data ?? []}
        selectedFolderId={selectedFolderId}
        onSelect={setSelectedFolderId}
      />
    </Modal>
  );
}

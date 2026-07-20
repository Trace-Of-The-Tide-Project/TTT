"use client";

import { useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/Modal";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { CloudUploadIcon } from "@/components/ui/icons";
import { useQueryClient } from "@tanstack/react-query";
import { AssetGrid } from "./AssetGrid";
import { mediaLibraryKeys, useMediaAssets } from "@/hooks/queries/media-library";
import {
  uploadToMediaLibrary,
  type MediaAsset,
} from "@/services/media-library.service";

export interface HeroPickerModalProps {
  open: boolean;
  onClose: () => void;
  /** Caller performs the actual updatePageHero mutation + its own toast. */
  onPick: (storageKey: string) => void;
  /** Overrides the modal title. Defaults to the page-hero picker copy. */
  title?: string;
  /** Restricts the library tab to images only. Defaults to true. */
  images_only?: boolean;
  /** Tab to land on each time the modal opens. Defaults to the library. Let
   * a caller with its own "Upload" button open straight onto the upload tab. */
  initialMode?: PickerMode;
}

type PickerMode = "library" | "upload";

export function HeroPickerModal(props: HeroPickerModalProps) {
  const t = useTranslations("Dashboard.mediaLibrary");
  const initialMode = props.initialMode ?? "library";
  const [mode, setMode] = useState<PickerMode>(initialMode);
  const imagesOnly = props.images_only ?? true;

  // The modal stays mounted while closed, so without this it would reopen on
  // whichever tab was last used and ignore the button the admin just clicked.
  // Adjusting during render (not in an effect) per the codebase's React 19 rule.
  const [prevOpen, setPrevOpen] = useState(props.open);
  if (prevOpen !== props.open) {
    setPrevOpen(props.open);
    if (props.open) setMode(initialMode);
  }

  const handlePick = (storageKey: string) => {
    props.onPick(storageKey);
    props.onClose();
  };

  return (
    <Modal
      open={props.open}
      title={props.title ?? t("heroes.pickerTitle")}
      onClose={props.onClose}
      maxWidthClassName="max-w-3xl"
    >
      <SegmentedControl
        options={[
          { id: "library", label: t("heroes.pickFromLibrary") },
          { id: "upload", label: t("heroes.uploadNew") },
        ]}
        value={mode}
        onChange={setMode}
        className="mb-4"
      />
      {mode === "library" ? (
        <LibraryPicker onPick={handlePick} imagesOnly={imagesOnly} />
      ) : (
        <UploadPicker onPick={handlePick} accept={imagesOnly ? "image/*" : undefined} />
      )}
    </Modal>
  );
}

function LibraryPicker({
  onPick,
  imagesOnly,
}: {
  onPick: (storageKey: string) => void;
  imagesOnly: boolean;
}) {
  const t = useTranslations("Dashboard.mediaLibrary");
  const assetsQuery = useMediaAssets({ images_only: imagesOnly, limit: 60 });

  return (
    <div className="max-h-[50vh] overflow-y-auto">
      <AssetGrid
        assets={assetsQuery.data?.assets ?? []}
        loading={assetsQuery.isLoading}
        selectedIds={new Set<string>()}
        selectable={false}
        onToggleSelect={() => {}}
        onOpen={(asset: MediaAsset) => onPick(asset.storage_key)}
        emptyLabel={t("empty")}
      />
    </div>
  );
}

function UploadPicker({
  onPick,
  accept,
}: {
  onPick: (storageKey: string) => void;
  accept?: string;
}) {
  const t = useTranslations("Dashboard.mediaLibrary");
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const asset = await uploadToMediaLibrary(file);
      // The upload goes straight through the service, so nothing else
      // refreshes the cached asset lists — without this the file just
      // uploaded is missing from the library tab and the Media Library page.
      queryClient.invalidateQueries({ queryKey: mediaLibraryKeys.all });
      onPick(asset.storage_key);
    } catch {
      toast.error(t("upload.failed"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <label
      className={`flex h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--tott-card-border)] text-[var(--tott-muted)] transition-colors hover:text-foreground ${
        uploading ? "pointer-events-none opacity-60" : ""
      }`}
    >
      <input
        type="file"
        accept={accept ?? "image/*"}
        className="hidden"
        disabled={uploading}
        onChange={handleChange}
      />
      <CloudUploadIcon />
      <span className="text-sm font-medium">
        {uploading ? t("upload.uploading") : t("heroes.uploadNew")}
      </span>
    </label>
  );
}

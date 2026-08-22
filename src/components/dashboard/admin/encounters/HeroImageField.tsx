"use client";

import { useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/Modal";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { CloudUploadIcon, TrashIcon } from "@/components/ui/icons";
import { useQueryClient } from "@tanstack/react-query";
import { AssetGrid } from "@/components/dashboard/admin/media-library/AssetGrid";
import {
  mediaLibraryKeys,
  useMediaAssets,
} from "@/hooks/queries/media-library";
import {
  uploadToMediaLibrary,
  type MediaAsset,
} from "@/services/media-library.service";

type PickerMode = "library" | "upload";

/**
 * Admin hero-image field for an entity form. Shows a live preview and lets the
 * user pick an existing asset from the media library or upload a new one.
 * `onChange` receives the stable `storage_key` to persist (the backend
 * normalizes it) plus a signed `url` for immediate preview.
 */
export function HeroImageField({
  value,
  previewUrl,
  onChange,
  onClear,
  label,
}: {
  value: string | null;
  previewUrl: string | null;
  onChange: (storageKey: string, url: string | null) => void;
  onClear: () => void;
  label?: string;
}) {
  const t = useTranslations("Dashboard.encounters");
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<PickerMode>("library");

  return (
    <div>
      {label ? (
        <label className="mb-1 block text-xs font-medium text-[var(--tott-dash-gold-label)]">
          {label}
        </label>
      ) : null}

      {value && previewUrl ? (
        <div className="relative overflow-hidden rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt=""
            className="aspect-[16/9] w-full object-cover"
          />
          <button
            type="button"
            onClick={onClear}
            aria-label={t("form.fields.heroImageRemove")}
            className="absolute end-2 top-2 rounded-md border border-[var(--tott-card-border)] bg-black/50 p-1.5 text-white transition-colors hover:text-red-400"
          >
            <TrashIcon />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] text-[var(--tott-muted)] transition-colors hover:text-foreground"
        >
          <CloudUploadIcon />
          <span className="text-sm font-medium">
            {t("form.fields.heroImagePick")}
          </span>
        </button>
      )}

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 rounded-md border border-[var(--tott-card-border)] px-3 py-1.5 text-sm text-[var(--tott-dash-gold-label)] hover:text-foreground"
      >
        {t("form.fields.heroImageChange")}
      </button>

      <HeroPicker open={open} onClose={() => setOpen(false)} mode={mode} setMode={setMode} onChange={onChange} />
    </div>
  );
}

function HeroPicker({
  open,
  onClose,
  mode,
  setMode,
  onChange,
}: {
  open: boolean;
  onClose: () => void;
  mode: PickerMode;
  setMode: (m: PickerMode) => void;
  onChange: (storageKey: string, url: string | null) => void;
}) {
  const t = useTranslations("Dashboard.mediaLibrary");
  const pick = (key: string, url: string | null) => {
    onChange(key, url);
    onClose();
  };

  return (
    <Modal open={open} title={t("heroes.pickerTitle")} onClose={onClose} maxWidthClassName="max-w-3xl">
      <SegmentedControl
        options={[
          { id: "library", label: t("heroes.pickFromLibrary") },
          { id: "upload", label: t("heroes.uploadNew") },
        ]}
        value={mode}
        onChange={setMode}
        className="mb-4"
      />
      {mode === "library" ? <LibraryPicker onPick={pick} /> : <UploadPicker onPick={pick} />}
    </Modal>
  );
}

function LibraryPicker({
  onPick,
}: {
  onPick: (storageKey: string, url: string | null) => void;
}) {
  const t = useTranslations("Dashboard.mediaLibrary");
  const assetsQuery = useMediaAssets({ images_only: true, limit: 60 });

  return (
    <div className="max-h-[50vh] overflow-y-auto">
      <AssetGrid
        assets={assetsQuery.data?.assets ?? []}
        loading={assetsQuery.isLoading}
        selectedIds={new Set<string>()}
        selectable={false}
        onToggleSelect={() => {}}
        onOpen={(asset: MediaAsset) => onPick(asset.storage_key, asset.url)}
        emptyLabel={t("empty")}
      />
    </div>
  );
}

function UploadPicker({
  onPick,
}: {
  onPick: (storageKey: string, url: string | null) => void;
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
      queryClient.invalidateQueries({ queryKey: mediaLibraryKeys.all });
      onPick(asset.storage_key, asset.url);
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
      <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={handleChange} />
      <CloudUploadIcon />
      <span className="text-sm font-medium">
        {uploading ? t("upload.uploading") : t("heroes.uploadNew")}
      </span>
    </label>
  );
}
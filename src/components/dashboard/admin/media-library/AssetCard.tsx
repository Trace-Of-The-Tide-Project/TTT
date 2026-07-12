"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { copyMediaShareLink, type MediaAsset } from "@/services/media-library.service";
import { formatBytes } from "@/lib/format-bytes";
import {
  SquareCheckIcon,
  FileTextIcon,
  FilmIcon,
  MusicIcon,
  LinkIcon,
} from "@/components/ui/icons";

export interface AssetCardProps {
  asset: MediaAsset;
  selected: boolean;
  selectable: boolean;
  onToggleSelect: (id: string) => void;
  onOpen: (asset: MediaAsset) => void;
}

export function AssetCard(props: AssetCardProps) {
  const { asset, selected, selectable, onToggleSelect, onOpen } = props;
  const t = useTranslations("Dashboard.mediaLibrary");

  const isImage = asset.mime_type?.startsWith("image/") && !!asset.url;
  const isVideo = asset.mime_type?.startsWith("video/");
  const isAudio = asset.mime_type?.startsWith("audio/");

  const dimensions =
    asset.width && asset.width > 0 && asset.height && asset.height > 0
      ? `${asset.width}×${asset.height}`
      : "—";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(asset)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(asset);
        }
      }}
      className="group relative cursor-pointer overflow-hidden rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] text-start"
    >
      <div className="relative aspect-[4/3] w-full bg-[var(--tott-dash-surface-inset)]">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={asset.url!} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-[var(--tott-muted)]">
            <span className="[&_svg]:h-10 [&_svg]:w-10">
              {isVideo ? <FilmIcon /> : isAudio ? <MusicIcon /> : <FileTextIcon />}
            </span>
          </div>
        )}

        {selectable && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect(asset.id);
            }}
            className={`absolute start-2 top-2 rounded-md bg-black/50 p-1 text-white ${
              selected ? "opacity-100" : "opacity-60"
            }`}
          >
            <SquareCheckIcon />
          </button>
        )}

        {asset.usages.length > 0 && (
          <span className="absolute end-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
            {t("asset.usagesCount", { count: asset.usages.length })}
          </span>
        )}

        <button
          type="button"
          onClick={async (e) => {
            e.stopPropagation();
            await copyMediaShareLink(asset.id);
            toast.success(t("share.copied"));
          }}
          aria-label={t("share.copyLink")}
          className="absolute bottom-2 end-2 rounded-md bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
        >
          <LinkIcon />
        </button>
      </div>

      <div className="p-3 space-y-1">
        <p className="truncate text-sm font-medium text-foreground" title={asset.file_name}>
          {asset.file_name}
        </p>
        <p className="truncate text-xs text-[var(--tott-muted)]">
          {formatBytes(asset.size_bytes)} · {dimensions}
        </p>
      </div>
    </div>
  );
}

"use client";

import type { MediaAsset } from "@/services/media-library.service";
import { AssetCard } from "./AssetCard";

export interface AssetGridProps {
  assets: MediaAsset[];
  loading: boolean;
  selectedIds: Set<string>;
  selectable: boolean;
  onToggleSelect: (id: string) => void;
  onOpen: (asset: MediaAsset) => void;
  emptyLabel: string;
}

export function AssetGrid(props: AssetGridProps) {
  const { assets, loading, selectedIds, selectable, onToggleSelect, onOpen, emptyLabel } = props;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {loading && assets.length === 0
        ? Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse aspect-[4/3] rounded-lg bg-[var(--tott-dash-surface-inset)]"
            />
          ))
        : assets.length === 0
          ? (
              <div className="col-span-full rounded-xl border border-[var(--tott-card-border)] py-16 text-center text-sm text-[var(--tott-muted)]">
                {emptyLabel}
              </div>
            )
          : assets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                selected={selectedIds.has(asset.id)}
                selectable={selectable}
                onToggleSelect={onToggleSelect}
                onOpen={onOpen}
              />
            ))}
    </div>
  );
}

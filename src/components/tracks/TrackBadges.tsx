"use client";

import { Link } from "@/i18n/navigation";
import { useTracksForEntity } from "@/hooks/queries/tracks";
import type { TrackEntityType } from "@/services/tracks.service";

/** Small pill row linking back to the tracks an entity is tagged to. Renders
 *  nothing while loading or when the entity has no tracks. */
export function TrackBadges({
  entityType,
  entityId,
}: {
  entityType: TrackEntityType;
  entityId: string | null | undefined;
}) {
  const { data: tracks = [] } = useTracksForEntity(entityType, entityId);
  if (!tracks.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {tracks.map((track) => {
        const accent = track.color
          ? `color-mix(in srgb, ${track.color} 100%, transparent)`
          : "var(--tott-accent-gold)";
        return (
          <Link
            key={track.id}
            href={`/tracks/${encodeURIComponent(track.slug)}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tott-card-border)] px-2.5 py-1 text-xs text-[var(--tott-muted)] transition-colors hover:text-foreground"
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} />
            {track.title}
          </Link>
        );
      })}
    </div>
  );
}

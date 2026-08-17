"use client";

import { useTracksForEntity } from "@/hooks/queries/tracks";
import { useSetTracksForEntity } from "@/hooks/mutations/tracks";
import { TracksPicker } from "@/components/dashboard/admin/articles/articles-editor/TracksPicker";

/** Self-contained: fetches/saves this book's tracks independently of the
 *  surrounding form's save flow, mirroring how BookChaptersPanel persists
 *  chapters immediately rather than batching with the book submit. */
export function BookTracksPanel({ bookId }: { bookId: string }) {
  const { data: tracks = [] } = useTracksForEntity("book", bookId);
  const setTracks = useSetTracksForEntity("book", bookId);
  const trackIds = tracks.map((t) => t.id);

  return (
    <TracksPicker
      trackIds={trackIds}
      onTrackIdsChange={(ids) => setTracks.mutate(ids)}
    />
  );
}

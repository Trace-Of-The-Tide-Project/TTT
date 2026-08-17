"use client";

import { useTracksForEntity } from "@/hooks/queries/tracks";
import { useSetTracksForEntity } from "@/hooks/mutations/tracks";
import { TracksPicker } from "@/components/dashboard/admin/articles/articles-editor/TracksPicker";

/** Self-contained: fetches/saves this issue's tracks independently of the
 *  surrounding editor's save flow, mirroring IssueContributorsPanel. */
export function IssueTracksPanel({ issueId }: { issueId: string }) {
  const { data: tracks = [] } = useTracksForEntity("magazine_issue", issueId);
  const setTracks = useSetTracksForEntity("magazine_issue", issueId);
  const trackIds = tracks.map((t) => t.id);

  return (
    <TracksPicker
      trackIds={trackIds}
      onTrackIdsChange={(ids) => setTracks.mutate(ids)}
    />
  );
}

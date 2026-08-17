"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useTracksAdmin } from "@/hooks/queries/tracks";
import type { Track } from "@/services/tracks.service";

const FIELD_BASE =
  "w-full rounded-[7.5px] border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2.5 text-sm text-foreground placeholder:text-[var(--tott-muted)] outline-none transition-colors focus:border-[var(--tott-card-border)]";

type Props = {
  trackIds: string[];
  onTrackIdsChange: (ids: string[]) => void;
};

/** Multi-select track tagger for article/book/issue admin forms — mirrors the
 *  inline tag picker in ArticleSettings.tsx, minus create-on-the-fly (tracks
 *  are editorially managed, not a folksonomy). */
export function TracksPicker({ trackIds, onTrackIdsChange }: Props) {
  const t = useTranslations("Dashboard.tracks.picker");
  const tracksQuery = useTracksAdmin();
  const allTracks: Track[] = useMemo(() => tracksQuery.data ?? [], [tracksQuery.data]);
  const loading = tracksQuery.isPending;

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);

  const nameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const track of allTracks) m.set(track.id, track.title);
    return m;
  }, [allTracks]);

  const removeById = useCallback(
    (id: string) => onTrackIdsChange(trackIds.filter((x) => x !== id)),
    [onTrackIdsChange, trackIds],
  );

  const addTrack = useCallback(
    (id: string) => {
      if (!id || trackIds.includes(id)) return;
      onTrackIdsChange([...trackIds, id]);
      setQuery("");
    },
    [onTrackIdsChange, trackIds],
  );

  const availableToAdd = useMemo(
    () => allTracks.filter((track) => !trackIds.includes(track.id)),
    [allTracks, trackIds],
  );

  const trimmedQuery = query.trim();
  const filtered = useMemo(
    () =>
      trimmedQuery
        ? availableToAdd.filter((track) =>
            track.title.toLowerCase().includes(trimmedQuery.toLowerCase()),
          )
        : availableToAdd,
    [availableToAdd, trimmedQuery],
  );

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div>
      <span className="mb-2 block text-sm text-[var(--tott-muted)]">{t("label")}</span>
      {trackIds.length > 0 ? (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {trackIds.map((id) => {
            const name = nameById.get(id) ?? t("unknownName", { prefix: `${id.slice(0, 8)}…` });
            return (
              <span
                key={id}
                className="inline-flex max-w-full items-center gap-1.5 rounded-md bg-[var(--tott-dash-control-bg)] px-2.5 py-1 text-xs text-foreground"
              >
                <span className="truncate" title={id}>
                  {name}
                </span>
                <button
                  type="button"
                  onClick={() => removeById(id)}
                  className="grid h-3.5 w-3.5 shrink-0 place-items-center text-[var(--tott-muted)] transition-colors hover:text-foreground"
                  aria-label={t("removeAria", { name })}
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    aria-hidden
                  >
                    <line x1="5" y1="5" x2="19" y2="19" />
                    <line x1="19" y1="5" x2="5" y2="19" />
                  </svg>
                </button>
              </span>
            );
          })}
        </div>
      ) : null}
      <div ref={boxRef} className="relative">
        <input
          type="text"
          value={query}
          disabled={loading}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={loading ? t("loading") : t("addPlaceholder")}
          className={FIELD_BASE}
        />
        {open ? (
          <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-[7.5px] border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] py-1 shadow-xl">
            {filtered.map((track) => (
              <button
                key={track.id}
                type="button"
                onClick={() => {
                  addTrack(track.id);
                  setOpen(false);
                }}
                className="block w-full px-3 py-2 text-start text-sm text-foreground transition-colors hover:bg-[var(--tott-elevated-hover)]"
              >
                {track.title}
              </button>
            ))}
            {!filtered.length ? (
              <p className="px-3 py-2 text-xs text-[var(--tott-muted)]">
                {trimmedQuery ? t("noResults") : t("allSelected")}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
      <p className="mt-1.5 text-xs text-[var(--tott-muted)]">{t("hint")}</p>
    </div>
  );
}

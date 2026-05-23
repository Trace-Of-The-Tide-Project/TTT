"use client";

import { resolveArticleMediaSrc } from "@/lib/content/article-media-url";
import { useArticleMediaPlaybackUrl } from "@/hooks/useArticleMediaPlaybackUrl";

type ArticleBodyAudioProps = {
  src: string;
};

/** Inline article audio: signed URLs or API paths; auth blob when needed. */
export function ArticleBodyAudio({ src }: ArticleBodyAudioProps) {
  const resolved = resolveArticleMediaSrc(src);
  const { playbackUrl, status } = useArticleMediaPlaybackUrl(resolved);
  const loading = status === "loading" || (status === "ready" && !playbackUrl);

  if (loading) {
    return (
      <div
        className="max-h-[min(70vh,720px)] min-h-24 w-full max-w-3xl animate-pulse rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-well-bg)]"
        aria-busy="true"
        aria-label="Loading audio"
      />
    );
  }

  return (
    <audio
      key={playbackUrl}
      src={playbackUrl}
      controls
      className="w-full max-w-3xl rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-panel-bg)] py-2"
      preload="metadata"
    />
  );
}

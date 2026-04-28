"use client";

import { resolveArticleMediaSrc } from "@/lib/content/article-media-url";
import { useArticleMediaPlaybackUrl } from "@/hooks/useArticleMediaPlaybackUrl";

type ArticleBodyVideoProps = {
  src: string;
};

/** Inline article video: API paths may require Bearer — see {@link useArticleMediaPlaybackUrl}. */
export function ArticleBodyVideo({ src }: ArticleBodyVideoProps) {
  const resolved = resolveArticleMediaSrc(src);
  const { playbackUrl, status } = useArticleMediaPlaybackUrl(resolved);
  const loading = status === "loading" || (status === "ready" && !playbackUrl);

  if (loading) {
    return (
      <div
        className="max-h-[min(70vh,720px)] min-h-48 w-full max-w-3xl animate-pulse rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-well-bg)]"
        aria-busy="true"
        aria-label="Loading video"
      />
    );
  }

  return (
    <video
      key={playbackUrl}
      src={playbackUrl}
      controls
      playsInline
      className="max-h-[min(70vh,720px)] w-full max-w-3xl rounded-lg border border-[var(--tott-card-border)] bg-black object-contain"
      preload="metadata"
    />
  );
}

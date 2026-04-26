"use client";

import { ContentVideoPlayer } from "./ContentVideoPlayer";
import { ContentAudioPlayer } from "./ContentAudioPlayer";
import { ContentImageDisplay } from "./ContentImageDisplay";
import { ContentGalleryPlayer } from "./ContentGalleryPlayer";
import type { GalleryItem } from "./ContentGalleryPlayer";

export type ContentMediaPlayerProps = {
  type: "video" | "audio" | "image" | "gallery";
  src?: string;
  thumbnail?: string;
  duration?: string;
  title?: string;
  coverLabel?: string;
  items?: GalleryItem[];
  /** Passed to ContentImageDisplay for shared-layout morph from a content card. */
  layoutId?: string;
};

export function ContentMediaPlayer({
  type,
  src,
  thumbnail,
  duration,
  title,
  coverLabel,
  items,
  layoutId,
}: ContentMediaPlayerProps) {
  if (type === "gallery" && items) return <ContentGalleryPlayer items={items} />;
  if (type === "image") {
    return <ContentImageDisplay src={src ?? ""} coverLabel={coverLabel} layoutId={layoutId} />;
  }
  if (type === "audio" && src) {
    return (
      <ContentAudioPlayer
        src={src}
        thumbnail={thumbnail}
        title={title}
        duration={duration}
      />
    );
  }
  if (type === "video" && src) {
    return <ContentVideoPlayer src={src} thumbnail={thumbnail} />;
  }
  return null;
}

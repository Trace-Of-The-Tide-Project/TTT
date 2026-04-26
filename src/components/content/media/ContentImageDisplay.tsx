"use client";

import Image from "next/image";
import { theme } from "@/lib/theme";
import { isUsableImageSrc } from "@/lib/content/content-image-src";
import { SharedImage } from "@/components/motion/SharedImage";

type ContentImageDisplayProps = {
  src: string;
  /** Optional badge on the hero (e.g. "Cover"). */
  coverLabel?: string;
  /** Matches the `layoutId` on the source card image for a shared-layout morph. */
  layoutId?: string;
};

function DefaultCoverHero({ coverLabel }: { coverLabel?: string }) {
  return (
    <div className="relative w-full" style={{ aspectRatio: "21 / 9" }}>
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#2d2a26] via-[#1a1a1a] to-[#252018]"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: `radial-gradient(ellipse 80% 70% at 50% 20%, ${theme.accentGold}33, transparent 55%)`,
        }}
        aria-hidden
      />
      {coverLabel ? (
        <div
          className="pointer-events-none absolute inset-0 flex items-end justify-start bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 sm:p-6"
          aria-hidden
        >
          <span
            className="rounded-md border border-white/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur-sm sm:text-sm"
            style={{
              backgroundColor: `${theme.accentGold}cc`,
              borderColor: theme.accentGold,
            }}
          >
            {coverLabel}
          </span>
        </div>
      ) : null}
    </div>
  );
}

export function ContentImageDisplay({ src, coverLabel, layoutId }: ContentImageDisplayProps) {
  const trimmed = src.trim();
  if (!isUsableImageSrc(trimmed)) {
    return (
      <div className="relative overflow-hidden rounded-xl">
        <DefaultCoverHero coverLabel={coverLabel} />
      </div>
    );
  }

  const isRemote = /^https?:\/\//i.test(trimmed);
  const isData = trimmed.startsWith("data:image/");

  return (
    <div className="relative overflow-hidden rounded-xl">
      <div className="relative w-full" style={{ aspectRatio: "21 / 9" }}>
        <SharedImage layoutId={layoutId} style={{ position: "absolute", inset: 0 }}>
          <Image
            src={trimmed}
            alt={coverLabel ? `${coverLabel} image` : ""}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 60vw"
            unoptimized={isRemote || isData}
          />
        </SharedImage>
        {coverLabel ? (
          <div
            className="pointer-events-none absolute inset-0 flex items-end justify-start bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 sm:p-6"
            aria-hidden
          >
            <span
              className="rounded-md border border-white/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur-sm sm:text-sm"
              style={{
                backgroundColor: `${theme.accentGold}cc`,
                borderColor: theme.accentGold,
              }}
            >
              {coverLabel}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

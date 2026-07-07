"use client";

import { theme } from "@/lib/theme";
import { writerAvatar, type WriterProfile } from "@/services/writers.service";
import { type OpenCallListItem } from "@/services/open-calls.service";
import { resolveArticleMediaSrc } from "@/lib/content/article-media-url";
import { CommunityHero } from "./CommunityHero";
import { CommunityStats } from "./CommunityStats";
import { CommunityWriters } from "./CommunityWriters";
import { CommunityOpenCalls, coverOf } from "./CommunityOpenCalls";
import { CommunityGuidelines } from "./CommunityGuidelines";
import { CommunityCta } from "./CommunityCta";

/** First usable cover for the hero: an open-call cover, else a writer avatar.
 * Fallback when the admin hasn't configured hero images. */
function fallbackHeroCover(
  openCalls: OpenCallListItem[],
  writers: WriterProfile[],
): string | null {
  for (const call of openCalls) {
    const c = coverOf(call);
    if (c) return c;
  }
  for (const w of writers) {
    const a = writerAvatar(w);
    if (a) return a;
  }
  return null;
}

export function CommunityShowContent({
  featuredWriters,
  openCalls,
  guidelines,
  heroImages,
}: {
  featuredWriters: WriterProfile[];
  openCalls: OpenCallListItem[];
  guidelines: string[];
  heroImages: string[];
}) {
  const resolvedHeroImages = heroImages.map((key) => resolveArticleMediaSrc(key));
  const heroCoverImages =
    resolvedHeroImages.length > 0
      ? resolvedHeroImages
      : (() => {
          const fallback = fallbackHeroCover(openCalls, featuredWriters);
          return fallback ? [fallback] : [];
        })();

  return (
    <main
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{ backgroundColor: theme.homeSurface }}
    >
      <CommunityHero coverImages={heroCoverImages} />

      {/* Sections pull up slightly to bleed into the hero's tideline base. */}
      <div className="relative z-10 mx-auto -mt-6 max-w-7xl px-6 pb-24 sm:px-10 sm:-mt-10">
        <CommunityStats
          writers={featuredWriters.length}
          openCalls={openCalls.length}
          guidelines={guidelines.length}
        />

        {featuredWriters.length > 0 ? (
          <CommunityWriters writers={featuredWriters} />
        ) : null}

        {openCalls.length > 0 ? (
          <CommunityOpenCalls openCalls={openCalls} />
        ) : null}

        {guidelines.length > 0 ? (
          <CommunityGuidelines guidelines={guidelines} />
        ) : null}

        <CommunityCta />
      </div>
    </main>
  );
}

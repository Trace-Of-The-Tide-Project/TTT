import { getLocale } from "next-intl/server";
import {
  getFeaturedWriters,
  getWriterProfileFull,
  getWriters,
} from "@/services/writers.service";
import { getPageHero } from "@/services/media-library.service";
import { WritersShowContent } from "@/components/writers/WritersShowContent";

export const dynamic = "force-dynamic";

export default async function WritersShowPage() {
  const locale = await getLocale();
  // SSR the initial (unfiltered) list + the featured strip in parallel. Both
  // hit public endpoints and swallow errors → null-safe empty arrays.
  // One card per translation group, viewer's language preferred.
  const [initialWriters, featuredWriters, heroOverrideUrl] = await Promise.all([
    getWriters({ limit: 60, dedupe: "group", viewer_lang: locale }),
    getFeaturedWriters(locale),
    getPageHero("writers"),
  ]);

  // Spotlight the first featured writer with its rich profile (quote, stats,
  // based_in) — one extra call, only for the hero. Null-safe → hero falls back
  // to thin featured data. No featured writers → no spotlight.
  const spotlightId = featuredWriters[0]?.id;
  const spotlightProfile = spotlightId
    ? await getWriterProfileFull(spotlightId, locale)
    : null;

  return (
    <WritersShowContent
      initialWriters={initialWriters}
      featuredWriters={featuredWriters}
      spotlightProfile={spotlightProfile}
      heroOverrideUrl={heroOverrideUrl}
    />
  );
}

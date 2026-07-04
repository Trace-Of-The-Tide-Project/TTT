import { getLocale } from "next-intl/server";
import { getFeaturedWriters, getWriters } from "@/services/writers.service";
import { WritersShowContent } from "@/components/writers/WritersShowContent";

export const dynamic = "force-dynamic";

export default async function WritersShowPage() {
  const locale = await getLocale();
  // SSR the initial (unfiltered) list + the featured strip in parallel. Both
  // hit public endpoints and swallow errors → null-safe empty arrays.
  // One card per translation group, viewer's language preferred.
  const [initialWriters, featuredWriters] = await Promise.all([
    getWriters({ limit: 60, dedupe: "group", viewer_lang: locale }),
    getFeaturedWriters(locale),
  ]);

  return (
    <WritersShowContent
      initialWriters={initialWriters}
      featuredWriters={featuredWriters}
    />
  );
}

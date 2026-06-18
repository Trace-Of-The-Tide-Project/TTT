import { getFeaturedWriters, getWriters } from "@/services/writers.service";
import { WritersShowContent } from "@/components/writers/WritersShowContent";

export const dynamic = "force-dynamic";

export default async function WritersShowPage() {
  // SSR the initial (unfiltered) list + the featured strip in parallel. Both
  // hit public endpoints and swallow errors → null-safe empty arrays.
  const [initialWriters, featuredWriters] = await Promise.all([
    getWriters({ limit: 60 }),
    getFeaturedWriters(),
  ]);

  return (
    <WritersShowContent
      initialWriters={initialWriters}
      featuredWriters={featuredWriters}
    />
  );
}

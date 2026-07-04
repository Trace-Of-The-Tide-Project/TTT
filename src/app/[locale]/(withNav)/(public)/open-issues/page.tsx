import { getLocale } from "next-intl/server";
import { OpenIssuesContent } from "@/components/open-issues/OpenIssuesContent";
import { serverGet } from "@/lib/api/isomorphic-fetch";
import type { MagazineIssue } from "@/services/magazine-issues.service";

// Open Issues lists live publication issues currently accepting
// support. Issue list is dynamic, no caching.
export const dynamic = "force-dynamic";

type Envelope<T> = { data?: T[] };

function unwrapList<T>(raw: Envelope<T> | T[] | null): T[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  return raw.data ?? [];
}

export default async function OpenIssuesPage() {
  const locale = await getLocale();
  // Pull every published magazine-issue (limit kept generous; the
  // landing grid expects ~6 cards but should adapt to whatever the
  // backend returns). One card per translation group, viewer's language first.
  const raw = await serverGet<Envelope<MagazineIssue>>("/magazine-issues", {
    status: "published",
    limit: 24,
    sortBy: "published_at",
    order: "DESC",
    dedupe: "group",
    viewer_lang: locale,
  });
  const issues = unwrapList(raw);

  return <OpenIssuesContent issues={issues} />;
}

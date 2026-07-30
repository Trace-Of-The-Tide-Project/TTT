/**
 * Server-side data layer for the magazine homepage (`/magazine-v3`). Reuses
 * the magazine-next fetchers wherever the shape is identical (articles,
 * framing) and adds what's new to this editorial redesign: upcoming issues
 * and subscription plans. Same graceful-degradation contract throughout:
 * every fetch resolves to a safe empty value on failure so the page always
 * renders.
 */
import { getMagazineIssues, type MagazineIssue } from "@/services/magazine-issues.service";
import { fetchPlans, type SubscriptionPlan } from "@/lib/api/subscriptions";
import { getCollections, type CollectionItem } from "@/services/collections.service";

export {
  attachArticleFraming,
  attachWriterFraming,
  attachIssueFraming,
  fetchArticles,
  fetchWriters,
  fetchIssues,
  fetchCurrentIssue,
  fetchEditorialCopy,
  type ArticleCard,
  type IssueCard,
} from "@/components/home/magazine-next/data";
export type { MagazineIssue };

/** Per-section fetch limits. */
export const V3_SECTION_SIZES = {
  /** High enough to never clip a real editorial board roster — this section
   * shows every writer an admin toggled on via /writers/editorial-board,
   * not a fixed page size. */
  boardWriters: 50,
  featured: 9,
  latest: 22,
  collections: 5,
  upcoming: 3,
} as const;

export type CollectionCard = {
  id: string;
  name: string;
  coverImage: string | null;
  /** Best-effort — /collections has no typed article-count field. Checks
   * article_count, then count, then a raw contributions/articles array
   * length. 0 means "unknown", and the card hides the chip rather than
   * showing a wrong number. */
  articleCount: number;
  href: string;
};

function toCollectionCard(raw: CollectionItem): CollectionCard {
  const row = raw as CollectionItem & {
    article_count?: number;
    count?: number;
    contributions?: unknown[];
    articles?: unknown[];
  };
  const contributions = Array.isArray(row.contributions)
    ? row.contributions
    : Array.isArray(row.articles)
      ? row.articles
      : [];
  return {
    id: row.id,
    name: row.name,
    coverImage: row.cover_image ?? null,
    articleCount: row.article_count ?? row.count ?? contributions.length ?? 0,
    href: `/collections/${encodeURIComponent(row.id)}`,
  };
}

/** Site-global collections (no product scoping available on /collections). */
export async function fetchCollections(
  locale: string,
  limit = V3_SECTION_SIZES.collections,
): Promise<CollectionCard[]> {
  try {
    const rows = await getCollections({ limit, dedupe: "group", viewer_lang: locale });
    return rows.map(toCollectionCard);
  } catch {
    return [];
  }
}

export type UpcomingIssueStatus = "comingSoon" | "inProduction" | "researchPhase";

export type UpcomingIssueCard = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  coverImage: string | null;
  teaser: string | null;
  releaseDate: string | null;
  status: UpcomingIssueStatus;
  href: string;
};

/** Backend issue status → this section's badge. Published/archived issues
 * never appear here — those are "out", not "upcoming". */
const STATUS_TO_BADGE: Record<string, UpcomingIssueStatus> = {
  funding: "comingSoon",
  funded: "comingSoon",
  draft: "inProduction",
  proposed: "researchPhase",
};

function toUpcomingCard(raw: MagazineIssue): UpcomingIssueCard | null {
  const status = raw.status ? STATUS_TO_BADGE[raw.status] : undefined;
  if (!status) return null;
  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title,
    subtitle: raw.subtitle ?? null,
    coverImage: raw.cover_image ?? null,
    teaser: raw.excerpt ?? raw.description ?? null,
    releaseDate: raw.published_at ?? null,
    status,
    href: `/magazine-issues/${encodeURIComponent(raw.slug)}`,
  };
}

/**
 * Upcoming (non-published) issues for the "Upcoming Issues" section. The
 * list endpoint filters by a single `status`, so each candidate status is
 * fetched in parallel and merged — every fetch resolves to `[]` on failure,
 * same contract as the rest of this page. Sorted by expected release date
 * (nulls last), then most-recently-created, capped at the section size.
 */
export async function fetchUpcomingIssues(
  limit = V3_SECTION_SIZES.upcoming,
): Promise<UpcomingIssueCard[]> {
  const statuses = Object.keys(STATUS_TO_BADGE);
  const results = await Promise.all(
    statuses.map((status) =>
      getMagazineIssues({ status, limit: limit * 2 }).catch(() => [] as MagazineIssue[]),
    ),
  );
  const merged = results
    .flat()
    .map(toUpcomingCard)
    .filter((c): c is UpcomingIssueCard => c !== null);

  merged.sort((a, b) => {
    if (a.releaseDate && b.releaseDate) return a.releaseDate.localeCompare(b.releaseDate);
    if (a.releaseDate) return -1;
    if (b.releaseDate) return 1;
    return 0;
  });

  return merged.slice(0, limit);
}

export type PlanCard = SubscriptionPlan & { recommended: boolean };

/**
 * Active subscription plans, sorted cheapest-first, with one plan flagged
 * "recommended" so the UI can highlight it — the "subscriber" tier by name,
 * falling back to the middle plan by index so this still works if that tier
 * is renamed or removed. Supports any plan count. Wrapped so a backend
 * outage degrades to an empty Plans section rather than a page error.
 */
export async function fetchPlansSafe(): Promise<PlanCard[]> {
  let plans: SubscriptionPlan[] = [];
  try {
    plans = await fetchPlans();
  } catch {
    return [];
  }
  const active = plans.filter((p) => p.status === "active").sort((a, b) => a.price_monthly - b.price_monthly);
  if (active.length === 0) return [];

  const recommendedIndex = active.findIndex((p) => p.name === "subscriber");
  const idx = recommendedIndex >= 0 ? recommendedIndex : Math.floor((active.length - 1) / 2);

  return active.map((plan, i) => ({ ...plan, recommended: i === idx }));
}

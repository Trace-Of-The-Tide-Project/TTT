/**
 * Server-side homepage data layer.
 *
 * Fetches every content rail the redesigned homepage surfaces, in
 * parallel, via the backend proxy (`callBackend`). Each fetch is
 * isolated and tolerant: a failure or unexpected shape yields an empty
 * rail rather than throwing, so one sparse/broken endpoint never blanks
 * the whole page. Section components hide themselves when their rail is
 * empty (graceful empty states).
 *
 * All endpoints used are public (no auth). Image fields are normalized
 * to a single `image` per item (cover_image / main_media.url /
 * biographical-card image).
 */
import { callBackend } from "@/lib/auth/proxy-backend";
import { stripHtml } from "@/components/home/magazine-next/ui";

// ── Normalized rail item shapes ────────────────────────────────────

export type HomeArticle = {
  id: string;
  title: string;
  excerpt: string | null;
  image: string | null;
  category: string | null;
  contentType: string; // article | video | audio | thread | artwork | trip | open_call ...
  readingTime: number | null;
  viewCount: number | null;
  authorName: string | null;
  isFeatured: boolean;
  href: string;
};

export type HomeOpenCall = {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  category: string | null;
  deadline: string | null; // timeline_end
  href: string;
};

export type HomeIssue = {
  id: string;
  title: string;
  subtitle: string | null;
  image: string | null;
  slug: string | null;
  kind: string; // editorial | crowdfunded
  status: string | null;
  fundingGoal: number | null;
  fundingRaised: number | null;
  fundingDeadline: string | null;
  href: string;
};

export type HomeCollection = {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  articleCount: number;
  href: string;
};

export type HomePerson = {
  id: string;
  name: string;
  image: string | null;
  birthDate: string | null;
  deathDate: string | null;
  href: string;
};

export type HomeTrip = {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  routeSummary: string | null;
  category: string | null;
  href: string;
};

export type HomeBookClubItem = {
  id: string;
  title: string;
  authorName: string | null;
  image: string | null;
  blurb: string | null;
  year: number | null;
};

export type HomeData = {
  spotlight: HomeArticle | null;
  oralHistories: Array<HomeArticle | HomeOpenCall>;
  openCalls: HomeOpenCall[];
  issues: HomeIssue[];
  collections: HomeCollection[];
  people: HomePerson[];
  trips: HomeTrip[];
  bookClub: HomeBookClubItem[];
  /** First active open call — used by the contribute CTA default link. */
  primaryOpenCall: HomeOpenCall | null;
};

// ── Helpers ────────────────────────────────────────────────────────

/** Pull an array out of either `{ data: [] }`, `{ items: [] }`, or `[]`. */
function asArray(json: unknown): Record<string, unknown>[] {
  if (Array.isArray(json)) return json as Record<string, unknown>[];
  if (json && typeof json === "object") {
    const obj = json as Record<string, unknown>;
    for (const key of ["data", "items", "results", "people", "trips"]) {
      if (Array.isArray(obj[key])) return obj[key] as Record<string, unknown>[];
    }
  }
  return [];
}

function str(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}
function num(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() && Number.isFinite(Number(v))) {
    return Number(v);
  }
  return null;
}

async function getJson(path: string): Promise<unknown> {
  const res = await callBackend({ path });
  return res.ok ? res.json : null;
}

function authorName(a: Record<string, unknown>): string | null {
  const author = a.author as Record<string, unknown> | undefined;
  if (!author) return str(a.author_name);
  return str(author.full_name) ?? str(author.username) ?? str(a.author_name);
}

// ── Mappers ────────────────────────────────────────────────────────

function mapArticle(a: Record<string, unknown>): HomeArticle {
  const id = String(a.id ?? "");
  return {
    id,
    title: str(a.title) ?? "Untitled",
    excerpt: str(stripHtml(str(a.excerpt))) || str(stripHtml(str(a.summary))),
    image: str(a.cover_image),
    category: str(a.category),
    contentType: (str(a.content_type) ?? "article").toLowerCase(),
    readingTime: num(a.reading_time),
    viewCount: num(a.view_count),
    authorName: authorName(a),
    isFeatured: a.is_featured === true,
    href: `/content/article?id=${encodeURIComponent(id)}`,
  };
}

function mapOpenCall(o: Record<string, unknown>): HomeOpenCall {
  const id = String(o.id ?? "");
  const mainMedia = o.main_media as Record<string, unknown> | undefined;
  return {
    id,
    title: str(o.title) ?? "Open Call",
    description: str(o.description),
    image: str(o.cover_image) ?? str(mainMedia?.url),
    category: str(o.category),
    deadline: str(o.timeline_end),
    href: `/open-calls/${encodeURIComponent(id)}`,
  };
}

function mapIssue(i: Record<string, unknown>): HomeIssue {
  const id = String(i.id ?? "");
  const slug = str(i.slug);
  return {
    id,
    title: str(i.title) ?? "Issue",
    subtitle: str(i.subtitle),
    image: str(i.cover_image),
    slug,
    kind: (str(i.kind) ?? "editorial").toLowerCase(),
    status: str(i.status),
    fundingGoal: num(i.funding_goal),
    fundingRaised: num(i.funding_raised),
    fundingDeadline: str(i.funding_deadline),
    href: slug
      ? `/magazine-issues/${slug}`
      : `/magazine-issues`,
  };
}

function mapCollection(c: Record<string, unknown>): HomeCollection {
  const id = String(c.id ?? "");
  const contributions = Array.isArray(c.contributions)
    ? c.contributions
    : Array.isArray(c.articles)
      ? c.articles
      : [];
  return {
    id,
    name: str(c.name) ?? str(c.title) ?? "Collection",
    description: str(c.description),
    image: str(c.cover_image),
    articleCount:
      num(c.article_count) ?? num(c.count) ?? contributions.length ?? 0,
    href: `/content?collection=${encodeURIComponent(id)}`,
  };
}

function mapPerson(p: Record<string, unknown>): HomePerson {
  const id = String(p.id ?? "");
  // Portrait may live on the profile directly or on the first
  // biographical card (see backend gap note in the plan).
  const cards = Array.isArray(p.cards)
    ? (p.cards as Record<string, unknown>[])
    : Array.isArray(p.biographical_cards)
      ? (p.biographical_cards as Record<string, unknown>[])
      : [];
  const cardImage = cards.length > 0 ? str(cards[0]!.image) : null;
  return {
    id,
    name: str(p.full_name) ?? str(p.name) ?? "—",
    image: str(p.portrait) ?? str(p.image) ?? str(p.avatar_url) ?? cardImage,
    birthDate: str(p.birth_date),
    deathDate: str(p.death_date),
    href: `/people/${encodeURIComponent(id)}`,
  };
}

function mapTrip(t: Record<string, unknown>): HomeTrip {
  const id = String(t.id ?? "");
  return {
    id,
    title: str(t.title) ?? "Trip",
    description: str(t.description),
    image: str(t.cover_image),
    routeSummary: str(t.route_summary),
    category: str(t.category),
    href: `/trips/${encodeURIComponent(id)}`,
  };
}

function mapBookClub(b: Record<string, unknown>): HomeBookClubItem {
  return {
    id: String(b.id ?? ""),
    title: str(b.title) ?? "Selection",
    authorName: str(b.author_name),
    image: str(b.cover_image),
    blurb: str(b.blurb),
    year: num(b.year),
  };
}

/** Content types that read as oral history / testimony material. */
const ORAL_CONTENT_TYPES = new Set(["audio", "video", "thread"]);

// ── Entry point ────────────────────────────────────────────────────

export async function fetchHomeData(locale: string): Promise<HomeData> {
  const [
    articlesJson,
    openCallsJson,
    issuesJson,
    collectionsJson,
    peopleJson,
    tripsJson,
    bookClubJson,
  ] = await Promise.all([
    getJson(`/articles?limit=60&dedupe=group&viewer_lang=${locale}`),
    getJson(`/open-calls/active?limit=12&dedupe=group&viewer_lang=${locale}`),
    getJson(`/magazine-issues?limit=12&dedupe=group&viewer_lang=${locale}`),
    getJson(`/collections?limit=12&dedupe=group&viewer_lang=${locale}`),
    getJson(`/people?limit=12&dedupe=group&viewer_lang=${locale}`),
    getJson(`/trips?limit=12&status=published`),
    getJson(`/book-club/active`),
  ]);

  const articles = asArray(articlesJson).map(mapArticle).filter((a) => a.id);
  const openCalls = asArray(openCallsJson).map(mapOpenCall).filter((o) => o.id);

  // Spotlight = explicitly featured article, else most-recent published.
  const spotlight =
    articles.find((a) => a.isFeatured) ??
    (articles.length > 0 ? articles[0]! : null);

  // Oral histories rail = testimony-shaped articles + open calls, mixed.
  const oralArticles = articles.filter((a) =>
    ORAL_CONTENT_TYPES.has(a.contentType),
  );
  const oralHistories: Array<HomeArticle | HomeOpenCall> = [
    ...oralArticles,
    ...openCalls,
  ].slice(0, 12);

  return {
    spotlight,
    oralHistories,
    openCalls,
    issues: asArray(issuesJson).map(mapIssue).filter((i) => i.id),
    collections: asArray(collectionsJson).map(mapCollection).filter((c) => c.id),
    people: asArray(peopleJson).map(mapPerson).filter((p) => p.id),
    trips: asArray(tripsJson).map(mapTrip).filter((t) => t.id),
    bookClub: asArray(bookClubJson).map(mapBookClub).filter((b) => b.id),
    primaryOpenCall: openCalls.length > 0 ? openCalls[0]! : null,
  };
}

/** Type guard: distinguish open calls from articles in the mixed rail. */
export function isOpenCall(
  item: HomeArticle | HomeOpenCall,
): item is HomeOpenCall {
  return (item as HomeOpenCall).href.startsWith("/open-calls/");
}

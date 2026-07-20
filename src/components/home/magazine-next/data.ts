/**
 * Server-side data layer for the scroll-first magazine homepage
 * (`/magazine-next`). Every helper uses `serverGet` and resolves to a
 * safe empty value on failure so the page renders with whatever content
 * exists — the same graceful-degradation contract as the legacy
 * `magazine/page.tsx`.
 *
 * Card-shaped types are exported here so each section component takes a
 * flat, presentation-ready item instead of a raw backend row.
 */
import { serverGet } from "@/lib/api/isomorphic-fetch";
import {
  normalizeArticlesListPayload,
  type ArticleListItem,
  type ArticleProduct,
} from "@/services/articles.service";
import type { CmsPage } from "@/services/cms.service";
import type { MagazineIssue } from "@/services/magazine-issues.service";
import { getMagazines } from "@/services/magazines.service";
import {
  MAGAZINE_PAGE_SLUG,
  findSection,
  parseHeroConfig,
  pickHeroLocale,
  parseManifestoConfig,
  pickManifestoLocale,
  parseFounderConfig,
  pickFounderLocale,
  parseNewsletterConfig,
  pickNewsletterLocale,
  parseSupportConfig,
  pickSupportLocale,
  type HeroLocaleFields,
  type ManifestoLocaleFields,
  type FounderQuoteLocaleFields,
  type NewsletterCopyLocaleFields,
  type SupportLocaleFields,
} from "@/services/magazine-page.service";
import type { CollaborationItem } from "@/components/home/magazine/MagazineSupport";
import type { ImageFraming } from "@/lib/image-framing";
import { getFramingsServer } from "@/services/image-framing.service";
import {
  ARTICLE_COVER_FRAMING,
  WRITER_AVATAR_FRAMING,
} from "@/lib/framing-placements";
import { ISSUE_FRAMING_ENTITY, ISSUE_FRAMING_FIELD } from "./issue-framing";
import { shortDate } from "./ui";
import {
  writerAvatar,
  writerDisplayName,
  type WriterProfile,
} from "@/services/writers.service";

// ─── Backend envelopes (loose; OpenAPI doesn't declare these) ──────────

type Envelope<T> = { data?: T[]; rows?: T[]; status?: number; results?: number };

function unwrapList<T>(raw: Envelope<T> | T[] | null): T[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  return raw.rows ?? raw.data ?? [];
}

type RawBook = {
  id: string;
  title: string;
  slug?: string | null;
  author?: string | null;
  genre?: string | null;
  cover_image?: string | null;
};

type RawContribution = {
  id: string;
  title?: string | null;
  description?: string | null;
  status?: string | null;
  submission_date?: string | null;
  type?: { name?: string | null } | null;
};

// ─── Card types ────────────────────────────────────────────────────────

export type IssueCard = {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string | null;
  coverImage: string | null;
  /** Admin-set framing for `coverImage`, attached by `attachIssueFraming`. */
  coverFraming?: ImageFraming;
  excerpt: string | null;
  editionNumber: number | null;
  category: string | null;
  publishedAt: string | null;
  isCurrent: boolean;
};

export type ArticleCard = {
  id: string;
  title: string;
  slug: string;
  contentType: string;
  category: string | null;
  excerpt: string | null;
  coverImage: string | null;
  mediaDuration: number | null;
  readingTime: number;
  publishedAt: string | null;
  authorName: string | null;
  authorAvatar: string | null;
  /** Admin-set framing for `coverImage`, attached by `attachArticleFraming`. */
  coverFraming?: ImageFraming;
};

export type BookCard = {
  id: string;
  title: string;
  slug: string | null;
  author: string | null;
  genre: string | null;
  coverImage: string | null;
};

/**
 * A writer, reduced to what the Voices section can actually show. Every field
 * past `id`/`name` is optional and independently absent — the section renders a
 * portrait roster when they are all null and gains a voice line as they fill in.
 *
 * `creator_kind` is deliberately NOT mapped: it is "writer" for the entire
 * editorial board, so it rendered eight identical "Writer" labels. A field that
 * never varies is noise, not data. Re-map it only if the roster ever mixes kinds
 * (translator/photographer), and render it as a themes-row chip.
 */
export type WriterCard = {
  id: string;
  /** Never empty — `fetchWriters` drops nameless rows: a masthead entry with no
   * name carries no information, and labelling it "Writer" resurrects the exact
   * invariant string this type deleted. */
  name: string;
  avatar: string | null;
  /** Self-described role, e.g. "Essayist on exile and return". The reliable one. */
  headline: string | null;
  /** The writer's own words. Rare, but it is what the section is named for. */
  quote: string | null;
  /** Up to two subjects, title-cased. Last resort before name-only. */
  themes: string[];
  /** Admin-set framing for `avatar`, attached by `attachWriterFraming`. */
  avatarFraming?: ImageFraming;
  /** ISO code of the writer's own language — their quote may be Arabic under an
   * English UI, so the card resolves `dir` from this, not from the UI locale. */
  lang: string | null;
};

/**
 * CMS-editable editorial copy woven between the content sections. Each field
 * is already locale-resolved; empty strings mean "no override" and the
 * consuming component falls back to its i18n default.
 */
export type MagEditorialCopy = {
  /** Hero copy is a FALLBACK ONLY — a published issue's own title/subtitle
   * always wins the hero. Used for the window before any issue exists. */
  hero: HeroLocaleFields;
  manifesto: ManifestoLocaleFields;
  founder: FounderQuoteLocaleFields;
  founderAvatar?: string;
  /** CMS hero artwork — hero cover fallback when no issue is published. */
  heroArtwork?: string;
  /** Framing for `heroArtwork` specifically. It describes THAT photo, so it
   * must not be applied when an issue cover or page-hero wins the slot. */
  heroArtworkFraming?: ImageFraming;
  founderAvatarFraming?: ImageFraming;
  /** CMS hero CTA destinations. A CTA renders only when its label AND its
   * link are both set — a labelled button with nowhere to go is worse than
   * no button. Same fallback-only scope as `hero`. */
  heroPrimaryHref?: string;
  heroSecondaryHref?: string;
  newsletter: NewsletterCopyLocaleFields;
  newsletterFontScale?: number;
  support: SupportLocaleFields;
  supportFontScale?: number;
};

// ─── Mappers ────────────────────────────────────────────────────────────

function prettify(v: string | null | undefined): string | null {
  const s = (v ?? "").trim();
  if (!s) return null;
  return s
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function toIssueCard(it: MagazineIssue): IssueCard {
  return {
    id: it.id,
    title: it.title,
    subtitle: it.subtitle ?? null,
    slug: it.slug ?? null,
    coverImage: it.cover_image ?? null,
    excerpt: it.excerpt ?? null,
    editionNumber: it.edition_number ?? null,
    category: it.category ?? null,
    publishedAt: it.published_at ?? null,
    isCurrent: it.is_current ?? false,
  };
}

function toArticleCard(a: ArticleListItem): ArticleCard {
  const name =
    a.author?.full_name ??
    a.author?.profile?.display_name ??
    a.author?.username ??
    null;
  return {
    id: a.id,
    title: a.title,
    slug: a.slug,
    contentType: a.content_type,
    category: prettify(a.category),
    excerpt: a.excerpt ?? null,
    coverImage: a.cover_image ?? a.media_url ?? null,
    mediaDuration: a.media_duration ?? null,
    readingTime: a.reading_time ?? 0,
    publishedAt: a.published_at ?? null,
    authorName: name,
    authorAvatar: a.author?.profile?.avatar ?? null,
  };
}

function toBookCard(b: RawBook): BookCard {
  return {
    id: b.id,
    title: b.title,
    slug: b.slug ?? null,
    author: b.author ?? null,
    genre: prettify(b.genre),
    coverImage: b.cover_image ?? null,
  };
}

function clean(v: string | null | undefined): string | null {
  const s = (v ?? "").trim();
  return s || null;
}

/** Editors wrap quotes inconsistently; the card supplies its own gold mark.
 * ponytail: third copy of this 1-liner (Editions/, WritersShowContent). Hoist
 * to a shared util the next time a fourth caller needs it, not before. */
function stripQuotes(s: string | null): string | null {
  // Includes « » „ — Arabic editorial practice wraps quotes in guillemets.
  return clean(s?.replace(/^["“«„]+/, "").replace(/["”»]+$/, "") ?? null);
}

function toWriterCard(w: WriterProfile): WriterCard {
  const themes = Array.isArray(w.themes)
    ? w.themes.map(prettify).filter((t): t is string => Boolean(t)).slice(0, 2)
    : [];
  return {
    id: w.id,
    name: writerDisplayName(w),
    avatar: writerAvatar(w),
    headline: clean(w.headline),
    quote: stripQuotes(w.quote ?? null),
    themes,
    lang: clean(w.language),
  };
}

// ─── Section limits ─────────────────────────────────────────────────────

/** Per-section fetch limits, centralized so MagazineNextPage's Promise.all
 * reads as one call site instead of scattered magic numbers. */
export const SECTION_SIZES = {
  issues: 20,
  featured: 4,
  latest: 8,
  videos: 8,
  books: 12,
  writers: 8,
} as const;

// ─── Fetchers ────────────────────────────────────────────────────────────

/**
 * Resolve the magazine entity: the first published magazine record. Used only
 * to scope the newsletter subscription — the backend rejects a subscribe
 * without a real magazine_id. Returns null when no magazine is seeded.
 *
 * NOT used to filter articles/issues: an article's magazine membership is
 * carried by `product='magazine'`, not by `magazine_id`. A loose magazine-pool
 * article (the normal shape — created with product='magazine' and no issue)
 * has magazine_id null, so an equality filter on magazine_id would hide it.
 *
 * ponytail: assumes a single published magazine. If TTT ever runs multiple
 * magazines, resolve by slug here instead of "first published".
 */
export async function fetchMagazineId(): Promise<string | null> {
  const list = await getMagazines({ status: "published", limit: 1 });
  return list[0]?.id ?? null;
}

/** Newest published issues, newest first. [0] → hero; full row → carousel. */
export async function fetchIssues(
  locale: string,
  limit = 20,
): Promise<IssueCard[]> {
  const raw = await serverGet<Envelope<MagazineIssue>>("/magazine-issues", {
    limit,
    status: "published",
    dedupe: "group",
    viewer_lang: locale,
    sortBy: "published_at",
    order: "DESC",
  });
  return unwrapList(raw).map(toIssueCard);
}

/**
 * Attach cover framing to issue cards in ONE request for the whole set.
 * Separate from `fetchIssues` because the hero and the carousel share a single
 * fetch of issues, and framing should be fetched once for all of them.
 */
/**
 * Attach cover framing to article cards — one request for the whole set.
 * Callers pass every article on the page (featured + latest + videos) in a
 * single call so the page makes one framing request, not three.
 */
export async function attachArticleFraming(
  articles: ArticleCard[],
): Promise<ArticleCard[]> {
  if (articles.length === 0) return articles;
  const framings = await getFramingsServer(
    ARTICLE_COVER_FRAMING.entity,
    articles.map((a) => a.id),
    ARTICLE_COVER_FRAMING.field,
  );
  return articles.map((article) => {
    const coverFraming = framings[article.id]?.[ARTICLE_COVER_FRAMING.field];
    return coverFraming ? { ...article, coverFraming } : article;
  });
}

/** Attach avatar framing to writer cards — one request for the whole set. */
export async function attachWriterFraming(
  writers: WriterCard[],
): Promise<WriterCard[]> {
  if (writers.length === 0) return writers;
  const framings = await getFramingsServer(
    WRITER_AVATAR_FRAMING.entity,
    writers.map((w) => w.id),
    WRITER_AVATAR_FRAMING.field,
  );
  return writers.map((writer) => {
    const avatarFraming = framings[writer.id]?.[WRITER_AVATAR_FRAMING.field];
    return avatarFraming ? { ...writer, avatarFraming } : writer;
  });
}

export async function attachIssueFraming(issues: IssueCard[]): Promise<IssueCard[]> {
  if (issues.length === 0) return issues;
  const framings = await getFramingsServer(
    ISSUE_FRAMING_ENTITY,
    issues.map((i) => i.id),
    ISSUE_FRAMING_FIELD,
  );
  return issues.map((issue) => {
    const coverFraming = framings[issue.id]?.[ISSUE_FRAMING_FIELD];
    return coverFraming ? { ...issue, coverFraming } : issue;
  });
}

/**
 * The magazine's current issue (isCurrent = true), resolved to the viewer's
 * language server-side. Null when no issue has been marked current — callers
 * fall back to the newest published issue.
 */
export async function fetchCurrentIssue(
  locale: string,
): Promise<IssueCard | null> {
  const raw = await serverGet<MagazineIssue | { data?: MagazineIssue }>(
    "/magazine-issues/current",
    { viewer_lang: locale },
  );
  if (!raw) return null;
  const issue =
    "data" in raw ? (raw as { data?: MagazineIssue }).data : (raw as MagazineIssue);
  return issue?.id ? toIssueCard(issue) : null;
}

/**
 * Published magazine articles, newest first. `product` is load-bearing and is
 * NOT a parameter: GET /articles defaults an omitted product to 'main', so
 * dropping it would not remove a hardcoded value — it would silently pick the
 * other one, and this feed would render main-site content with no error and no
 * empty state. A route named /magazine serving the magazine product is a
 * specification. Optional content_type filter.
 */
export async function fetchArticles(
  locale: string,
  params: {
    limit?: number;
    content_type?: string;
    is_featured?: boolean;
  } = {},
): Promise<ArticleCard[]> {
  const raw = await serverGet<unknown>("/articles", {
    limit: params.limit ?? 8,
    status: "published",
    product: "magazine" satisfies ArticleProduct,
    dedupe: "group",
    viewer_lang: locale,
    sortBy: "published_at",
    order: "DESC",
    ...(params.content_type ? { content_type: params.content_type } : {}),
    ...(params.is_featured ? { is_featured: true } : {}),
  });
  return normalizeArticlesListPayload(raw).map(toArticleCard);
}

/** Multilingual books, translation-collapsed, newest first. */
export async function fetchBooks(locale: string, limit = 12): Promise<BookCard[]> {
  const raw = await serverGet<{ rows?: RawBook[]; data?: RawBook[] }>(
    "/knowledge/books",
    { limit, page: 1, dedupe: "group", viewer_lang: locale },
  );
  const rows = raw?.rows ?? raw?.data ?? (Array.isArray(raw) ? raw : []);
  return rows.map(toBookCard);
}

/** Editorial-board writers, falling back to the general writers list. */
export async function fetchWriters(locale: string, limit = 8): Promise<WriterCard[]> {
  // Filter BEFORE slicing: a nameless row must not consume one of `limit`.
  const named = (rows: WriterProfile[]) =>
    rows.map(toWriterCard).filter((c) => c.name !== "").slice(0, limit);

  const board = await serverGet<Envelope<WriterProfile>>("/writers/editorial-board", {
    viewer_lang: locale,
  });
  const list = named(unwrapList(board));
  if (list.length > 0) return list;

  const all = await serverGet<Envelope<WriterProfile>>("/writers", {
    limit,
    dedupe: "group",
    viewer_lang: locale,
  });
  return named(unwrapList(all));
}

/**
 * Recent contributions, shaped for the Support / Collaborations gallery.
 * Ported from the legacy magazine page — the CMS Support section edits this
 * gallery's heading copy, so the gallery has to exist for that copy to land.
 */
export async function fetchCollaborations(
  locale: string,
): Promise<CollaborationItem[]> {
  const raw = await serverGet<Envelope<RawContribution>>("/contributions", {
    page: 1,
    limit: 7,
    // Load-bearing, exactly like `product` on fetchArticles. GET /contributions
    // is unguarded and applies NO default status scoping, POST /contributions
    // accepts guest submissions, and new rows land as draft/pending — so
    // omitting this would publish the 7 newest unmoderated submissions,
    // anyone's, straight onto /magazine (a flagged row included, badge and all).
    status: "published",
  });
  return unwrapList(raw).map((c) => ({
    id: c.id,
    title: c.title || c.description?.slice(0, 60) || "Collaboration",
    type: c.type?.name || "Contribution",
    status: c.status ?? null,
    timeline: shortDate(c.submission_date, locale) || null,
    description: c.description || "",
  }));
}

/**
 * CMS-backed editorial copy for every admin-editable beat on this page.
 * Reuses the same parsers/pickers as the legacy magazine page; a missing
 * page, invisible section, or fetch failure resolves to empty fields so each
 * beat degrades to its i18n default.
 */
export async function fetchEditorialCopy(locale: string): Promise<MagEditorialCopy> {
  const page = await serverGet<CmsPage | { data: CmsPage }>(
    `/cms/pages/slug/${MAGAZINE_PAGE_SLUG}`,
  );
  const unwrapped = page
    ? ((page as { data?: CmsPage }).data ?? (page as CmsPage))
    : null;

  const pickVisible = (key: Parameters<typeof findSection>[1]) => {
    const s = findSection(unwrapped, key);
    return s && s.is_visible ? s : undefined;
  };

  const manifestoCfg = parseManifestoConfig(pickVisible("manifesto"));
  const founderCfg = parseFounderConfig(pickVisible("founderQuote"));
  // Hero copy is carried but only consumed when no issue is published — a
  // live issue's own title/subtitle always wins the hero (see MagHero).
  const heroCfg = parseHeroConfig(pickVisible("hero"));
  const newsletterCfg = parseNewsletterConfig(pickVisible("newsletterCopy"));
  const supportCfg = parseSupportConfig(pickVisible("supportCuration"));

  return {
    hero: pickHeroLocale(heroCfg, locale),
    manifesto: pickManifestoLocale(manifestoCfg, locale),
    founder: pickFounderLocale(founderCfg, locale),
    founderAvatar: founderCfg.avatar,
    founderAvatarFraming: founderCfg.avatarFraming,
    heroArtwork: heroCfg.artwork,
    heroArtworkFraming: heroCfg.artworkFraming,
    heroPrimaryHref: heroCfg.primaryHref,
    heroSecondaryHref: heroCfg.secondaryHref,
    newsletter: pickNewsletterLocale(newsletterCfg, locale),
    newsletterFontScale: newsletterCfg.fontScale,
    support: pickSupportLocale(supportCfg, locale),
    supportFontScale: supportCfg.fontScale,
  };
}

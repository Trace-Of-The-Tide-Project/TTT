/**
 * Server-side data layer for the magazine homepage (`/magazine`). Reuses
 * the magazine-next fetchers wherever the shape is identical (articles,
 * framing) and adds what's new to this editorial redesign: upcoming issues
 * and subscription plans. Same graceful-degradation contract throughout:
 * every fetch resolves to a safe empty value on failure so the page always
 * renders.
 */
import { fetchPlans, type SubscriptionPlan } from "@/lib/api/subscriptions";
import { getCollections, type CollectionItem } from "@/services/collections.service";
import { serverGet } from "@/lib/api/isomorphic-fetch";
import type { CmsPage } from "@/services/cms.service";
import type { ImageFraming } from "@/lib/image-framing";
import {
  MAGAZINE_PAGE_SLUG,
  findSection,
  parseHeroConfig,
  pickHeroLocale,
  parseActionCardConfig,
  pickActionCardLocale,
  parseRailHeaderConfig,
  pickRailHeaderLocale,
  parseClosingCtaConfig,
  pickClosingCtaLocale,
  type HeroLocaleFields,
  type ActionCardLocaleFields,
  type RailHeaderLocaleFields,
  type ClosingCtaLocaleFields,
  type MagazineSectionKey,
  type MagazineRailLayout,
} from "@/services/magazine-page.service";

export {
  attachArticleFraming,
  attachWriterFraming,
  attachIssueFraming,
  fetchArticles,
  fetchWriters,
  fetchIssues,
  fetchCurrentIssue,
  type ArticleCard,
  type IssueCard,
} from "@/components/home/magazine-next/data";

/** Per-section fetch limits. */
export const SECTION_SIZES = {
  /** High enough to never clip a real editorial board roster — this section
   * shows every writer an admin toggled on via /writers/editorial-board,
   * not a fixed page size. */
  boardWriters: 50,
  featured: 9,
  latest: 22,
  collections: 5,
} as const;

export type CollectionCard = {
  id: string;
  name: string;
  description: string | null;
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
    description: row.description ?? null,
    coverImage: row.cover_image ?? null,
    articleCount: row.article_count ?? row.count ?? contributions.length ?? 0,
    href: `/collections/${encodeURIComponent(row.id)}`,
  };
}

/** Site-global collections (no product scoping available on /collections). */
export async function fetchCollections(
  locale: string,
  limit = SECTION_SIZES.collections,
): Promise<CollectionCard[]> {
  try {
    const rows = await getCollections({ limit, dedupe: "group", viewer_lang: locale });
    return rows.map(toCollectionCard);
  } catch {
    return [];
  }
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

/**
 * CMS-editable editorial copy for every admin-editable section on this page.
 * Each field is already locale-resolved; empty strings mean "no override"
 * and the caller falls back to its i18n default. `visibility` reports which
 * sections are toggled on, so the caller can hide a whole rail (header +
 * cards) rather than just its header text.
 */
export type MagEditorialCopy = {
  hero: HeroLocaleFields;
  /** CMS hero artwork override — read at the FRONT of the existing hero
   * background fallback chain (issue cover > page-hero > CMS editorial >
   * first featured article > default image). */
  heroArtwork?: string;
  heroArtworkFraming?: ImageFraming;
  heroTitleFontSize?: number;
  actionCardJoin: ActionCardLocaleFields;
  actionCardJoinHref?: string;
  actionCardJoinTitleFontSize?: number;
  actionCardGift: ActionCardLocaleFields;
  actionCardGiftHref?: string;
  actionCardGiftTitleFontSize?: number;
  actionCardShare: ActionCardLocaleFields;
  actionCardShareHref?: string;
  actionCardShareTitleFontSize?: number;
  featuredHeader: RailHeaderLocaleFields;
  featuredHeaderTitleFontSize?: number;
  /** Featured content rail presentation — defaults to "editorial". */
  featuredLayout: MagazineRailLayout;
  collectionsHeader: RailHeaderLocaleFields;
  collectionsHeaderTitleFontSize?: number;
  latestHeader: RailHeaderLocaleFields;
  latestHeaderTitleFontSize?: number;
  /** Latest content rail presentation — defaults to "editorial". */
  latestLayout: MagazineRailLayout;
  plansHeader: RailHeaderLocaleFields;
  plansHeaderTitleFontSize?: number;
  closingCta: ClosingCtaLocaleFields;
  closingCtaHref?: string;
  closingCtaTitleFontSize?: number;
  /** Whether each CMS section is currently visible. Missing key = treat as
   * visible (matches `is_visible` defaulting to `true` on section create). */
  visibility: Partial<Record<MagazineSectionKey, boolean>>;
};

const EMPTY_EDITORIAL_COPY: MagEditorialCopy = {
  hero: {},
  actionCardJoin: {},
  actionCardGift: {},
  actionCardShare: {},
  featuredHeader: {},
  featuredLayout: "editorial",
  collectionsHeader: {},
  latestHeader: {},
  latestLayout: "editorial",
  plansHeader: {},
  closingCta: {},
  visibility: {},
};

/**
 * CMS-backed editorial copy for `/magazine`. A missing page, invisible
 * section, or fetch failure resolves to empty fields so every section
 * degrades to its i18n default — same graceful-degradation contract as
 * every other fetch in this file.
 */
export async function fetchEditorialCopy(locale: string): Promise<MagEditorialCopy> {
  let page: CmsPage | { data?: CmsPage } | null;
  try {
    page = await serverGet<CmsPage | { data: CmsPage }>(
      `/cms/pages/slug/${MAGAZINE_PAGE_SLUG}`,
    );
  } catch {
    return EMPTY_EDITORIAL_COPY;
  }
  const unwrapped = page
    ? ((page as { data?: CmsPage }).data ?? (page as CmsPage))
    : null;

  const visibility: Partial<Record<MagazineSectionKey, boolean>> = {};
  const pickVisible = (key: MagazineSectionKey) => {
    const s = findSection(unwrapped, key);
    visibility[key] = s?.is_visible ?? true;
    return s && s.is_visible ? s : undefined;
  };

  const heroCfg = parseHeroConfig(pickVisible("hero"));
  const joinCfg = parseActionCardConfig(pickVisible("actionCardJoin"));
  const giftCfg = parseActionCardConfig(pickVisible("actionCardGift"));
  const shareCfg = parseActionCardConfig(pickVisible("actionCardShare"));
  const featuredCfg = parseRailHeaderConfig(pickVisible("featuredHeader"));
  const collectionsCfg = parseRailHeaderConfig(pickVisible("collectionsHeader"));
  const latestCfg = parseRailHeaderConfig(pickVisible("latestHeader"));
  const plansCfg = parseRailHeaderConfig(pickVisible("plansHeader"));
  const closingCfg = parseClosingCtaConfig(pickVisible("closingCta"));

  return {
    hero: pickHeroLocale(heroCfg, locale),
    heroArtwork: heroCfg.artwork,
    heroArtworkFraming: heroCfg.artworkFraming,
    heroTitleFontSize: heroCfg.titleFontSize,
    actionCardJoin: pickActionCardLocale(joinCfg, locale),
    actionCardJoinHref: joinCfg.ctaHref,
    actionCardJoinTitleFontSize: joinCfg.titleFontSize,
    actionCardGift: pickActionCardLocale(giftCfg, locale),
    actionCardGiftHref: giftCfg.ctaHref,
    actionCardGiftTitleFontSize: giftCfg.titleFontSize,
    actionCardShare: pickActionCardLocale(shareCfg, locale),
    actionCardShareHref: shareCfg.ctaHref,
    actionCardShareTitleFontSize: shareCfg.titleFontSize,
    featuredHeader: pickRailHeaderLocale(featuredCfg, locale),
    featuredHeaderTitleFontSize: featuredCfg.titleFontSize,
    featuredLayout: featuredCfg.layout ?? "editorial",
    collectionsHeader: pickRailHeaderLocale(collectionsCfg, locale),
    collectionsHeaderTitleFontSize: collectionsCfg.titleFontSize,
    latestHeader: pickRailHeaderLocale(latestCfg, locale),
    latestHeaderTitleFontSize: latestCfg.titleFontSize,
    latestLayout: latestCfg.layout ?? "editorial",
    plansHeader: pickRailHeaderLocale(plansCfg, locale),
    plansHeaderTitleFontSize: plansCfg.titleFontSize,
    closingCta: pickClosingCtaLocale(closingCfg, locale),
    closingCtaHref: closingCfg.ctaHref,
    closingCtaTitleFontSize: closingCfg.titleFontSize,
    visibility,
  };
}

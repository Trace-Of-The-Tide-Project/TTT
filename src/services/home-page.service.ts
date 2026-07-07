/**
 * Home page CMS service.
 *
 * Models the per-section content of the public homepage in the generic
 * CMS (`/cms/pages/slug/home`). Mirrors `magazine-page.service.ts`:
 * each section type owns a typed config stored as JSON inside
 * CmsSection.config, with locale-keyed copy (`{ en?, ar?, fr?, es? }`)
 * so a single row carries all locales. The public page picks the active
 * locale at render time and falls back to i18n strings when missing.
 *
 * The homepage was previously hardcoded. These sections add admin
 * control over copy, ordering, and visibility. The *contents* of the
 * data rails (which articles/issues/people show) come live from the
 * backend APIs — only the framing copy + hero/CTA targets are editable.
 *
 * NOTE: a legacy `home` CMS page with a single `hero` section_type
 * (headline/subheadline/primary_cta) was seeded by the old admin tab.
 * The new section types use the `home_*` prefix so they coexist; the
 * new homepage reads only `home_*` sections, falling back to the seed
 * order when the page or a section is absent.
 */
import {
  createCmsPage,
  createCmsSection,
  getCmsPageBySlug,
  type CmsPage,
  type CmsSection,
} from "./cms.service";
import { routing } from "@/i18n/routing";

export const HOME_PAGE_SLUG = "home";

export const SUPPORTED_LOCALES = routing.locales;
export type HomeLocale = (typeof SUPPORTED_LOCALES)[number];

export type Localized<T> = Partial<Record<HomeLocale, T>>;

// ── Section type registry ──────────────────────────────────────────

export const HOME_SECTION_TYPES = {
  hero: "home_hero",
  spotlight: "home_spotlight",
  oralHistories: "home_oral_histories",
  magazineIssues: "home_magazine_issues",
  collections: "home_collections",
  people: "home_people",
  trips: "home_trips",
  bookClub: "home_book_club",
  contributeCta: "home_contribute_cta",
} as const;

export type HomeSectionKey = keyof typeof HOME_SECTION_TYPES;

/** Reverse lookup: section_type string → key. */
export const HOME_SECTION_KEY_BY_TYPE: Record<string, HomeSectionKey> =
  Object.fromEntries(
    (Object.keys(HOME_SECTION_TYPES) as HomeSectionKey[]).map((k) => [
      HOME_SECTION_TYPES[k],
      k,
    ]),
  ) as Record<string, HomeSectionKey>;

// ── Per-section config shapes ──────────────────────────────────────

/** Hero — mission-anchored lead. */
export type HeroLocaleFields = {
  /** Small eyebrow above the title (e.g. "A living archive"). */
  eyebrow?: string;
  title?: string;
  /** Mission sentence under the title. */
  subtitle?: string;
  primaryCtaLabel?: string;
  secondaryCtaLabel?: string;
};
/** Homepage visual direction selected by admin. Default = standard sections. */
export type HomeVariant = "d01" | "d02" | "d03";

export type HeroConfig = {
  copy: Localized<HeroLocaleFields>;
  artwork?: string;
  primaryHref?: string;
  secondaryHref?: string;
  /** When set, the entire homepage renders as a single full-page direction. */
  variant?: HomeVariant;
};
export const EMPTY_HERO_CONFIG: HeroConfig = { copy: {} };

/** A rail section: just heading + subheading copy. Data comes live. */
export type RailLocaleFields = {
  heading?: string;
  subheading?: string;
};
export type RailConfig = { copy: Localized<RailLocaleFields> };
export const EMPTY_RAIL_CONFIG: RailConfig = { copy: {} };

/** Spotlight — eyebrow + framing copy; the article itself is live. */
export type SpotlightLocaleFields = {
  eyebrow?: string;
  heading?: string;
};
export type SpotlightConfig = { copy: Localized<SpotlightLocaleFields> };
export const EMPTY_SPOTLIGHT_CONFIG: SpotlightConfig = { copy: {} };

/** Contribute CTA — copy + a link to a real open call. */
export type ContributeLocaleFields = {
  heading?: string;
  body?: string;
  ctaLabel?: string;
};
export type ContributeConfig = {
  copy: Localized<ContributeLocaleFields>;
  /** Open-call id the CTA links to; falls back to /contribute when empty. */
  openCallId?: string;
};
export const EMPTY_CONTRIBUTE_CONFIG: ContributeConfig = { copy: {} };

// ── Seed sections (default order) ──────────────────────────────────

export const SEED_SECTIONS: Array<{
  key: HomeSectionKey;
  title: string;
  order: number;
}> = [
  { key: "hero", title: "Hero", order: 1 },
  { key: "spotlight", title: "Spotlight Story", order: 2 },
  { key: "oralHistories", title: "Oral Histories & Testimonies", order: 3 },
  { key: "magazineIssues", title: "Magazine Issues", order: 4 },
  { key: "collections", title: "Curated Collections", order: 5 },
  { key: "people", title: "People of the Archive", order: 6 },
  { key: "trips", title: "Heritage Trips", order: 7 },
  { key: "bookClub", title: "Book Club", order: 8 },
  { key: "contributeCta", title: "Contribute", order: 9 },
];

/**
 * Ensure the home CMS page + all seed sections exist. Idempotent: safe
 * to call on every admin mount. Mirrors `ensureMagazinePage`.
 */
export async function ensureHomePage(): Promise<CmsPage> {
  let page: CmsPage;
  try {
    page = await getCmsPageBySlug(HOME_PAGE_SLUG);
  } catch {
    page = await createCmsPage({
      slug: HOME_PAGE_SLUG,
      title: "Home",
      page_type: "homepage",
    });
  }

  const existingTypes = new Set(page.sections.map((s) => s.section_type));
  const missing = SEED_SECTIONS.filter(
    (s) => !existingTypes.has(HOME_SECTION_TYPES[s.key]),
  );

  if (missing.length > 0) {
    for (const seed of missing) {
      await createCmsSection(page.id, {
        section_type: HOME_SECTION_TYPES[seed.key],
        title: seed.title,
        // Offset by 10 so new sections sort after any legacy `hero` row
        // but keep their relative seed order.
        section_order: seed.order + 10,
        config: JSON.stringify({ copy: {} }),
      });
    }
    page = await getCmsPageBySlug(HOME_PAGE_SLUG);
  }

  return page;
}

// ── Config parsing ─────────────────────────────────────────────────

/**
 * The CMS API returns `config` as a JSON-encoded **string**; older
 * paths sometimes pre-parse it into an object. Tolerate both.
 */
function unwrapConfig(
  section: CmsSection | undefined,
): Record<string, unknown> | null {
  const raw = section?.config;
  if (raw == null) return null;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object"
        ? (parsed as Record<string, unknown>)
        : null;
    } catch {
      return null;
    }
  }
  return raw as Record<string, unknown>;
}

export function findHomeSection(
  page: CmsPage | null | undefined,
  key: HomeSectionKey,
): CmsSection | undefined {
  if (!page) return undefined;
  return page.sections.find((s) => s.section_type === HOME_SECTION_TYPES[key]);
}

function parseLocaleKeyed<T>(
  section: CmsSection | undefined,
): Localized<T> {
  const cfg = unwrapConfig(section);
  if (!cfg) return {};
  const copyRaw = (cfg.copy as Record<string, unknown>) ?? {};
  const copy: Localized<T> = {};
  for (const loc of SUPPORTED_LOCALES) {
    const entry = copyRaw[loc];
    if (entry && typeof entry === "object") copy[loc] = entry as T;
  }
  return copy;
}

const HOME_VARIANTS: HomeVariant[] = ["d01", "d02", "d03"];

export function parseHeroConfig(section: CmsSection | undefined): HeroConfig {
  const cfg = unwrapConfig(section) ?? {};
  const rawVariant = cfg.variant;
  const variant: HomeVariant | undefined =
    typeof rawVariant === "string" && HOME_VARIANTS.includes(rawVariant as HomeVariant)
      ? (rawVariant as HomeVariant)
      : undefined;
  return {
    copy: parseLocaleKeyed<HeroLocaleFields>(section),
    artwork: typeof cfg.artwork === "string" ? cfg.artwork : undefined,
    primaryHref:
      typeof cfg.primaryHref === "string" ? cfg.primaryHref : undefined,
    secondaryHref:
      typeof cfg.secondaryHref === "string" ? cfg.secondaryHref : undefined,
    variant,
  };
}

export function parseRailConfig(section: CmsSection | undefined): RailConfig {
  return { copy: parseLocaleKeyed<RailLocaleFields>(section) };
}

export function parseSpotlightConfig(
  section: CmsSection | undefined,
): SpotlightConfig {
  return { copy: parseLocaleKeyed<SpotlightLocaleFields>(section) };
}

export function parseContributeConfig(
  section: CmsSection | undefined,
): ContributeConfig {
  const cfg = unwrapConfig(section) ?? {};
  return {
    copy: parseLocaleKeyed<ContributeLocaleFields>(section),
    openCallId:
      typeof cfg.openCallId === "string" ? cfg.openCallId : undefined,
  };
}

/** Pick the active-locale fields, falling back to `en`, then empty. */
export function pickLocale<T>(copy: Localized<T>, locale: string): T {
  const loc = SUPPORTED_LOCALES.includes(locale as HomeLocale)
    ? (locale as HomeLocale)
    : "en";
  return (copy[loc] ?? copy.en ?? {}) as T;
}

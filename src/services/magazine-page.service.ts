/**
 * Magazine page CMS service.
 *
 * Models the per-section content of the public `/magazine` page in the
 * generic CMS (`/cms/pages/slug/magazine`). Each section type owns a
 * typed config shape stored as JSON inside CmsSection.config.
 *
 * The config is locale-keyed (`{ en?, ar?, fr?, es? }`) so a single
 * section row carries copy for all locales. The public page picks the
 * active locale at render time and falls back to i18n strings when a
 * locale key is missing or empty.
 */
import {
  createCmsPage,
  createCmsSection,
  getCmsPageBySlug,
  type CmsPage,
  type CmsSection,
} from "./cms.service";

export const MAGAZINE_PAGE_SLUG = "magazine";

export const SUPPORTED_LOCALES = ["en", "ar", "fr", "es"] as const;
export type MagazineLocale = (typeof SUPPORTED_LOCALES)[number];

export type Localized<T> = Partial<Record<MagazineLocale, T>>;

// ── Section type registry ──────────────────────────────────────────

export const MAGAZINE_SECTION_TYPES = {
  hero: "magazine_hero",
  manifesto: "magazine_manifesto",
  founderQuote: "magazine_founder_quote",
  newsletterCopy: "magazine_newsletter_copy",
  supportCuration: "magazine_support_curation",
} as const;

export type MagazineSectionKey = keyof typeof MAGAZINE_SECTION_TYPES;

// ── Per-section config shapes ──────────────────────────────────────

/** Hero section editable fields. Locale-keyed. */
export type HeroLocaleFields = {
  title?: string;
  subtitle?: string;
  primaryCtaLabel?: string;
  secondaryCtaLabel?: string;
};

/** Hero config also carries non-localized fields (image, links). */
export type HeroConfig = {
  copy: Localized<HeroLocaleFields>;
  artwork?: string;
  primaryHref?: string;
  secondaryHref?: string;
};

export const EMPTY_HERO_CONFIG: HeroConfig = { copy: {} };

/** Manifesto — long-form per-locale copy plus the silk banner image
 * (shared across locales, same as Hero artwork). */
export type ManifestoLocaleFields = {
  philosophyHeading?: string;
  philosophyQuote?: string;
  visionHeading?: string;
  visionBody?: string;
  missionHeading?: string;
  missionBody?: string;
  valuesHeading?: string;
  closingQuote?: string;
};
export type ManifestoConfig = {
  copy: Localized<ManifestoLocaleFields>;
  banner?: string;
};
export const EMPTY_MANIFESTO_CONFIG: ManifestoConfig = { copy: {} };

/** Founder quote — quote/name/role per locale, avatar URL shared. */
export type FounderQuoteLocaleFields = {
  quote?: string;
  name?: string;
  role?: string;
};
export type FounderQuoteConfig = {
  copy: Localized<FounderQuoteLocaleFields>;
  avatar?: string;
};
export const EMPTY_FOUNDER_CONFIG: FounderQuoteConfig = { copy: {} };

/** Newsletter section copy — title + body per locale. */
export type NewsletterCopyLocaleFields = {
  title?: string;
  body?: string;
};
export type NewsletterCopyConfig = {
  copy: Localized<NewsletterCopyLocaleFields>;
};
export const EMPTY_NEWSLETTER_CONFIG: NewsletterCopyConfig = { copy: {} };

/** Support / Collaborations heading copy. Curation (which
 * contributions appear) is deferred — only copy is editable now. */
export type SupportLocaleFields = {
  heading?: string;
  subheading?: string;
};
export type SupportConfig = { copy: Localized<SupportLocaleFields> };
export const EMPTY_SUPPORT_CONFIG: SupportConfig = { copy: {} };

// ── Bootstrap ──────────────────────────────────────────────────────

const SEED_SECTIONS: Array<{
  key: MagazineSectionKey;
  title: string;
  order: number;
}> = [
  { key: "hero", title: "Magazine Hero", order: 1 },
  { key: "manifesto", title: "Manifesto", order: 2 },
  { key: "founderQuote", title: "Founder Quote", order: 3 },
  { key: "newsletterCopy", title: "Newsletter Copy", order: 4 },
  { key: "supportCuration", title: "Support / Collaborations", order: 5 },
];

/**
 * Ensure the magazine CMS page + all seed sections exist. Idempotent:
 * safe to call on every admin page mount. Pattern mirrors
 * `ensureMagazineIssueType` in contributions.service.ts.
 */
export async function ensureMagazinePage(): Promise<CmsPage> {
  let page: CmsPage;
  try {
    page = await getCmsPageBySlug(MAGAZINE_PAGE_SLUG);
  } catch {
    page = await createCmsPage({
      slug: MAGAZINE_PAGE_SLUG,
      title: "Magazine",
      page_type: "landing",
    });
  }

  const existingTypes = new Set(page.sections.map((s) => s.section_type));
  const missing = SEED_SECTIONS.filter(
    (s) => !existingTypes.has(MAGAZINE_SECTION_TYPES[s.key]),
  );

  if (missing.length > 0) {
    for (const seed of missing) {
      await createCmsSection(page.id, {
        section_type: MAGAZINE_SECTION_TYPES[seed.key],
        title: seed.title,
        section_order: seed.order,
        config: JSON.stringify({ copy: {} }),
      });
    }
    page = await getCmsPageBySlug(MAGAZINE_PAGE_SLUG);
  }

  return page;
}

// ── Parsers ────────────────────────────────────────────────────────

export function findSection(
  page: CmsPage | null | undefined,
  key: MagazineSectionKey,
): CmsSection | undefined {
  if (!page) return undefined;
  return page.sections.find(
    (s) => s.section_type === MAGAZINE_SECTION_TYPES[key],
  );
}

/**
 * The CMS API returns `config` as a JSON-encoded **string** (see the
 * UpdatePageSectionDto in the backend OpenAPI). Older code paths
 * sometimes also pre-parsed it into an object. Be tolerant of both.
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

export function parseHeroConfig(section: CmsSection | undefined): HeroConfig {
  const cfg = unwrapConfig(section);
  if (!cfg) return EMPTY_HERO_CONFIG;
  const copyRaw = (cfg.copy as Record<string, unknown>) ?? {};
  const copy: Localized<HeroLocaleFields> = {};
  for (const loc of SUPPORTED_LOCALES) {
    const entry = copyRaw[loc] as HeroLocaleFields | undefined;
    if (entry && typeof entry === "object") copy[loc] = entry;
  }
  return {
    copy,
    artwork: typeof cfg.artwork === "string" ? cfg.artwork : undefined,
    primaryHref:
      typeof cfg.primaryHref === "string" ? cfg.primaryHref : undefined,
    secondaryHref:
      typeof cfg.secondaryHref === "string" ? cfg.secondaryHref : undefined,
  };
}

/**
 * Pick the active-locale fields, returning empty object when missing
 * — caller treats empty values as "fall back to i18n".
 */
export function pickHeroLocale(
  cfg: HeroConfig,
  locale: string,
): HeroLocaleFields {
  return pickLocale(cfg.copy, locale);
}

function pickLocale<T>(copy: Localized<T>, locale: string): T | object {
  const loc = SUPPORTED_LOCALES.includes(locale as MagazineLocale)
    ? (locale as MagazineLocale)
    : "en";
  return copy[loc] ?? {};
}

// Parsers for the remaining sections. Each tolerates malformed config
// shapes and returns the empty config rather than throwing.

function parseLocaleKeyed<T>(
  section: CmsSection | undefined,
  empty: { copy: Localized<T> },
): { copy: Localized<T> } {
  const cfg = unwrapConfig(section);
  if (!cfg) return empty;
  const copyRaw = (cfg.copy as Record<string, unknown>) ?? {};
  const copy: Localized<T> = {};
  for (const loc of SUPPORTED_LOCALES) {
    const entry = copyRaw[loc];
    if (entry && typeof entry === "object") copy[loc] = entry as T;
  }
  return { copy };
}

export function parseManifestoConfig(
  section: CmsSection | undefined,
): ManifestoConfig {
  const base = parseLocaleKeyed<ManifestoLocaleFields>(
    section,
    EMPTY_MANIFESTO_CONFIG,
  );
  const cfg = unwrapConfig(section) ?? {};
  return {
    copy: base.copy,
    banner: typeof cfg.banner === "string" ? cfg.banner : undefined,
  };
}

export function parseFounderConfig(
  section: CmsSection | undefined,
): FounderQuoteConfig {
  const base = parseLocaleKeyed<FounderQuoteLocaleFields>(
    section,
    EMPTY_FOUNDER_CONFIG,
  );
  const cfg = unwrapConfig(section) ?? {};
  return {
    copy: base.copy,
    avatar: typeof cfg.avatar === "string" ? cfg.avatar : undefined,
  };
}

export function parseNewsletterConfig(
  section: CmsSection | undefined,
): NewsletterCopyConfig {
  return parseLocaleKeyed<NewsletterCopyLocaleFields>(
    section,
    EMPTY_NEWSLETTER_CONFIG,
  );
}

export function parseSupportConfig(
  section: CmsSection | undefined,
): SupportConfig {
  return parseLocaleKeyed<SupportLocaleFields>(section, EMPTY_SUPPORT_CONFIG);
}

export function pickManifestoLocale(
  cfg: ManifestoConfig,
  locale: string,
): ManifestoLocaleFields {
  return pickLocale(cfg.copy, locale) as ManifestoLocaleFields;
}

export function pickFounderLocale(
  cfg: FounderQuoteConfig,
  locale: string,
): FounderQuoteLocaleFields {
  return pickLocale(cfg.copy, locale) as FounderQuoteLocaleFields;
}

export function pickNewsletterLocale(
  cfg: NewsletterCopyConfig,
  locale: string,
): NewsletterCopyLocaleFields {
  return pickLocale(cfg.copy, locale) as NewsletterCopyLocaleFields;
}

export function pickSupportLocale(
  cfg: SupportConfig,
  locale: string,
): SupportLocaleFields {
  return pickLocale(cfg.copy, locale) as SupportLocaleFields;
}

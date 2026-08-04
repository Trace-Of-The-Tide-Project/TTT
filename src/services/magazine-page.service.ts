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
import { routing } from "@/i18n/routing";
import { clampFraming, type ImageFraming } from "@/lib/image-framing";

export const MAGAZINE_PAGE_SLUG = "magazine";

export const SUPPORTED_LOCALES = routing.locales;
export type MagazineLocale = (typeof SUPPORTED_LOCALES)[number];

export type Localized<T> = Partial<Record<MagazineLocale, T>>;

// ── Section type registry ──────────────────────────────────────────

export const MAGAZINE_SECTION_TYPES = {
  hero: "magazine_hero",
  actionCardJoin: "magazine_action_card_join",
  actionCardGift: "magazine_action_card_gift",
  actionCardShare: "magazine_action_card_share",
  featuredHeader: "magazine_featured_header",
  collectionsHeader: "magazine_collections_header",
  latestHeader: "magazine_latest_header",
  plansHeader: "magazine_plans_header",
  closingCta: "magazine_closing_cta",
} as const;

export type MagazineSectionKey = keyof typeof MAGAZINE_SECTION_TYPES;

// ── Per-section config shapes ──────────────────────────────────────

/** Hero section editable fields. Locale-keyed. Field names match the new
 * page's Hero component props (title/standfirst/readCtaLabel). */
export type HeroLocaleFields = {
  title?: string;
  standfirst?: string;
  ctaLabel?: string;
};

/** Hero config also carries non-localized fields (background image). */
export type HeroConfig = {
  copy: Localized<HeroLocaleFields>;
  artwork?: string;
  /** How `artwork` sits in the hero frame. Undefined = default framing. */
  artworkFraming?: ImageFraming;
  /** Admin-set title font size (px). Undefined = component default. */
  titleFontSize?: number;
};

export const EMPTY_HERO_CONFIG: HeroConfig = { copy: {} };

/** Action card — one shape, reused for the 3 action-card sections
 * (Join Collective / Send Gift / Share Story). */
export type ActionCardLocaleFields = {
  title?: string;
  body?: string;
  ctaLabel?: string;
};
export type ActionCardConfig = {
  copy: Localized<ActionCardLocaleFields>;
  ctaHref?: string;
  titleFontSize?: number;
};
export const EMPTY_ACTION_CARD_CONFIG: ActionCardConfig = { copy: {} };

/** Rail header — one shape, reused for Featured/Collections/Latest/Plans
 * section headers. No shared (non-localized) fields. */
export type RailHeaderLocaleFields = {
  title?: string;
  standfirst?: string;
};
export type RailHeaderConfig = {
  copy: Localized<RailHeaderLocaleFields>;
  titleFontSize?: number;
};
export const EMPTY_RAIL_HEADER_CONFIG: RailHeaderConfig = { copy: {} };

/** Closing CTA — the full-width "Share your story" section at the page's end. */
export type ClosingCtaLocaleFields = {
  heading?: string;
  standfirst?: string;
  ctaLabel?: string;
};
export type ClosingCtaConfig = {
  copy: Localized<ClosingCtaLocaleFields>;
  ctaHref?: string;
  titleFontSize?: number;
};
export const EMPTY_CLOSING_CTA_CONFIG: ClosingCtaConfig = { copy: {} };

// ── Bootstrap ──────────────────────────────────────────────────────

const SEED_SECTIONS: Array<{
  key: MagazineSectionKey;
  title: string;
  order: number;
}> = [
  { key: "hero", title: "Hero", order: 1 },
  { key: "actionCardJoin", title: "Action Card — Join Collective", order: 2 },
  { key: "actionCardGift", title: "Action Card — Send Gift", order: 3 },
  { key: "actionCardShare", title: "Action Card — Share Story", order: 4 },
  { key: "featuredHeader", title: "Featured Content Header", order: 5 },
  { key: "collectionsHeader", title: "Collections Header", order: 6 },
  { key: "latestHeader", title: "Latest Content Header", order: 7 },
  { key: "plansHeader", title: "Plans Header", order: 8 },
  { key: "closingCta", title: "Closing CTA", order: 9 },
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
  if (!page || !Array.isArray(page.sections)) return undefined;
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

/** Read an image-framing object out of raw config, if present and valid.
 * These parsers rebuild config key-by-key, so a framing key that is not read
 * here is silently dropped the next time the editor saves. */
function readFraming(
  cfg: Record<string, unknown> | null,
  key: string,
): ImageFraming | undefined {
  return cfg ? clampFraming(cfg[key]) : undefined;
}

/** Read a numeric px font size out of raw config, clamped to a sane range. */
function readFontSize(
  cfg: Record<string, unknown> | null,
  key = "titleFontSize",
): number | undefined {
  const v = cfg?.[key];
  if (typeof v !== "number" || !Number.isFinite(v)) return undefined;
  return Math.min(120, Math.max(10, Math.round(v)));
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
    artworkFraming: readFraming(cfg, "artworkFraming"),
    titleFontSize: readFontSize(cfg),
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

export function parseActionCardConfig(
  section: CmsSection | undefined,
): ActionCardConfig {
  const base = parseLocaleKeyed<ActionCardLocaleFields>(
    section,
    EMPTY_ACTION_CARD_CONFIG,
  );
  const cfg = unwrapConfig(section) ?? {};
  return {
    copy: base.copy,
    ctaHref: typeof cfg.ctaHref === "string" ? cfg.ctaHref : undefined,
    titleFontSize: readFontSize(cfg),
  };
}

export function parseRailHeaderConfig(
  section: CmsSection | undefined,
): RailHeaderConfig {
  const base = parseLocaleKeyed<RailHeaderLocaleFields>(
    section,
    EMPTY_RAIL_HEADER_CONFIG,
  );
  const cfg = unwrapConfig(section);
  return { copy: base.copy, titleFontSize: readFontSize(cfg) };
}

export function parseClosingCtaConfig(
  section: CmsSection | undefined,
): ClosingCtaConfig {
  const base = parseLocaleKeyed<ClosingCtaLocaleFields>(
    section,
    EMPTY_CLOSING_CTA_CONFIG,
  );
  const cfg = unwrapConfig(section) ?? {};
  return {
    copy: base.copy,
    ctaHref: typeof cfg.ctaHref === "string" ? cfg.ctaHref : undefined,
    titleFontSize: readFontSize(cfg),
  };
}

export function pickActionCardLocale(
  cfg: ActionCardConfig,
  locale: string,
): ActionCardLocaleFields {
  return pickLocale(cfg.copy, locale) as ActionCardLocaleFields;
}

export function pickRailHeaderLocale(
  cfg: RailHeaderConfig,
  locale: string,
): RailHeaderLocaleFields {
  return pickLocale(cfg.copy, locale) as RailHeaderLocaleFields;
}

export function pickClosingCtaLocale(
  cfg: ClosingCtaConfig,
  locale: string,
): ClosingCtaLocaleFields {
  return pickLocale(cfg.copy, locale) as ClosingCtaLocaleFields;
}

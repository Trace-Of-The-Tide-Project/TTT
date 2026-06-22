import type { CmsPage, CmsSection } from "@/services/cms.service";
import {
  HOME_SECTION_KEY_BY_TYPE,
  HOME_SECTION_TYPES,
  SEED_SECTIONS,
  findHomeSection,
  parseContributeConfig,
  parseHeroConfig,
  parseRailConfig,
  parseSpotlightConfig,
  pickLocale,
  type HomeSectionKey,
} from "@/services/home-page.service";
import type { HomeData, HomeOpenCall } from "@/lib/home/fetch-home-data";
import { homeCopy } from "./sections/homeCopy";
import { HomeHero } from "./sections/HomeHero";
import { HomeSpotlight } from "./sections/HomeSpotlight";
import { HomeOralHistories } from "./sections/HomeOralHistories";
import { HomeMagazineIssues } from "./sections/HomeMagazineIssues";
import { HomeCollections } from "./sections/HomeCollections";
import { HomePeople } from "./sections/HomePeople";
import { HomeTrips } from "./sections/HomeTrips";
import { HomeBookClub } from "./sections/HomeBookClub";
import { HomeContributeCta } from "./sections/HomeContributeCta";

/**
 * Renders the homepage from CMS sections — respecting admin order and
 * visibility — and falls back to the seed order when the CMS page (or a
 * section) is absent. Each section's *copy* comes from the CMS with a
 * bilingual fallback; each section's *data* comes from the live APIs
 * (HomeData). Sections hide themselves when their data rail is empty.
 *
 * This preserves the editor's reorder/toggle capability (the documented
 * trade-off: rail contents are live, not hand-curated).
 */
export function HomeSections({
  page,
  data,
  locale,
}: {
  page: CmsPage | null;
  data: HomeData;
  locale: string;
}) {
  const dir = locale === "ar" ? "rtl" : "ltr";
  const copy = homeCopy(locale);

  // Determine render order + visibility. Use CMS order for known
  // `home_*` sections; sections missing from the CMS still render
  // (visible) in their seed position so a freshly-seeded or partial page
  // is never blank.
  const ordered = resolveOrder(page);

  return (
    <>
      {ordered.map(({ key, section }) => {
        if (section && section.is_visible === false) return null;
        return renderSection(key, section, data, copy, dir);
      })}
    </>
  );
}

function resolveOrder(
  page: CmsPage | null,
): Array<{ key: HomeSectionKey; section: CmsSection | undefined }> {
  if (page) {
    const known = page.sections
      .filter((s) => HOME_SECTION_KEY_BY_TYPE[s.section_type])
      .sort((a, b) => a.section_order - b.section_order)
      .map((s) => ({
        key: HOME_SECTION_KEY_BY_TYPE[s.section_type]!,
        section: s as CmsSection | undefined,
      }));
    const present = new Set(known.map((k) => k.key));
    // Append any seed sections the CMS page doesn't have yet, in seed order.
    const missing = SEED_SECTIONS.filter((s) => !present.has(s.key)).map((s) => ({
      key: s.key,
      section: undefined as CmsSection | undefined,
    }));
    if (known.length > 0) return [...known, ...missing];
  }
  // No CMS page — pure seed order.
  return SEED_SECTIONS.map((s) => ({ key: s.key, section: undefined }));
}

function renderSection(
  key: HomeSectionKey,
  section: CmsSection | undefined,
  data: HomeData,
  copy: ReturnType<typeof homeCopy>,
  dir: "rtl" | "ltr",
) {
  const locale = dir === "rtl" ? "ar" : "en";

  switch (key) {
    case "hero": {
      const cfg = parseHeroConfig(section);
      return (
        <HomeHero
          key="hero"
          copy={pickLocale(cfg.copy, locale)}
          artwork={cfg.artwork}
          primaryHref={cfg.primaryHref}
          secondaryHref={cfg.secondaryHref}
          spotlight={data.spotlight}
          fallback={copy.hero}
          dir={dir}
        />
      );
    }
    case "spotlight": {
      const cfg = parseSpotlightConfig(section);
      const loc = pickLocale(cfg.copy, locale);
      return (
        <HomeSpotlight
          key="spotlight"
          article={data.spotlight}
          eyebrow={loc.eyebrow || copy.spotlight.eyebrow}
          readLabel={copy.spotlight.read}
          dir={dir}
        />
      );
    }
    case "oralHistories": {
      const loc = pickLocale(parseRailConfig(section).copy, locale);
      return (
        <HomeOralHistories
          key="oral"
          items={data.oralHistories}
          heading={loc.heading || copy.oral.heading}
          subheading={loc.subheading || copy.oral.subheading}
          viewAllHref="/content"
          viewAllLabel={copy.viewAll}
          dir={dir}
        />
      );
    }
    case "magazineIssues": {
      const loc = pickLocale(parseRailConfig(section).copy, locale);
      return (
        <HomeMagazineIssues
          key="issues"
          issues={data.issues}
          heading={loc.heading || copy.issues.heading}
          subheading={loc.subheading || copy.issues.subheading}
          viewAllHref="/magazine"
          viewAllLabel={copy.viewAll}
          crowdfundedLabel={copy.issues.crowdfunded}
          fundedLabel={copy.issues.funded}
          dir={dir}
        />
      );
    }
    case "collections": {
      const loc = pickLocale(parseRailConfig(section).copy, locale);
      return (
        <HomeCollections
          key="collections"
          collections={data.collections}
          heading={loc.heading || copy.collections.heading}
          subheading={loc.subheading || copy.collections.subheading}
          viewAllHref="/content"
          viewAllLabel={copy.viewAll}
          piecesLabel={copy.collections.pieces}
          dir={dir}
        />
      );
    }
    case "people": {
      const loc = pickLocale(parseRailConfig(section).copy, locale);
      return (
        <HomePeople
          key="people"
          people={data.people}
          heading={loc.heading || copy.people.heading}
          subheading={loc.subheading || copy.people.subheading}
          viewAllHref="/people"
          viewAllLabel={copy.viewAll}
          dir={dir}
        />
      );
    }
    case "trips": {
      const loc = pickLocale(parseRailConfig(section).copy, locale);
      return (
        <HomeTrips
          key="trips"
          trips={data.trips}
          heading={loc.heading || copy.trips.heading}
          subheading={loc.subheading || copy.trips.subheading}
          viewAllHref="/trips"
          viewAllLabel={copy.viewAll}
          dir={dir}
        />
      );
    }
    case "bookClub": {
      const loc = pickLocale(parseRailConfig(section).copy, locale);
      return (
        <HomeBookClub
          key="bookclub"
          items={data.bookClub}
          heading={loc.heading || copy.bookClub.heading}
          subheading={loc.subheading || copy.bookClub.subheading}
          dir={dir}
        />
      );
    }
    case "contributeCta": {
      const cfg = parseContributeConfig(section);
      const loc = pickLocale(cfg.copy, locale);
      const openCall: HomeOpenCall | null =
        (cfg.openCallId
          ? data.openCalls.find((o) => o.id === cfg.openCallId)
          : null) ?? data.primaryOpenCall;
      return (
        <HomeContributeCta
          key="contribute"
          copy={loc}
          openCall={openCall}
          fallback={{
            heading: copy.contribute.heading,
            body: copy.contribute.body,
            ctaLabel: copy.contribute.cta,
          }}
          dir={dir}
        />
      );
    }
    default:
      return null;
  }
}

// Re-export so the page can reference the type id if needed.
export { HOME_SECTION_TYPES };

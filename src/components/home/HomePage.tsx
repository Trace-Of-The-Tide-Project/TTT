import type { CmsPage, CmsSection } from "@/services/cms.service";
import {
  HOME_NEXT_SEED_SECTIONS,
  parseHeroConfig,
  parseRailConfig,
  pickLocale,
  resolveSectionOrder,
  type HomeSectionKey,
} from "@/services/home-page.service";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { Hero } from "./Hero";
import { Pillars } from "./Pillars";
import { ArchiveFeed } from "./ArchiveFeed";
import { Voices } from "./Voices";
import { Editions } from "./Editions";

/**
 * Homepage-rebuild composition (Sessions 0–6), now CMS-controllable: order
 * and visibility come from the `home_next_*` CMS sections (admin editor's
 * Home tab), falling back to this file's seed order when the CMS page or a
 * section is absent — the page never renders blank. Each section's copy
 * comes from CMS config with an i18n fallback; data stays live per section.
 * Lenis smooth scroll is scoped here so other routes keep native scroll.
 * NOTE: no CSS scroll-snap anywhere on this page — it conflicts with Lenis.
 */
export function HomePage({
  page,
  locale = "en",
}: {
  page?: CmsPage | null;
  locale?: string;
}) {
  const ordered = resolveSectionOrder(page, HOME_NEXT_SEED_SECTIONS);

  return (
    <SmoothScroll>
      <main className="bg-[var(--tott-home-surface)]">
        {ordered.map(({ key, section }) => {
          if (section && section.is_visible === false) return null;
          return renderSection(key, section, locale);
        })}
      </main>
    </SmoothScroll>
  );
}

function renderSection(key: HomeSectionKey, section: CmsSection | undefined, locale: string) {
  switch (key) {
    case "heroNext": {
      const cfg = parseHeroConfig(section);
      const loc = pickLocale(cfg.copy, locale);
      return <Hero key="hero" copy={{ eyebrow: loc.eyebrow, title: loc.title, subtitle: loc.subtitle }} />;
    }
    case "pillars": {
      const loc = pickLocale(parseRailConfig(section).copy, locale);
      return <Pillars key="pillars" copy={loc} />;
    }
    case "archiveFeed": {
      const loc = pickLocale(parseRailConfig(section).copy, locale);
      return <ArchiveFeed key="archive" copy={loc} />;
    }
    case "voices": {
      const loc = pickLocale(parseRailConfig(section).copy, locale);
      return <Voices key="voices" copy={loc} />;
    }
    case "editions": {
      const loc = pickLocale(parseRailConfig(section).copy, locale);
      return <Editions key="editions" copy={loc} />;
    }
    default:
      return null;
  }
}

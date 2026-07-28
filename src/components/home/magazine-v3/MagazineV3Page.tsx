import { getTranslations } from "next-intl/server";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { getPageHero } from "@/services/media-library.service";
import { PersonPlusIcon, GiftIcon, PenLineIcon } from "@/components/ui/icons";
import {
  attachArticleFraming,
  attachWriterFraming,
  fetchArticles,
  fetchCollections,
  fetchWriters,
  V3_SECTION_SIZES,
} from "./data";
import { shortDate } from "@/components/home/magazine-next/ui";
import { dirFor } from "@/i18n/dir";
import { V3Hero, V3HeroSlider, type HeroSlide } from "./V3Hero";
import { V3ActionTiles, type ActionTile } from "./V3ActionTiles";
import { V3SectionHeader } from "./V3SectionHeader";
import { V3ContentCard } from "./V3ContentCard";
import { V3Honeycomb, V3HoneycombFallback, chunkHoneycombRows } from "./V3Honeycomb";
import { V3CollectionCard } from "./V3CollectionCard";
import { V3ShareStory } from "./V3ShareStory";

/**
 * Figma-redesign magazine homepage preview (`/magazine-v3`). Server
 * component: all data in one Promise.all, each fetch resolves to [] on
 * failure, each section renders null with no data — page always renders.
 *
 * Only the six sections present in the Figma frame ship here: Hero, Action
 * tiles, Feature content, Collections, Latest content, Share your story.
 * Everything else on the live /magazine (issues, books, videos, voices,
 * founder note, newsletter) is intentionally NOT carried over — see the
 * plan's "Not doing" section.
 */
export async function MagazineV3Page({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "MagazineV3" });

  const [featuredRaw, latestRaw, collections, pageHeroUrl, boardWriters] = await Promise.all([
    fetchArticles(locale, { limit: V3_SECTION_SIZES.featured, is_featured: true }),
    fetchArticles(locale, { limit: V3_SECTION_SIZES.latest }),
    fetchCollections(locale, V3_SECTION_SIZES.collections),
    getPageHero("magazine-landing"),
    fetchWriters(locale, V3_SECTION_SIZES.boardWriters),
  ]);

  // Feature falls back to the newest articles when nothing is admin-flagged,
  // same pattern as magazine-next. When falling back, cap the borrow to
  // roughly half the pool instead of the full featured-section size — with
  // few real articles, slicing the whole pool into "featured" left nothing
  // for "latest" and the section silently vanished. Latest excludes
  // whatever featured took so the two grids don't repeat cards.
  const featured =
    featuredRaw.length > 0
      ? featuredRaw
      : latestRaw.slice(0, Math.min(V3_SECTION_SIZES.featured, Math.ceil(latestRaw.length / 2)));
  const featuredIds = new Set(featured.map((a) => a.id));
  const latest = latestRaw.filter((a) => !featuredIds.has(a.id));

  // Framing fetched once for the union of every article on the page.
  const framedArticles = await attachArticleFraming([...featured, ...latest]);
  const framedById = new Map(framedArticles.map((a) => [a.id, a]));
  const withFraming = (list: typeof featured) =>
    list.map((a) => framedById.get(a.id) ?? a);

  // Hero slider shows the Board (editorial_board=true, toggled in the admin
  // Writers table) — the masthead strip, not a content feed.
  const framedWriters = await attachWriterFraming(boardWriters);
  const heroSlides: HeroSlide[] = framedWriters.map((w) => ({
    id: w.id,
    name: w.name,
    avatar: w.avatar,
    href: `/writers/${encodeURIComponent(w.id)}`,
    lang: w.lang,
  }));

  // getPageHero("magazine-landing") returns null when no admin has set a
  // hero image for this slot in the media library — fall back to the first
  // featured article's cover so the hero background is never empty in
  // practice. (Not a writer avatar — a portrait isn't a hero-worthy backdrop.)
  const heroBackground = pageHeroUrl || withFraming(featured)[0]?.coverImage || null;

  const actionTiles: ActionTile[] = [
    {
      id: "join",
      icon: <PersonPlusIcon />,
      title: t("actions.join.title"),
      body: t("actions.join.body"),
      ctaLabel: t("actions.join.cta"),
      href: "/subscribe",
    },
    {
      id: "gift",
      icon: <GiftIcon />,
      title: t("actions.gift.title"),
      body: t("actions.gift.body"),
      ctaLabel: t("actions.gift.cta"),
      href: "/subscribe?intent=gift",
    },
    {
      id: "share",
      icon: <PenLineIcon />,
      title: t("actions.share.title"),
      body: t("actions.share.body"),
      ctaLabel: t("actions.share.cta"),
      href: "/writing-room",
    },
  ];

  const featuredCards = withFraming(featured).map((article) => (
    <V3ContentCard
      key={article.id}
      article={article}
      editionLabel={t("edition")}
      dateLabel={shortDate(article.publishedAt, locale) || null}
    />
  ));
  const latestCards = withFraming(latest).map((article) => (
    <V3ContentCard
      key={article.id}
      article={article}
      editionLabel={t("edition")}
      dateLabel={shortDate(article.publishedAt, locale) || null}
    />
  ));

  return (
    <SmoothScroll>
      <main className="min-h-screen bg-[var(--tott-home-surface)] text-[var(--tott-home-text-warm)]" style={{ fontFamily: "var(--font-body-ui)" }}>
        <V3Hero
          title={t("hero.title")}
          standfirst={t("hero.standfirst")}
          ctaLabel={t("hero.cta")}
          ctaHref="/content/magazine"
          backgroundImage={heroBackground}
        />

        <V3HeroSlider
          heading={t("board.heading")}
          slides={heroSlides}
          prevLabel={t("carousel.prev")}
          nextLabel={t("carousel.next")}
          isRtl={dirFor(locale) === "rtl"}
        />

        <div className="py-16">
          <V3ActionTiles tiles={actionTiles} />
        </div>

        {featured.length > 0 ? (
          <section id="feature-content" className="py-8">
            <V3SectionHeader
              id="feature-content-heading"
              title={t("feature.title")}
              standfirst={t("feature.standfirst")}
              viewMoreLabel={t("viewMore")}
              viewMoreHref="/magazine"
            />
            <div className="mt-10">
              <V3Honeycomb rows={chunkHoneycombRows(featuredCards)} />
              <V3HoneycombFallback items={featuredCards} />
            </div>
          </section>
        ) : null}

        {collections.length > 0 ? (
          <section id="collections" className="py-8">
            <V3SectionHeader
              id="collections-heading"
              title={t("collections.title")}
              standfirst={t("collections.standfirst")}
              viewMoreLabel={t("viewMore")}
              viewMoreHref="/collections"
            />
            <div className="mt-10 flex items-start justify-center gap-2 overflow-x-auto px-6 pb-2 sm:px-10 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {collections.map((c) => (
                <V3CollectionCard
                  key={c.id}
                  collection={c}
                  articlesLabel={c.articleCount > 0 ? t("articleCount", { count: c.articleCount }) : null}
                />
              ))}
            </div>
          </section>
        ) : null}

        {latest.length > 0 ? (
          <section id="latest-content" className="py-8">
            <V3SectionHeader
              id="latest-content-heading"
              title={t("latest.title")}
              standfirst={t("latest.standfirst")}
              viewMoreLabel={t("viewMore")}
              viewMoreHref="/magazine"
            />
            <div className="mt-10">
              <V3Honeycomb rows={chunkHoneycombRows(latestCards)} />
              <V3HoneycombFallback items={latestCards} />
            </div>
          </section>
        ) : null}

        <V3ShareStory
          icon={<PenLineIcon />}
          heading={t("shareStory.heading")}
          standfirst={t("shareStory.standfirst")}
          ctaLabel={t("shareStory.cta")}
          ctaHref="/writing-room"
        />
      </main>
    </SmoothScroll>
  );
}

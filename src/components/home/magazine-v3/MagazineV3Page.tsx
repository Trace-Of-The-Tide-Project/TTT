import { getTranslations } from "next-intl/server";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { getPageHero } from "@/services/media-library.service";
import { getFramingsServer } from "@/services/image-framing.service";
import { PenLineIcon } from "@/components/ui/icons";
import {
  attachArticleFraming,
  attachWriterFraming,
  attachIssueFraming,
  fetchArticles,
  fetchWriters,
  fetchIssues,
  fetchCurrentIssue,
  fetchEditorialCopy,
  fetchUpcomingIssues,
  fetchPlansSafe,
  fetchCollections,
  V3_SECTION_SIZES,
} from "./data";
import { shortDate } from "@/components/home/magazine-next/ui";
import { V3Hero, type HeroSlide } from "./V3Hero";
import { V3QuoteBreak } from "./V3QuoteBreak";
import { V3SectionDivider } from "./V3SectionDivider";
import { V3UpcomingIssues } from "./V3UpcomingIssues";
import { V3FeaturedRail, V3LatestRail } from "./V3FeaturedRail";
import { V3ContentCard } from "./V3ContentCard";
import { V3CollectionsRow } from "./V3CollectionsRow";
import { V3Philosophy } from "./V3Philosophy";
import { V3ReadingExperience } from "./V3ReadingExperience";
import { V3Plans } from "./V3Plans";
import { V3ShareStory } from "./V3ShareStory";

function formatReleaseDate(locale: string, iso: string): string {
  const formatter = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" });
  return formatter.format(new Date(iso));
}

/**
 * Premium editorial magazine homepage (`/magazine-v3`). Server component:
 * all data in one Promise.all, each fetch resolves to a safe empty value on
 * failure, each section renders null with no data — the page always renders.
 *
 * Section order: Hero → Editorial quote → Upcoming issues → Featured
 * articles → Magazine philosophy (incl. the editorial board strip) →
 * Reading experience → Subscription plans → Closing CTA. See the redesign
 * plan for what replaced the previous action-tiles/collections layout.
 */
export async function MagazineV3Page({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "MagazineV3" });
  // Plan feature slugs (e.g. "shop_discount") are translated via the same
  // `subscribe.features.*` table the live /subscribe page uses, so both
  // pages agree on copy and a new plan feature only needs adding once.
  const tSubscribe = await getTranslations({ locale, namespace: "subscribe" });
  const featureLabel = (slug: string) => {
    try {
      return tSubscribe(`features.${slug}` as Parameters<typeof tSubscribe>[0]);
    } catch {
      return slug;
    }
  };

  const [
    featuredRaw,
    latestRaw,
    pageHeroUrl,
    boardWriters,
    upcomingIssues,
    plans,
    issues,
    currentIssue,
    editorial,
    collections,
    pageHeroFramings,
  ] = await Promise.all([
    fetchArticles(locale, { limit: V3_SECTION_SIZES.featured, is_featured: true }),
    fetchArticles(locale, { limit: V3_SECTION_SIZES.latest }),
    getPageHero("magazine-landing"),
    fetchWriters(locale, V3_SECTION_SIZES.boardWriters),
    fetchUpcomingIssues(V3_SECTION_SIZES.upcoming),
    fetchPlansSafe(),
    fetchIssues(locale, 1),
    fetchCurrentIssue(locale),
    fetchEditorialCopy(locale),
    fetchCollections(locale, V3_SECTION_SIZES.collections),
    getFramingsServer("page_hero", ["magazine-landing"], "image"),
  ]);

  // Same hero resolution as the live /magazine hero (MagazineNextPage.tsx):
  // the admin-chosen current issue leads; else the newest published issue.
  const framedIssues = await attachIssueFraming(
    currentIssue && !issues.some((i) => i.id === currentIssue.id)
      ? [...issues, currentIssue]
      : issues,
  );
  const heroIssue = currentIssue
    ? (framedIssues.find((i) => i.id === currentIssue.id) ?? currentIssue)
    : framedIssues[0];

  // Feature falls back to the newest articles when nothing is admin-flagged,
  // same pattern as magazine-next: cap the borrow to roughly half the pool
  // so a small article count doesn't leave "latest" empty. Latest excludes
  // whatever featured took so the two grids don't repeat cards.
  const featured =
    featuredRaw.length > 0
      ? featuredRaw
      : latestRaw.slice(0, Math.min(V3_SECTION_SIZES.featured, Math.ceil(latestRaw.length / 2)));
  const featuredIds = new Set(featured.map((a) => a.id));
  const latest = latestRaw.filter((a) => !featuredIds.has(a.id));

  const framedArticles = await attachArticleFraming([...featured, ...latest]);
  const framedById = new Map(framedArticles.map((a) => [a.id, a]));
  const withFraming = (list: typeof featured) => list.map((a) => framedById.get(a.id) ?? a);

  const framedWriters = await attachWriterFraming(boardWriters);
  const heroSlides: HeroSlide[] = framedWriters.map((w) => ({
    id: w.id,
    name: w.name,
    avatar: w.avatar,
    href: `/writers/${encodeURIComponent(w.id)}`,
    lang: w.lang,
  }));

  // Hero cover fallback for the window before any issue is published — same
  // two admin-controlled sources the live /magazine hero uses, in the same
  // order; the issue's own cover still wins once an issue exists. Framing
  // follows the image it was tuned for, never the slot.
  const heroFallbackArtwork = pageHeroUrl || editorial.heroArtwork || null;
  const heroFallbackFraming = pageHeroUrl
    ? pageHeroFramings["magazine-landing"]?.image
    : editorial.heroArtwork
      ? editorial.heroArtworkFraming
      : undefined;

  const heroBackground =
    heroIssue?.coverImage || heroFallbackArtwork || withFraming(featured)[0]?.coverImage || "/images/image.png";
  const heroBackgroundFraming = heroIssue?.coverImage
    ? heroIssue.coverFraming
    : heroFallbackArtwork
      ? heroFallbackFraming
      : undefined;

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

  const philosophyBeats = [
    { title: t("philosophy.beats.1.title"), body: t("philosophy.beats.1.body") },
    { title: t("philosophy.beats.2.title"), body: t("philosophy.beats.2.body") },
    { title: t("philosophy.beats.3.title"), body: t("philosophy.beats.3.body") },
  ];

  const readingFeatures = [1, 2, 3, 4, 5, 6].map((n) => ({
    title: t(`reading.features.${n}.title`),
    body: t(`reading.features.${n}.body`),
  }));

  return (
    <SmoothScroll>
      <main
        className="min-h-screen bg-[var(--tott-home-surface)] text-[var(--tott-home-text-warm)]"
        style={{ fontFamily: "var(--font-body-ui)" }}
      >
        <V3Hero
          eyebrow={t("meta.eyebrow")}
          title={t("hero.title")}
          standfirst={t("hero.standfirst")}
          readCtaLabel={t("hero.ctaRead")}
          readCtaHref={heroIssue?.slug ? `/magazine-issues/${encodeURIComponent(heroIssue.slug)}` : "/content/magazine"}
          subscribeCtaLabel={t("hero.ctaSubscribe")}
          subscribeCtaHref="/subscribe"
          backgroundImage={heroBackground}
          backgroundFraming={heroBackgroundFraming}
          issueLabel={heroIssue?.title ?? null}
        />

        <V3QuoteBreak quote={t("quote.text")} attribution={t("quote.attribution")} />

        <V3SectionDivider />

        <V3UpcomingIssues
          issues={upcomingIssues}
          title={t("upcoming.title")}
          standfirst={t("upcoming.standfirst")}
          viewMoreLabel={t("viewMore")}
          statusLabels={{
            comingSoon: t("upcoming.status.comingSoon"),
            inProduction: t("upcoming.status.inProduction"),
            researchPhase: t("upcoming.status.researchPhase"),
          }}
          releaseTbaLabel={t("upcoming.releaseTba")}
          formatReleaseLabel={(iso) => formatReleaseDate(locale, iso)}
        />

        <V3FeaturedRail
          cards={featuredCards}
          title={t("featured.title")}
          standfirst={t("featured.standfirst")}
          viewMoreLabel={t("viewMore")}
        />

        <V3CollectionsRow
          collections={collections}
          title={t("collections.title")}
          standfirst={t("collections.standfirst")}
          viewMoreLabel={t("viewMore")}
          articleCountLabel={(count) => t("articleCount", { count })}
        />

        <V3LatestRail
          cards={latestCards}
          title={t("latest.title")}
          standfirst={t("latest.standfirst")}
          viewMoreLabel={t("viewMore")}
        />

        <V3SectionDivider />

        <V3Philosophy
          title={t("philosophy.title")}
          beats={philosophyBeats}
          boardHeading={t("board.heading")}
          boardSlides={heroSlides}
          carouselPrevLabel={t("carousel.prev")}
          carouselNextLabel={t("carousel.next")}
          locale={locale}
        />

        <V3ReadingExperience
          title={t("reading.title")}
          standfirst={t("reading.standfirst")}
          features={readingFeatures}
        />

        <V3SectionDivider />

        <V3Plans
          plans={plans}
          title={t("plans.title")}
          standfirst={t("plans.standfirst")}
          locale={locale}
          perMonthLabel={t("plans.perMonth")}
          recommendedLabel={t("plans.recommended")}
          ctaLabel={t("plans.cta")}
          featureLabel={featureLabel}
        />

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

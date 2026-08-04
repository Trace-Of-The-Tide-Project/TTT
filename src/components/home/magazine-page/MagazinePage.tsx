import { getTranslations } from "next-intl/server";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { getPageHero } from "@/services/media-library.service";
import { getFramingsServer } from "@/services/image-framing.service";
import { PenLineIcon } from "@/components/ui/icons";
import { dirFor } from "@/i18n/dir";
import {
  attachArticleFraming,
  attachWriterFraming,
  attachIssueFraming,
  fetchArticles,
  fetchWriters,
  fetchIssues,
  fetchCurrentIssue,
  fetchEditorialCopy,
  fetchPlansSafe,
  fetchCollections,
  SECTION_SIZES,
} from "./data";
import { shortDate } from "@/components/home/magazine-next/ui";
import { Hero, type HeroSlide } from "./Hero";
import { InnerSectionCards } from "./InnerSectionCards";
import { FeaturedRail, LatestRail } from "./FeaturedRail";
import { ContentCard } from "./ContentCard";
import { CollectionsRow } from "./CollectionsRow";
import { Plans } from "./Plans";
import { ShareStory } from "./ShareStory";

/**
 * Premium editorial magazine homepage (`/magazine`) — a 1:1 build of the
 * Figma frame `2196:4901`. Server component: all data in one Promise.all,
 * each fetch resolves to a safe empty value on failure, each section
 * renders null with no data — the page always renders.
 *
 * Section order: Hero (+ overlapping board slider) → 3 action cards →
 * Feature content → Collections → Latest content → Subscription plans
 * (kept by request, no Figma node) → Closing CTA.
 */
export async function MagazinePage({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "Magazine" });
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
    plans,
    issues,
    currentIssue,
    editorial,
    collections,
    pageHeroFramings,
  ] = await Promise.all([
    fetchArticles(locale, { limit: SECTION_SIZES.featured, is_featured: true }),
    fetchArticles(locale, { limit: SECTION_SIZES.latest }),
    getPageHero("magazine-landing"),
    fetchWriters(locale, SECTION_SIZES.boardWriters),
    fetchPlansSafe(),
    fetchIssues(locale, 1),
    fetchCurrentIssue(locale),
    fetchEditorialCopy(locale),
    fetchCollections(locale, SECTION_SIZES.collections),
    getFramingsServer("page_hero", ["magazine-landing"], "image"),
  ]);

  // Admin-chosen current issue leads; else the newest published issue.
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
      : latestRaw.slice(0, Math.min(SECTION_SIZES.featured, Math.ceil(latestRaw.length / 2)));
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
  const heroFallbackArtwork = editorial.heroArtwork || pageHeroUrl || null;
  const heroFallbackFraming = editorial.heroArtwork
    ? editorial.heroArtworkFraming
    : pageHeroUrl
      ? pageHeroFramings["magazine-landing"]?.image
      : undefined;

  const heroBackground =
    heroIssue?.coverImage || heroFallbackArtwork || withFraming(featured)[0]?.coverImage || "/images/image.png";
  const heroBackgroundFraming = heroIssue?.coverImage
    ? heroIssue.coverFraming
    : heroFallbackArtwork
      ? heroFallbackFraming
      : undefined;

  const featuredCards = withFraming(featured).map((article) => (
    <ContentCard
      key={article.id}
      article={article}
      editionLabel={t("edition")}
      dateLabel={shortDate(article.publishedAt, locale) || null}
    />
  ));
  const latestCards = withFraming(latest).map((article) => (
    <ContentCard
      key={article.id}
      article={article}
      editionLabel={t("edition")}
      dateLabel={shortDate(article.publishedAt, locale) || null}
    />
  ));

  const isRtl = dirFor(locale) === "rtl";

  return (
    <SmoothScroll>
      <main
        className="min-h-screen bg-[var(--tott-home-surface)] text-[var(--tott-home-text-warm)]"
        style={{ fontFamily: "var(--font-body-ui)" }}
      >
        <Hero
          eyebrow={t("meta.eyebrow")}
          title={heroIssue?.title || editorial.hero.title || t("hero.title")}
          standfirst={editorial.hero.standfirst || t("hero.standfirst")}
          readCtaLabel={editorial.hero.ctaLabel || t("hero.ctaRead")}
          readCtaHref={heroIssue?.slug ? `/magazine-issues/${encodeURIComponent(heroIssue.slug)}` : null}
          noIssueLabel={t("hero.noIssue")}
          backgroundImage={heroBackground}
          backgroundFraming={heroBackgroundFraming}
          issueLabel={heroIssue?.title ?? null}
          slides={heroSlides}
          carouselPrevLabel={t("carousel.prev")}
          carouselNextLabel={t("carousel.next")}
          isRtl={isRtl}
          titleFontSize={editorial.heroTitleFontSize}
        />

        <InnerSectionCards
          join={{
            title: editorial.actionCardJoin.title || t("innerCards.1.title"),
            body: editorial.actionCardJoin.body || t("innerCards.1.body"),
            ctaLabel: editorial.actionCardJoin.ctaLabel || t("innerCards.1.cta"),
            ctaHref: editorial.actionCardJoinHref || "/collectives",
            titleFontSize: editorial.actionCardJoinTitleFontSize,
          }}
          gift={{
            title: editorial.actionCardGift.title || t("innerCards.2.title"),
            body: editorial.actionCardGift.body || t("innerCards.2.body"),
            ctaLabel: editorial.actionCardGift.ctaLabel || t("innerCards.2.cta"),
            ctaHref: editorial.actionCardGiftHref || "/subscribe",
            titleFontSize: editorial.actionCardGiftTitleFontSize,
          }}
          share={{
            title: editorial.actionCardShare.title || t("innerCards.3.title"),
            body: editorial.actionCardShare.body || t("innerCards.3.body"),
            ctaLabel: editorial.actionCardShare.ctaLabel || t("innerCards.3.cta"),
            ctaHref: editorial.actionCardShareHref || "/writing-room",
            titleFontSize: editorial.actionCardShareTitleFontSize,
          }}
        />

        {editorial.visibility.featuredHeader !== false ? (
          <FeaturedRail
            cards={featuredCards}
            title={editorial.featuredHeader.title || t("featured.title")}
            standfirst={editorial.featuredHeader.standfirst || t("featured.standfirst")}
            viewMoreLabel={t("viewMore")}
            titleFontSize={editorial.featuredHeaderTitleFontSize}
          />
        ) : null}

        {editorial.visibility.collectionsHeader !== false ? (
          <CollectionsRow
            collections={collections}
            title={editorial.collectionsHeader.title || t("collections.title")}
            standfirst={editorial.collectionsHeader.standfirst || t("collections.standfirst")}
            viewMoreLabel={t("viewMore")}
            articleCountLabel={(count) => t("articleCount", { count })}
            titleFontSize={editorial.collectionsHeaderTitleFontSize}
          />
        ) : null}

        {editorial.visibility.latestHeader !== false ? (
          <LatestRail
            cards={latestCards}
            title={editorial.latestHeader.title || t("latest.title")}
            standfirst={editorial.latestHeader.standfirst || t("latest.standfirst")}
            viewMoreLabel={t("viewMore")}
            titleFontSize={editorial.latestHeaderTitleFontSize}
          />
        ) : null}

        {editorial.visibility.plansHeader !== false ? (
          <Plans
            plans={plans}
            title={editorial.plansHeader.title || t("plans.title")}
            standfirst={editorial.plansHeader.standfirst || t("plans.standfirst")}
            locale={locale}
            perMonthLabel={t("plans.perMonth")}
            recommendedLabel={t("plans.recommended")}
            ctaLabel={t("plans.cta")}
            featureLabel={featureLabel}
            showMoreLabel={(count) => t("plans.showMore", { count })}
            showLessLabel={t("plans.showLess")}
            titleFontSize={editorial.plansHeaderTitleFontSize}
          />
        ) : null}

        {editorial.visibility.closingCta !== false ? (
          <ShareStory
            icon={<PenLineIcon />}
            heading={editorial.closingCta.heading || t("shareStory.heading")}
            standfirst={editorial.closingCta.standfirst || t("shareStory.standfirst")}
            ctaLabel={editorial.closingCta.ctaLabel || t("shareStory.cta")}
            ctaHref={editorial.closingCtaHref || "/writing-room"}
            titleFontSize={editorial.closingCtaTitleFontSize}
          />
        ) : null}
      </main>
    </SmoothScroll>
  );
}

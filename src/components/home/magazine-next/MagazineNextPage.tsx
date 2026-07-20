import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { MagazineNewsletter } from "@/components/home/magazine/MagazineNewsletter";
import { MagazineSupport } from "@/components/home/magazine/MagazineSupport";
import { getPageHero } from "@/services/media-library.service";
import { getFramingsServer } from "@/services/image-framing.service";
import { MagHero } from "./MagHero";
import { MagFeatured } from "./MagFeatured";
import { MagLatestFeed } from "./MagLatestFeed";
import { MagIssuesRow } from "./MagIssuesRow";
import { MagBooksShelf } from "./MagBooksShelf";
import { MagVideosRow } from "./MagVideosRow";
import { MagVoices } from "./MagVoices";
import { MagOpeningLine } from "./MagOpeningLine";
import { MagQuoteBreak } from "./MagQuoteBreak";
import { MagValuesTicker } from "./MagValuesTicker";
import { MagFounderNote } from "./MagFounderNote";
import {
  attachArticleFraming,
  attachIssueFraming,
  attachWriterFraming,
  fetchArticles,
  fetchBooks,
  fetchCollaborations,
  fetchCurrentIssue,
  fetchEditorialCopy,
  fetchIssues,
  fetchMagazineId,
  fetchWriters,
  SECTION_SIZES,
} from "./data";

/**
 * Scroll-first magazine homepage composition (rebuild). Server component:
 * all data fetched in one Promise.all and threaded down as
 * presentation-ready cards. Each fetch resolves to [] on failure and each
 * section renders null when it has no data, so the page always renders and
 * sparse sections simply drop out.
 *
 * Lenis smooth scroll is scoped here so other routes keep native scroll.
 * NO CSS scroll-snap anywhere — it conflicts with Lenis.
 */
export async function MagazineNextPage({ locale }: { locale: string }) {
  // Magazine articles are separated from main-site rows by product='magazine'
  // (all content types share the articles table), which fetchArticles sends.
  // magazineId is only needed to scope the newsletter subscription.
  const [
    magazineId,
    issues,
    currentIssue,
    featuredRaw,
    articles,
    videos,
    books,
    writers,
    editorial,
    pageHeroUrl,
    collaborations,
    pageHeroFramings,
  ] = await Promise.all([
    fetchMagazineId(),
    fetchIssues(locale, SECTION_SIZES.issues),
    fetchCurrentIssue(locale),
    fetchArticles(locale, { limit: SECTION_SIZES.featured, is_featured: true }),
    fetchArticles(locale, { limit: SECTION_SIZES.latest }),
    fetchArticles(locale, { limit: SECTION_SIZES.videos, content_type: "video" }),
    fetchBooks(locale, SECTION_SIZES.books),
    fetchWriters(locale, SECTION_SIZES.writers),
    fetchEditorialCopy(locale),
    getPageHero("magazine-landing"),
    fetchCollaborations(locale),
    getFramingsServer("page_hero", ["magazine-landing"], "image"),
  ]);

  // Framing lookups need the ids the fetches above just returned, so they form
  // a second round — three requests total (issues, articles, writers), each
  // covering every card of its kind on the page.
  // `currentIssue` is appended only when it is not already in the list, so the
  // first `issues.length` entries keep the carousel's order.
  const [framedIssues, framedArticles, framedWriters] = await Promise.all([
    attachIssueFraming(
      currentIssue && !issues.some((i) => i.id === currentIssue.id)
        ? [...issues, currentIssue]
        : issues,
    ),
    attachArticleFraming([...featuredRaw, ...articles, ...videos]),
    attachWriterFraming(writers),
  ]);
  const carouselIssues = framedIssues.slice(0, issues.length);

  // The three article lists overlap (a featured article is usually also in
  // latest), so framing is fetched once for the union and redistributed here.
  const framedById = new Map(framedArticles.map((a) => [a.id, a]));
  const withFraming = (list: typeof articles) =>
    list.map((a) => framedById.get(a.id) ?? a);

  // The admin-chosen current issue leads; fall back to the newest published.
  const heroIssue = currentIssue
    ? (framedIssues.find((i) => i.id === currentIssue.id) ?? currentIssue)
    : carouselIssues[0];

  // Featured block: prefer admin-flagged articles; fall back to the newest
  // articles so the lead is never empty when nothing is flagged.
  const featured = withFraming(
    featuredRaw.length > 0 ? featuredRaw : articles.slice(0, SECTION_SIZES.featured),
  );

  // Hero cover fallback for the window before any issue is published. Same
  // two admin-controlled sources the legacy /magazine hero uses, in the same
  // order; the issue's own cover still wins once an issue exists.
  const heroFallbackArtwork = pageHeroUrl || editorial.heroArtwork || null;

  // Framing follows the image it was tuned for, never the slot. Whichever
  // source wins above brings its own framing, and a crop set for one photo is
  // never applied to another.
  const heroFallbackFraming = pageHeroUrl
    ? pageHeroFramings["magazine-landing"]?.image
    : editorial.heroArtwork
      ? editorial.heroArtworkFraming
      : undefined;

  return (
    <SmoothScroll>
      <main className="min-h-screen bg-[var(--tott-home-surface)] text-[var(--tott-home-text-warm)]">
        <MagHero
          issue={heroIssue}
          fallbackArtwork={heroFallbackArtwork}
          fallbackCopy={editorial.hero}
          fallbackArtworkFraming={heroFallbackFraming}
          fallbackPrimaryHref={editorial.heroPrimaryHref}
          fallbackSecondaryHref={editorial.heroSecondaryHref}
        />
        <MagOpeningLine copy={editorial.manifesto} />
        <MagFeatured articles={featured} locale={locale} />
        <MagQuoteBreak copy={editorial.manifesto} locale={locale} />
        <MagLatestFeed articles={withFraming(articles)} locale={locale} />
        <MagIssuesRow issues={carouselIssues} />
        <MagBooksShelf books={books} />
        <MagValuesTicker />
        <MagVideosRow videos={withFraming(videos)} />
        <MagFounderNote
          founder={editorial.founder}
          avatar={editorial.founderAvatar}
          avatarFraming={editorial.founderAvatarFraming}
          locale={locale}
        />
        <MagVoices writers={framedWriters} locale={locale} />
        {collaborations.length > 0 ? (
          <div className="px-6 pb-8 sm:px-10 lg:px-16">
            <MagazineSupport
              collaborations={collaborations}
              headingOverride={editorial.support.heading}
              subheadingOverride={editorial.support.subheading}
              fontScale={editorial.supportFontScale}
            />
          </div>
        ) : null}
        <div id="magazine-newsletter">
          <MagazineNewsletter
            locale={locale}
            magazineId={magazineId}
            titleOverride={editorial.newsletter.title}
            bodyOverride={editorial.newsletter.body}
            fontScale={editorial.newsletterFontScale}
          />
        </div>
      </main>
    </SmoothScroll>
  );
}

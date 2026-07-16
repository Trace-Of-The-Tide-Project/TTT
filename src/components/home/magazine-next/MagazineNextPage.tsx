import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { MagazineNewsletter } from "@/components/home/magazine/MagazineNewsletter";
import { getPageHero } from "@/services/media-library.service";
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
  fetchArticles,
  fetchBooks,
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
    featuredRaw,
    articles,
    videos,
    books,
    writers,
    editorial,
    pageHeroUrl,
  ] = await Promise.all([
    fetchMagazineId(),
    fetchIssues(locale, SECTION_SIZES.issues),
    fetchArticles(locale, { limit: SECTION_SIZES.featured, is_featured: true }),
    fetchArticles(locale, { limit: SECTION_SIZES.latest }),
    fetchArticles(locale, { limit: SECTION_SIZES.videos, content_type: "video" }),
    fetchBooks(locale, SECTION_SIZES.books),
    fetchWriters(locale, SECTION_SIZES.writers),
    fetchEditorialCopy(locale),
    getPageHero("magazine-landing"),
  ]);

  // Featured block: prefer admin-flagged articles; fall back to the newest
  // articles so the lead is never empty when nothing is flagged.
  const featured =
    featuredRaw.length > 0 ? featuredRaw : articles.slice(0, SECTION_SIZES.featured);

  // Hero cover fallback for the window before any issue is published. Same
  // two admin-controlled sources the legacy /magazine hero uses, in the same
  // order; the issue's own cover still wins once an issue exists.
  const heroFallbackArtwork = pageHeroUrl || editorial.heroArtwork || null;

  return (
    <SmoothScroll>
      <main className="min-h-screen bg-[var(--tott-home-surface)] text-[var(--tott-home-text-warm)]">
        <MagHero issue={issues[0]} fallbackArtwork={heroFallbackArtwork} />
        <MagOpeningLine copy={editorial.manifesto} />
        <MagFeatured articles={featured} locale={locale} />
        <MagQuoteBreak copy={editorial.manifesto} locale={locale} />
        <MagLatestFeed articles={articles} locale={locale} />
        <MagIssuesRow issues={issues} />
        <MagBooksShelf books={books} />
        <MagValuesTicker />
        <MagVideosRow videos={videos} />
        <MagFounderNote
          founder={editorial.founder}
          avatar={editorial.founderAvatar}
          locale={locale}
        />
        <MagVoices writers={writers} locale={locale} />
        <div id="magazine-newsletter">
          <MagazineNewsletter locale={locale} magazineId={magazineId} />
        </div>
      </main>
    </SmoothScroll>
  );
}

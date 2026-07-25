import {
  AllContentListingPage,
  buildListingMetadata,
} from "@/components/content/hub/AllContentListing";

// Highly dynamic (new articles publish anytime) — never cache, same as the
// /content hub.
export const dynamic = "force-dynamic";

export const generateMetadata = () => buildListingMetadata("allArticles");

/** `/content/article` — browse-all-articles page (linked from the Atrium's "see everything" end cap). */
export default function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  return (
    <AllContentListingPage
      contentType="article"
      routePath="/content/article"
      keyPrefix="allArticles"
      searchParams={searchParams}
    />
  );
}

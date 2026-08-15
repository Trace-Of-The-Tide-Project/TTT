import {
  AllContentListingPage,
  buildListingMetadata,
} from "@/components/content/hub/AllContentListing";

// Highly dynamic (new opinion pieces publish anytime) — never cache, same as
// the /content hub and /content/article.
export const dynamic = "force-dynamic";

export const generateMetadata = () => buildListingMetadata("allOpinion");

/** `/content/opinion` — browse-all-opinion-pieces page. FR-OPN-02: independent of the issue cycle, always commons. */
export default function OpinionPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  return (
    <AllContentListingPage
      contentType="opinion"
      routePath="/content/opinion"
      keyPrefix="allOpinion"
      searchParams={searchParams}
    />
  );
}

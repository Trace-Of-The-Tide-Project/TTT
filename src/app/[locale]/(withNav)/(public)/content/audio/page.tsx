import {
  AllContentListingPage,
  buildListingMetadata,
} from "@/components/content/hub/AllContentListing";

// Highly dynamic (new audio publishes anytime) — never cache, same as the
// /content hub.
export const dynamic = "force-dynamic";

export const generateMetadata = () => buildListingMetadata("allAudio");

/** `/content/audio` — browse-all-audio page. */
export default function AudioPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  return (
    <AllContentListingPage
      contentType="audio"
      routePath="/content/audio"
      keyPrefix="allAudio"
      searchParams={searchParams}
    />
  );
}

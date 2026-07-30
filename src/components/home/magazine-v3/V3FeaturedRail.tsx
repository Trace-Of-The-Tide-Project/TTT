import type { ReactNode } from "react";
import { V3SectionHeader } from "./V3SectionHeader";
import { V3Honeycomb, V3HoneycombFallback, chunkHoneycombRows } from "./V3Honeycomb";

/**
 * Generic honeycomb article-grid section — cards are pre-built by the
 * caller (server component owns the article fetch + framing + i18n
 * formatting). Shared by Featured and Latest content so both grids stay
 * visually identical, just with a different id/heading/href.
 */
function V3ArticleHoneycombSection({
  cards,
  sectionId,
  title,
  standfirst,
  viewMoreLabel,
  viewMoreHref,
}: {
  cards: ReactNode[];
  sectionId: string;
  title: string;
  standfirst: string;
  viewMoreLabel: string;
  viewMoreHref: string;
}) {
  if (cards.length === 0) return null;
  const headingId = `${sectionId}-heading`;

  return (
    <section id={sectionId} aria-labelledby={headingId} className="py-8">
      <V3SectionHeader
        id={headingId}
        title={title}
        standfirst={standfirst}
        viewMoreLabel={viewMoreLabel}
        viewMoreHref={viewMoreHref}
      />
      <div className="mt-10">
        <V3Honeycomb rows={chunkHoneycombRows(cards)} />
        <V3HoneycombFallback items={cards} />
      </div>
    </section>
  );
}

export function V3FeaturedRail(props: {
  cards: ReactNode[];
  title: string;
  standfirst: string;
  viewMoreLabel: string;
}) {
  return (
    <V3ArticleHoneycombSection
      {...props}
      sectionId="feature-content"
      viewMoreHref="/magazine"
    />
  );
}

export function V3LatestRail(props: {
  cards: ReactNode[];
  title: string;
  standfirst: string;
  viewMoreLabel: string;
}) {
  return (
    <V3ArticleHoneycombSection
      {...props}
      sectionId="latest-content"
      viewMoreHref="/magazine"
    />
  );
}

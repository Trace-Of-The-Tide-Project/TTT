import type { ReactNode } from "react";
import { SectionHeader } from "./SectionHeader";
import { Honeycomb, HoneycombFallback, chunkHoneycombRows } from "./Honeycomb";

/**
 * Generic honeycomb article-grid section — cards are pre-built by the
 * caller (server component owns the article fetch + framing + i18n
 * formatting). Shared by Featured and Latest content so both grids stay
 * visually identical, just with a different id/heading/href.
 */
function ArticleHoneycombSection({
  cards,
  sectionId,
  title,
  standfirst,
  viewMoreLabel,
  viewMoreHref,
  titleFontSize,
}: {
  cards: ReactNode[];
  sectionId: string;
  title: string;
  standfirst: string;
  viewMoreLabel: string;
  viewMoreHref: string;
  titleFontSize?: number;
}) {
  if (cards.length === 0) return null;
  const headingId = `${sectionId}-heading`;

  return (
    <section id={sectionId} aria-labelledby={headingId} className="py-8">
      <SectionHeader
        id={headingId}
        title={title}
        standfirst={standfirst}
        viewMoreLabel={viewMoreLabel}
        viewMoreHref={viewMoreHref}
        titleFontSize={titleFontSize}
      />
      <div className="mt-10">
        <Honeycomb rows={chunkHoneycombRows(cards)} />
        <HoneycombFallback items={cards} />
      </div>
    </section>
  );
}

export function FeaturedRail(props: {
  cards: ReactNode[];
  title: string;
  standfirst: string;
  viewMoreLabel: string;
  titleFontSize?: number;
}) {
  return (
    <ArticleHoneycombSection
      {...props}
      sectionId="feature-content"
      viewMoreHref="/magazine"
    />
  );
}

export function LatestRail(props: {
  cards: ReactNode[];
  title: string;
  standfirst: string;
  viewMoreLabel: string;
  titleFontSize?: number;
}) {
  return (
    <ArticleHoneycombSection
      {...props}
      sectionId="latest-content"
      viewMoreHref="/magazine"
    />
  );
}

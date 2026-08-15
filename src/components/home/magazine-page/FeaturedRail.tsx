import { SectionHeader } from "./SectionHeader";
import { Honeycomb, HoneycombFallback, chunkHoneycombRows } from "./Honeycomb";
import { EditorialGrid } from "./EditorialGrid";
import { ContentCard } from "./ContentCard";
import type { ArticleCard } from "./data";
import type { MagazineRailLayout } from "@/services/magazine-page.service";

/**
 * Generic article-rail section — articles are pre-fetched/framed by the
 * caller (server component owns the article fetch + framing + i18n
 * formatting). Shared by Featured and Latest content so both rails stay
 * wired identically, just with a different id/heading/href/layout.
 */
function ArticleRailSection({
  articles,
  editionLabel,
  dateLabelFor,
  layout,
  sectionId,
  title,
  standfirst,
  viewMoreLabel,
  viewMoreHref,
  titleFontSize,
}: {
  articles: ArticleCard[];
  editionLabel: string;
  dateLabelFor: (article: ArticleCard) => string | null;
  layout: MagazineRailLayout;
  sectionId: string;
  title: string;
  standfirst: string;
  viewMoreLabel: string;
  viewMoreHref: string;
  titleFontSize?: number;
}) {
  if (articles.length === 0) return null;
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
      <div className="mx-auto mt-6 max-w-6xl px-6 sm:px-10">
        {layout === "editorial" ? (
          <EditorialGrid articles={articles} editionLabel={editionLabel} dateLabelFor={dateLabelFor} />
        ) : (
          (() => {
            const cards = articles.map((article) => (
              <ContentCard
                key={article.id}
                article={article}
                editionLabel={editionLabel}
                dateLabel={dateLabelFor(article)}
              />
            ));
            return (
              <>
                <Honeycomb rows={chunkHoneycombRows(cards)} />
                <HoneycombFallback items={cards} />
              </>
            );
          })()
        )}
      </div>
    </section>
  );
}

type RailProps = {
  articles: ArticleCard[];
  editionLabel: string;
  dateLabelFor: (article: ArticleCard) => string | null;
  layout: MagazineRailLayout;
  title: string;
  standfirst: string;
  viewMoreLabel: string;
  titleFontSize?: number;
};

export function FeaturedRail(props: RailProps) {
  return <ArticleRailSection {...props} sectionId="feature-content" viewMoreHref="/magazine" />;
}

export function LatestRail(props: RailProps) {
  return <ArticleRailSection {...props} sectionId="latest-content" viewMoreHref="/magazine" />;
}

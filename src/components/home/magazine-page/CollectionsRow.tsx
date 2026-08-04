import { SectionHeader } from "./SectionHeader";
import { CollectionCard } from "./CollectionCard";
import type { CollectionCard as CollectionCardData } from "./data";

/**
 * Collections section (Figma: flush 5-column grid, cards bleeding past the
 * content edge at desktop). Below `lg` there's no room for 5 flush 276px
 * cards, so it degrades to a horizontal scroll row — Figma is desktop-only
 * here, this is the derived mobile/tablet behavior. Renders null when
 * empty.
 */
export function CollectionsRow({
  collections,
  title,
  standfirst,
  viewMoreLabel,
  articleCountLabel,
  titleFontSize,
}: {
  collections: CollectionCardData[];
  title: string;
  standfirst: string;
  viewMoreLabel: string;
  /** i18n interpolator, e.g. (count) => t("articleCount", { count }). */
  articleCountLabel: (count: number) => string;
  titleFontSize?: number;
}) {
  if (collections.length === 0) return null;

  return (
    <section id="collections" aria-labelledby="collections-heading" className="py-8">
      <SectionHeader
        id="collections-heading"
        title={title}
        standfirst={standfirst}
        viewMoreLabel={viewMoreLabel}
        viewMoreHref="/collections"
        titleFontSize={titleFontSize}
      />
      <div className="mt-10 flex items-start gap-2 overflow-x-auto px-6 pb-2 sm:px-10 lg:justify-center lg:overflow-visible [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {collections.map((c) => (
          <CollectionCard
            key={c.id}
            collection={c}
            articlesLabel={c.articleCount > 0 ? articleCountLabel(c.articleCount) : null}
          />
        ))}
      </div>
    </section>
  );
}

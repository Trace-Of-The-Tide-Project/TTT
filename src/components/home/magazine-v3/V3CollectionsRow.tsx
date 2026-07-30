import { V3SectionHeader } from "./V3SectionHeader";
import { V3CollectionCard } from "./V3CollectionCard";
import type { CollectionCard } from "./data";

/** Collections section — horizontal scroll row of hex-clipped collection
 * cards, restored from the original V3 layout. Renders null when empty. */
export function V3CollectionsRow({
  collections,
  title,
  standfirst,
  viewMoreLabel,
  articleCountLabel,
}: {
  collections: CollectionCard[];
  title: string;
  standfirst: string;
  viewMoreLabel: string;
  /** i18n interpolator, e.g. (count) => t("articleCount", { count }). */
  articleCountLabel: (count: number) => string;
}) {
  if (collections.length === 0) return null;

  return (
    <section id="collections" aria-labelledby="collections-heading" className="py-8">
      <V3SectionHeader
        id="collections-heading"
        title={title}
        standfirst={standfirst}
        viewMoreLabel={viewMoreLabel}
        viewMoreHref="/collections"
      />
      <div className="mt-10 flex items-start justify-center gap-2 overflow-x-auto px-6 pb-2 sm:px-10 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {collections.map((c) => (
          <V3CollectionCard
            key={c.id}
            collection={c}
            articlesLabel={c.articleCount > 0 ? articleCountLabel(c.articleCount) : null}
          />
        ))}
      </div>
    </section>
  );
}

import type { ArticleCard } from "./data";
import { ContentCard } from "./ContentCard";

/**
 * Editorial 3-column composition: dominant center feature, two independent
 * side rails of equal width. Alternative to `Honeycomb` for Feature/Latest
 * content — selected per-rail via CMS (see `MagazineRailLayout` in
 * magazine-page.service.ts).
 *
 * Column ratio is a fixed 0.85fr/1.7fr/0.85fr split of the shared
 * container (2 rails) or 1.7fr/0.85fr (1 rail) — plain `fr` tracks, no
 * oversized `minmax` floor, so the composition can't collapse into "tiny
 * side card, huge center, dead space" at any container width. When only
 * one rail has articles the empty track is dropped instead of left blank.
 *
 * Handles any article count: the first article always leads center, the
 * rest alternate into the left/right rails so both grow evenly (a single
 * leftover goes to the left rail alone). A single article still renders
 * (feature only, no rails, center column only).
 */
export function EditorialGrid({
  articles,
  editionLabel,
  dateLabelFor,
}: {
  articles: ArticleCard[];
  editionLabel: string;
  dateLabelFor: (article: ArticleCard) => string | null;
}) {
  if (articles.length === 0) return null;
  const [feature, ...rest] = articles;
  // Alternate into both rails so they grow evenly for any count — except a
  // single leftover article, which goes on the left alone rather than
  // leaving the right rail's grid track empty and lopsided.
  const left = rest.length === 1 ? rest : rest.filter((_, i) => i % 2 === 0);
  const right = rest.length === 1 ? [] : rest.filter((_, i) => i % 2 === 1);
  // Full 3-column split only when both rails have content — otherwise the
  // empty track would read as dead space, so fall back to a 2-column
  // feature+single-rail layout instead.
  const hasBothRails = left.length > 0 && right.length > 0;
  const hasOneRail = left.length > 0 || right.length > 0;

  const card = (article: ArticleCard, variant: "rail" | "feature") => (
    <ContentCard
      key={article.id}
      article={article}
      editionLabel={editionLabel}
      dateLabel={dateLabelFor(article)}
      variant={variant}
    />
  );

  const lgGridClass = hasBothRails
    ? "lg:grid-cols-[0.85fr_1.7fr_0.85fr] lg:gap-x-8"
    : hasOneRail
      ? "lg:grid-cols-[1.7fr_0.85fr] lg:gap-x-8"
      : "";

  return (
    <div className={`grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-2 md:gap-x-10 ${lgGridClass}`}>
      {/* Feature — first in source order so mobile/tablet lead with it. */}
      <div
        className={`order-1 md:col-span-2 ${
          hasBothRails ? "lg:order-2 lg:col-span-1" : hasOneRail ? "lg:order-1 lg:col-span-1" : "lg:col-span-2"
        }`}
      >
        {card(feature, "feature")}
      </div>

      {left.length > 0 ? (
        <div
          className={`order-2 flex flex-col justify-center gap-8 md:order-3 ${
            hasBothRails ? "lg:order-1" : "lg:order-2"
          }`}
        >
          {left.map((a) => card(a, "rail"))}
        </div>
      ) : null}

      {right.length > 0 ? (
        <div className="order-3 flex flex-col justify-center gap-8 md:order-4 lg:order-3">
          {right.map((a) => card(a, "rail"))}
        </div>
      ) : null}
    </div>
  );
}

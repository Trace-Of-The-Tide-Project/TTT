/**
 * Server-side data layer for the Figma-redesign magazine homepage preview
 * (`/magazine-v3`). Reuses the magazine-next fetchers wherever the shape is
 * identical (articles, framing) and adds only what's new to this design
 * (collections). Same graceful-degradation contract: every fetch resolves to
 * a safe empty value on failure so the page always renders.
 */
import { getCollections, type CollectionItem } from "@/services/collections.service";

export {
  attachArticleFraming,
  attachWriterFraming,
  fetchArticles,
  fetchWriters,
  type ArticleCard,
} from "@/components/home/magazine-next/data";

/** Per-section fetch limits for the six Figma sections. */
export const V3_SECTION_SIZES = {
  /** High enough to never clip a real editorial board roster — this section
   * shows every writer an admin toggled on via /writers/editorial-board,
   * not a fixed page size. */
  boardWriters: 50,
  featured: 9,
  latest: 22,
  collections: 5,
} as const;

export type CollectionCard = {
  id: string;
  name: string;
  coverImage: string | null;
  /** Best-effort — /collections has no typed article-count field. Same
   * defensive probe as the homepage (fetch-home-data.ts:203-219): checks
   * article_count, then count, then a raw contributions/articles array
   * length. 0 means "unknown", and the card hides the chip rather than
   * showing a wrong number. */
  articleCount: number;
  href: string;
};

function toCollectionCard(raw: CollectionItem): CollectionCard {
  const row = raw as CollectionItem & {
    article_count?: number;
    count?: number;
    contributions?: unknown[];
    articles?: unknown[];
  };
  const contributions = Array.isArray(row.contributions)
    ? row.contributions
    : Array.isArray(row.articles)
      ? row.articles
      : [];
  return {
    id: row.id,
    name: row.name,
    coverImage: row.cover_image ?? null,
    articleCount: row.article_count ?? row.count ?? contributions.length ?? 0,
    href: `/collections/${encodeURIComponent(row.id)}`,
  };
}

/** Site-global collections (no product scoping available on /collections). */
export async function fetchCollections(
  locale: string,
  limit = V3_SECTION_SIZES.collections,
): Promise<CollectionCard[]> {
  const rows = await getCollections({ limit, dedupe: "group", viewer_lang: locale });
  return rows.map(toCollectionCard);
}

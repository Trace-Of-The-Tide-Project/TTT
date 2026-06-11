import {
  isUsableArticleMediaRef,
  resolveArticleMediaSrc,
} from "@/lib/content/article-media-url";
import { getCollections } from "@/services/collections.service";
import { CollectionsIndexContent } from "@/components/collections/CollectionsIndexContent";
import type { CollectionCardData } from "@/components/collections/CollectionCard";

export const dynamic = "force-dynamic";

function resolveCover(ref: string | null | undefined): string | null {
  const v = ref?.trim();
  return v && isUsableArticleMediaRef(v) ? resolveArticleMediaSrc(v) : null;
}

export default async function CollectionsIndexPage() {
  const collections = await getCollections({ limit: 50 });

  const cards: CollectionCardData[] = collections.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description?.trim() || "",
    coverImage: resolveCover(c.cover_image),
    itemCount: null,
  }));

  return <CollectionsIndexContent collections={cards} />;
}

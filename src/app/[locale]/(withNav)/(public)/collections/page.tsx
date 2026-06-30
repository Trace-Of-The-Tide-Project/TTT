import { getLocale } from "next-intl/server";
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
  const locale = await getLocale();

  // Prefer the active locale's translated version of each collection, but keep
  // FULL coverage: start from the originals and swap in a localized version
  // (matched by translation group) only where one exists. Untranslated
  // collections still show in their original language rather than disappearing.
  const [originals, translated] = await Promise.all([
    getCollections({ limit: 50 }),
    locale === "en"
      ? Promise.resolve([])
      : getCollections({ limit: 50, language: locale }),
  ]);
  const byGroup = new Map(
    translated.map((c) => [c.translation_group_id ?? c.id, c] as const),
  );
  const collections = originals.map(
    (o) => byGroup.get(o.translation_group_id ?? o.id) ?? o,
  );

  const cards: CollectionCardData[] = collections.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description?.trim() || "",
    coverImage: resolveCover(c.cover_image),
    itemCount: null,
  }));

  return <CollectionsIndexContent collections={cards} />;
}

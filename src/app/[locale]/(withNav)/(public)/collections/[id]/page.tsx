import { notFound } from "next/navigation";
import {
  isUsableArticleMediaRef,
  resolveArticleMediaSrc,
} from "@/lib/content/article-media-url";
import {
  getCollectionById,
  getCollectionTranslations,
} from "@/services/collections.service";
import { getCollectionArticles } from "@/services/articles.service";
import { collectionItemHref } from "@/lib/content/collection-item-href";
import {
  CollectionDetailContent,
  type CollectionDetailViewModel,
} from "@/components/collections/CollectionDetailContent";
import type { CollectionRowItem } from "@/lib/content/collection-buckets";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string; locale: string }> };

function resolveCover(ref: string | null | undefined): string | null {
  const v = ref?.trim();
  return v && isUsableArticleMediaRef(v) ? resolveArticleMediaSrc(v) : null;
}

function formatDate(iso: string | null | undefined): string {
  const v = (iso ?? "").trim();
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function CollectionDetailPage({ params }: PageProps) {
  const { id, locale } = await params;

  const [collection, itemsResult] = await Promise.all([
    getCollectionById(id),
    getCollectionArticles(id, { limit: 50 }),
  ]);
  if (!collection) return notFound();

  // Localize the title/description to the active locale when a translated
  // version of this collection exists — so even a direct/bookmarked link to
  // the original (e.g. /ar/collections/<en-id>) reads in Arabic. The items
  // stay tied to the URL collection (which owns them); only the framing copy
  // swaps. Falls back silently to the original when no version matches.
  let name = collection.name;
  let description = collection.description?.trim() || "";
  let cover = collection.cover_image;
  if (collection.language && collection.language !== locale) {
    const versions = await getCollectionTranslations(
      collection.translation_group_id ?? id,
    );
    const match = versions.find((v) => v.language === locale && v.id !== collection.id);
    if (match) {
      const localized = await getCollectionById(match.id);
      if (localized) {
        name = localized.name || name;
        description = localized.description?.trim() || description;
        cover = localized.cover_image || cover;
      }
    }
  }

  const items: CollectionRowItem[] = itemsResult.articles.map((a) => ({
    id: a.id,
    title: a.title,
    excerpt: a.excerpt?.trim() || "",
    coverImage: resolveCover(a.cover_image),
    date: formatDate(a.published_at),
    contentType: (a.content_type ?? "article").toLowerCase(),
    publishedAt: a.published_at ?? null,
    scheduledAt: null,
    href: collectionItemHref(a.content_type, a.id),
  }));

  const vm: CollectionDetailViewModel = {
    id: collection.id,
    name,
    description,
    coverImage: resolveCover(cover),
    items,
    currentYear: new Date().getFullYear(),
  };

  return <CollectionDetailContent collection={vm} />;
}

import { notFound } from "next/navigation";
import {
  isUsableArticleMediaRef,
  resolveArticleMediaSrc,
} from "@/lib/content/article-media-url";
import { getCollectionById } from "@/services/collections.service";
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
  const { id } = await params;

  const [collection, itemsResult] = await Promise.all([
    getCollectionById(id),
    getCollectionArticles(id, { limit: 50 }),
  ]);
  if (!collection) return notFound();

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
    name: collection.name,
    description: collection.description?.trim() || "",
    coverImage: resolveCover(collection.cover_image),
    items,
    currentYear: new Date().getFullYear(),
  };

  return <CollectionDetailContent collection={vm} />;
}

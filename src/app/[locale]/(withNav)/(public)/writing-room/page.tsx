import { serverGet } from "@/lib/api/isomorphic-fetch";
import {
  isUsableArticleMediaRef,
  resolveArticleMediaSrc,
} from "@/lib/content/article-media-url";
import {
  WritingRoomContent,
  type FeaturedWritingItem,
} from "@/components/writing-room/WritingRoomContent";

export const dynamic = "force-dynamic";

type RawArticle = {
  id: string;
  title: string;
  slug?: string | null;
  cover_image?: string | null;
  category?: string | null;
  author?: {
    full_name?: string | null;
    username?: string | null;
    profile?: { display_name?: string | null } | null;
  } | null;
};

type Envelope<T> = { data?: T[] };

function unwrapList<T>(raw: Envelope<T> | T[] | null): T[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  return raw.data ?? [];
}

function pickAuthor(a: RawArticle["author"]): string {
  return (
    a?.profile?.display_name?.trim() ||
    a?.full_name?.trim() ||
    a?.username?.trim() ||
    "Author"
  );
}

export default async function WritingRoomPage() {
  // Pull a few published articles for the "Discover Featured
  // Writing" carousel. Falls back to an empty array when nothing is
  // seeded; the carousel hides itself in that case.
  const raw = await serverGet<Envelope<RawArticle>>("/articles", {
    limit: 8,
    status: "published",
    sortBy: "published_at",
    order: "DESC",
  });

  const featured: FeaturedWritingItem[] = unwrapList(raw).map((a) => {
    const ref = a.cover_image?.trim();
    const cover =
      ref && isUsableArticleMediaRef(ref)
        ? resolveArticleMediaSrc(ref)
        : null;
    return {
      id: a.id,
      slug: a.slug ?? a.id,
      title: a.title,
      author: pickAuthor(a.author),
      coverImage: cover,
    };
  });

  return <WritingRoomContent featured={featured} />;
}

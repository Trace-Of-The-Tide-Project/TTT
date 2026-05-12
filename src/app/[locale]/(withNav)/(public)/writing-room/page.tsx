import { serverGet } from "@/lib/api/isomorphic-fetch";
import {
  isUsableArticleMediaRef,
  resolveArticleMediaSrc,
} from "@/lib/content/article-media-url";
import {
  WritingRoomContent,
  type DictionaryItem,
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

type RawDictionaryEntry = {
  id: string;
  title?: string | null;
  definition_or_thought?: string | null;
  author_name?: string | null;
  createdAt?: string | null;
  user?: {
    full_name?: string | null;
    username?: string | null;
    profile?: {
      display_name?: string | null;
      job_title?: string | null;
    } | null;
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

function mapDictionaryEntry(e: RawDictionaryEntry): DictionaryItem {
  const author =
    e.user?.profile?.display_name?.trim() ||
    e.user?.full_name?.trim() ||
    e.user?.username?.trim() ||
    e.author_name?.trim() ||
    "";
  const jobTitle = e.user?.profile?.job_title?.trim() || "";
  const year =
    e.createdAt && !Number.isNaN(Date.parse(e.createdAt))
      ? new Date(e.createdAt).getFullYear().toString()
      : "";
  const role = [jobTitle, year].filter(Boolean).join(" · ");
  return {
    id: e.id,
    word: e.title?.trim() || "",
    body: e.definition_or_thought?.trim() || "",
    author: author ? `— ${author}` : "",
    role,
  };
}

export default async function WritingRoomPage() {
  const [rawArticles, rawFeaturedDict, rawDict] = await Promise.all([
    serverGet<Envelope<RawArticle>>("/articles", {
      limit: 8,
      status: "published",
      sortBy: "published_at",
      order: "DESC",
    }),
    serverGet<Envelope<RawDictionaryEntry>>("/dictionary/featured", {
      limit: 6,
    }),
    serverGet<Envelope<RawDictionaryEntry>>("/dictionary", { limit: 6 }),
  ]);

  const featured: FeaturedWritingItem[] = unwrapList(rawArticles).map((a) => {
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

  // Prefer curated/featured dictionary entries; fall back to the
  // general approved list so the section still has content while the
  // editorial team is building up the feature set.
  const featuredDict = unwrapList(rawFeaturedDict);
  const dictionarySource =
    featuredDict.length > 0 ? featuredDict : unwrapList(rawDict);
  const dictionary: DictionaryItem[] = dictionarySource
    .slice(0, 6)
    .map(mapDictionaryEntry)
    .filter((d) => d.word && d.body);

  return (
    <WritingRoomContent featured={featured} dictionary={dictionary} />
  );
}

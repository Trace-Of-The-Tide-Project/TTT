import { getArticles } from "@/services/articles.service";
import { HomeHexGrid } from "@/components/home/HomeHexGrid";
import { ShareYourStory } from "@/components/home/ShareYourStory";

export type HexCard = {
  id: string;
  title: string;
  badge: string;
  image: string | null;
  href: string;
};

async function fetchHexCards(locale: string): Promise<HexCard[]> {
  try {
    // dedupe=group → one card per translation group; viewer_lang picks the
    // reader's-language version when a piece exists in several languages.
    const { data: articles } = await getArticles({
      limit: 100,
      dedupe: "group",
      viewer_lang: locale,
    });
    return articles.map((a) => ({
      id: a.id,
      title: a.title,
      badge: a.category
        ? a.category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
        : "Article",
      image: a.cover_image,
      href: `/content/article?id=${encodeURIComponent(a.id)}`,
    }));
  } catch {
    return [];
  }
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const cards = await fetchHexCards(locale);
  return (
    <main className="min-h-0">
      {/* Full-width: HomeHexGrid + ShareYourStory scale with viewport so wide screens don't show empty side strips.
          Sections paint their own theme-aware backgrounds (light/dark) — no parent bg here. */}
      <HomeHexGrid cards={cards} />
      <ShareYourStory />
    </main>
  );
}

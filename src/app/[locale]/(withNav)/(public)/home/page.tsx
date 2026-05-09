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

async function fetchHexCards(): Promise<HexCard[]> {
  try {
    const { data: articles } = await getArticles({ limit: 100 });
    return articles.map((a) => ({
      id: a.id,
      title: a.title,
      badge: a.category
        ? a.category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
        : "Article",
      image: a.cover_image,
      href: `/fields/${a.slug}`,
    }));
  } catch {
    return [];
  }
}

export default async function Home() {
  const cards = await fetchHexCards();
  return (
    <main className="min-h-0">
      {/* Full-width: HomeHexGrid + ShareYourStory scale with viewport so wide screens don't show empty side strips.
          Sections paint their own theme-aware backgrounds (light/dark) — no parent bg here. */}
      <HomeHexGrid cards={cards} />
      <ShareYourStory />
    </main>
  );
}

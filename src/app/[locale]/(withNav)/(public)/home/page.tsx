import { callBackend } from "@/lib/auth/proxy-backend";
import { HomeHexGrid } from "@/components/home/HomeHexGrid";
import { ShareYourStory } from "@/components/home/ShareYourStory";

export type HexCard = {
  id: string;
  title: string;
  badge: string;
  image: string | null;
  href: string;
};

function formatCategory(raw?: string | null, fallback = "Article"): string {
  if (!raw) return fallback;
  return raw.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

type RawArticle = { id: string; title: string; category?: string | null; cover_image?: string | null };
type RawOpenCall = { id: string; title: string; category?: string | null; cover_image?: string | null; main_media?: { url?: string } | null };

async function fetchHexCards(locale: string): Promise<HexCard[]> {
  const [articlesRes, openCallsRes] = await Promise.all([
    callBackend({ path: `/articles?limit=100&dedupe=group&viewer_lang=${locale}` }),
    callBackend({ path: `/open-calls/active?limit=100` }),
  ]);

  const articles: RawArticle[] = (() => {
    if (!articlesRes.ok) return [];
    const j = articlesRes.json as Record<string, unknown>;
    return (Array.isArray(j.data) ? j.data : Array.isArray(j) ? j : []) as RawArticle[];
  })();

  const openCalls: RawOpenCall[] = (() => {
    if (!openCallsRes.ok) return [];
    const j = openCallsRes.json as Record<string, unknown>;
    return (Array.isArray(j.data) ? j.data : Array.isArray(j) ? j : []) as RawOpenCall[];
  })();

  const articleCards: HexCard[] = articles.map((a) => ({
    id: `article-${a.id}`,
    title: a.title,
    badge: formatCategory(a.category),
    image: a.cover_image ?? null,
    href: `/content/article?id=${encodeURIComponent(a.id)}`,
  }));

  const openCallCards: HexCard[] = openCalls.map((oc) => ({
    id: `oc-${oc.id}`,
    title: oc.title,
    badge: formatCategory(oc.category, "Open Call"),
    image: oc.cover_image ?? oc.main_media?.url ?? null,
    href: `/content/open-call?id=${encodeURIComponent(oc.id)}`,
  }));

  return [...articleCards, ...openCallCards];
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

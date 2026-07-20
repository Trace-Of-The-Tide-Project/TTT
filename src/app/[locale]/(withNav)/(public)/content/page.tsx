import { getLocale } from "next-intl/server";
import HexBackground from "@/components/ui/HexBackground";
import { serverGet } from "@/lib/api/isomorphic-fetch";
import { previewHrefForContentType } from "@/lib/content/public-article-preview-href";
import { getPageHero } from "@/services/media-library.service";
import { AtriumHero } from "@/components/content/hub/AtriumHero";
import { AtriumManifesto } from "@/components/content/hub/AtriumManifesto";
import { AtriumGateways } from "@/components/content/hub/AtriumGateways";
import { AtriumCuratedStrip } from "@/components/content/hub/AtriumCuratedStrip";
import { AtriumNewsletter } from "@/components/content/hub/AtriumNewsletter";
import { getFramingsServer } from "@/services/image-framing.service";
import { ARTICLE_COVER_FRAMING } from "@/lib/framing-placements";
import {
  GATEWAY_TYPES,
  normalizeContentType,
  type AtriumItem,
  type GatewayData,
  type HeroData,
} from "@/components/content/hub/atrium-types";

// "The Atrium" — the /content hub. Highly dynamic (counts, featured item,
// curated strip change as content is published), so never cache.
export const dynamic = "force-dynamic";

// ─── Backend response shapes (loose; OpenAPI doesn't declare them) ──

type RawArticle = {
  id: string;
  title: string;
  slug?: string | null;
  excerpt?: string | null;
  cover_image?: string | null;
  category?: string | null;
  reading_time?: number | null;
  view_count?: number | null;
  content_type?: string | null;
  media_duration?: number | null;
  published_at?: string | null;
  author?: {
    full_name?: string | null;
    username?: string | null;
    profile?: { display_name?: string | null; avatar?: string | null } | null;
  } | null;
};

type Envelope<T> = { data?: T[]; status?: number; results?: number };

// ─── Mapping helpers ────────────────────────────────────────────────

function pickAuthorName(author: RawArticle["author"]): string {
  return (
    author?.profile?.display_name?.trim() ||
    author?.full_name?.trim() ||
    author?.username?.trim() ||
    ""
  );
}

function prettifyCategory(c: string | null | undefined): string {
  const v = (c ?? "").trim();
  if (!v) return "";
  return v
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function buildMeta(row: RawArticle): string | null {
  const parts: string[] = [];
  if (row.reading_time && row.reading_time > 0) parts.push(`${row.reading_time} min`);
  const category = prettifyCategory(row.category);
  if (category) parts.push(category);
  return parts.length ? parts.join(" · ") : null;
}

function toAtriumItem(row: RawArticle): AtriumItem {
  return {
    id: row.id,
    title: row.title,
    excerpt: row.excerpt ?? null,
    coverImage: row.cover_image ?? null,
    authorName: pickAuthorName(row.author) || null,
    authorAvatar: row.author?.profile?.avatar ?? null,
    type: normalizeContentType(row.content_type),
    href: previewHrefForContentType(row.content_type ?? undefined, row.id, row.slug),
    meta: buildMeta(row),
    mediaDuration: row.media_duration ?? null,
  };
}

// ─── Data ───────────────────────────────────────────────────────────

type AtriumData = {
  hero: HeroData;
  gateways: GatewayData[];
  curated: AtriumItem[];
};

/**
 * Single round-trip: all five content types are /articles rows distinguished
 * by content_type (no per-type list endpoint), so one fetch + in-memory
 * bucketing powers the hero, gateway counts/peeks, and curated strip.
 * serverGet swallows errors → null → the whole page renders its empty states.
 *
 * dedupe=group + viewer_lang picks one row per translation group in the
 * viewer's language (falling back to newest) — same pattern as every other
 * public list page (writers, magazine, collections, books, community).
 */
async function fetchAtriumData(locale: string): Promise<AtriumData> {
  const raw = await serverGet<Envelope<RawArticle>>("/articles", {
    limit: 40,
    status: "published",
    dedupe: "group",
    viewer_lang: locale,
  });
  const rows = raw?.data ?? [];
  const mapped = rows.map(toAtriumItem);

  // One framing request for every row on the page — the hero, the gateway
  // peeks and the curated strip all read from this same list.
  const framings = await getFramingsServer(
    ARTICLE_COVER_FRAMING.entity,
    mapped.map((it) => it.id),
    ARTICLE_COVER_FRAMING.field,
  );
  const items = mapped.map((it) => {
    const coverFraming = framings[it.id]?.[ARTICLE_COVER_FRAMING.field];
    return coverFraming ? { ...it, coverFraming } : it;
  });

  // Hero: the first published row (the API returns newest/curated first).
  const hero: HeroData = items[0] ?? null;

  // Gateways: one per type, always present so every tile renders + links.
  const gateways: GatewayData[] = GATEWAY_TYPES.map((type) => {
    const bucket = items.filter((it) => it.type === type);
    return {
      type,
      // Real bucket size, or null when empty — never fabricated.
      count: bucket.length > 0 ? bucket.length : null,
      href: `/content/${type}`,
      items: bucket.slice(0, 2),
    };
  });

  // Curated: up to 6 recent items mixing all formats.
  const curated = items.slice(0, 6);

  return { hero, gateways, curated };
}

// ─── Page ───────────────────────────────────────────────────────────

export default async function ContentHubPage() {
  const locale = await getLocale();
  const [{ hero, gateways, curated }, heroOverrideUrl] = await Promise.all([
    fetchAtriumData(locale),
    getPageHero("content-hub"),
  ]);

  return (
    <main
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{ backgroundColor: "var(--tott-home-surface)" }}
    >
      {/* Top-anchored decorative hex layer — same chrome as the magazine page. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-35 overflow-hidden"
        style={{ opacity: "var(--tott-dash-hex-opacity, 1)" }}
      >
        <HexBackground />
      </div>

      <div className="relative">
        <AtriumHero item={hero} heroOverrideUrl={heroOverrideUrl} />
        <AtriumManifesto />
        <AtriumGateways gateways={gateways} />
        <AtriumCuratedStrip items={curated} />
        <AtriumNewsletter />
      </div>
    </main>
  );
}

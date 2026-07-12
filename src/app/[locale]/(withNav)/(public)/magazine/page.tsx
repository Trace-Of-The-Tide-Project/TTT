import HexBackground from "@/components/ui/HexBackground";
import { MagazineHero } from "@/components/home/magazine/MagazineHero";
import { MagazineBody } from "@/components/home/magazine/MagazineBody";
import { MagazineManifesto } from "@/components/home/magazine/MagazineManifesto";
import {
  MagazineLatestPublished,
  type LatestPublishedItem,
} from "@/components/home/magazine/MagazineLatestPublished";
import { MagazineLatestPublishedV2 } from "@/components/home/magazine/MagazineLatestPublishedV2";
import {
  MagazineIssues,
  type MagazineIssueItem,
} from "@/components/home/magazine/MagazineIssues";
import { MagazineIssuesV2 } from "@/components/home/magazine/MagazineIssuesV2";
import type { FollowWriterItem } from "@/components/home/magazine/MagazineEditorialBoard";
import { MagazineEditorialBoardV2 } from "@/components/home/magazine/MagazineEditorialBoardV2";
import {
  MagazineSupport,
  type CollaborationItem,
} from "@/components/home/magazine/MagazineSupport";
import { MagazineSupportV2 } from "@/components/home/magazine/MagazineSupportV2";
import { serverGet } from "@/lib/api/isomorphic-fetch";
import {
  writerAvatar,
  writerDisplayName,
  type WriterProfile,
} from "@/services/writers.service";
import type { MagazineIssue } from "@/services/magazine-issues.service";
import type { Magazine } from "@/services/magazines.service";
import {
  MAGAZINE_PAGE_SLUG,
  parseHeroConfig,
  parseManifestoConfig,
  parseFounderConfig,
  parseNewsletterConfig,
  parseSupportConfig,
  pickHeroLocale,
  pickManifestoLocale,
  pickNewsletterLocale,
  pickSupportLocale,
  findSection,
  type HeroConfig,
  type ManifestoConfig,
  type FounderQuoteConfig,
  type NewsletterCopyConfig,
  type SupportConfig,
} from "@/services/magazine-page.service";
import type { CmsPage } from "@/services/cms.service";
import { getPageHero } from "@/services/media-library.service";

// Magazine page is highly dynamic — we don't want it cached.
export const dynamic = "force-dynamic";

// ─── Backend response shapes (loose; OpenAPI doesn't declare them) ──

type RawContribution = {
  id: string;
  title?: string | null;
  description?: string | null;
  status?: string | null;
  submission_date?: string | null;
  contributor_name?: string | null;
  type?: { name?: string | null } | null;
  user?: { full_name?: string | null; username?: string | null } | null;
  files?: Array<{ url?: string | null; path?: string | null }> | null;
};

type RawBook = {
  id: string;
  title: string;
  author?: string | null;
  genre?: string | null;
  cover_image?: string | null;
  page_count?: number | null;
  createdAt?: string;
};

type Envelope<T> = { data?: T[]; status?: number; results?: number };

// ─── Server-side fetch helpers ──────────────────────────────────────

function unwrapList<T>(raw: Envelope<T> | T[] | null): T[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  return raw.data ?? [];
}

async function fetchLatestBooks(locale: string): Promise<LatestPublishedItem[]> {
  const raw = await serverGet<{ rows?: RawBook[]; data?: RawBook[] }>(
    "/knowledge/books",
    { limit: 5, page: 1, dedupe: "group", viewer_lang: locale },
  );
  const rows: RawBook[] =
    raw?.rows ?? raw?.data ?? (Array.isArray(raw) ? raw : []);
  return rows.map((b) => ({
    id: b.id,
    title: b.title,
    category: prettifyCategory(b.genre),
    author: b.author ?? "",
    readingTime: b.page_count ? Math.ceil(b.page_count / 30) : 0,
    coverImage: b.cover_image ?? null,
  }));
}

async function fetchWriters(locale: string): Promise<FollowWriterItem[]> {
  // Admin-picked Editorial Board writers first; fall back to the full
  // writers list so the board is never empty before any writer is flagged.
  const board = await serverGet<Envelope<WriterProfile>>(
    "/writers/editorial-board",
    { viewer_lang: locale },
  );
  const list = unwrapList(board);
  if (list.length > 0) return list.map(toWriterItem);

  const all = await serverGet<Envelope<WriterProfile>>("/writers", {
    limit: 4,
    dedupe: "group",
    viewer_lang: locale,
  });
  return unwrapList(all).slice(0, 4).map(toWriterItem);
}

async function fetchMagazineIssues(locale: string): Promise<MagazineIssueItem[]> {
  const raw = await serverGet<Envelope<MagazineIssue>>("/magazine-issues", {
    limit: 20,
    status: "published",
    dedupe: "group",
    viewer_lang: locale,
  });
  return unwrapList(raw).map((it) => ({
    id: it.id,
    title: it.title,
    kind: it.kind ?? null,
    pageCount: it.page_count ?? null,
    coverImage: it.cover_image ?? null,
    excerpt: it.excerpt ?? null,
    edition:
      it.edition ??
      (it.edition_number != null ? String(it.edition_number) : null),
    category: it.category ?? null,
    publishedAt: it.published_at ?? null,
    slug: it.slug ?? null,
  }));
}

async function fetchCollaborations(locale: string): Promise<CollaborationItem[]> {
  const raw = await serverGet<Envelope<RawContribution>>("/contributions", {
    page: 1,
    limit: 7,
  });
  return unwrapList(raw).map((c) => ({
    id: c.id,
    title: c.title || c.description?.slice(0, 60) || "Collaboration",
    type: c.type?.name || "Contribution",
    status: c.status ?? null,
    timeline: formatShortDate(c.submission_date, locale) || null,
    description: c.description || "",
  }));
}

async function fetchMagazineMeta(): Promise<{
  hero: { title?: string; subtitle?: string; image?: string } | null;
  magazineId: string | null;
}> {
  // Pull the first published magazine entity. When the backend hasn't
  // been seeded with a magazine record, every field falls back to the
  // existing translation strings inside the components.
  const list = await serverGet<Envelope<Magazine>>("/magazines", {
    limit: 1,
    status: "published",
  });
  const m = unwrapList(list)[0];
  if (!m) return { hero: null, magazineId: null };

  return {
    hero:
      m.hero_title || m.hero_subtitle || m.cover_image
        ? {
            title: m.hero_title ?? undefined,
            subtitle: m.hero_subtitle ?? undefined,
            image: m.cover_image ?? undefined,
          }
        : null,
    magazineId: m.id,
  };
}

// ─── Mapping helpers ────────────────────────────────────────────────

function prettifyCategory(c: string | null | undefined): string {
  const v = (c ?? "").trim();
  if (!v) return "";
  // Convert snake_case / kebab-case to Title Case for display.
  return v
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function formatShortDate(iso: string | null | undefined, locale: string): string {
  const v = (iso ?? "").trim();
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  // Localize month + year to the active language (e.g. Arabic month names).
  return d.toLocaleDateString(locale, { month: "short", year: "numeric" });
}

/**
 * Snapshot of CMS-driven copy for all magazine sections. Each entry is
 * null when the section is missing, hidden, or the page hasn't been
 * bootstrapped — caller treats null as "use i18n + legacy fallback".
 */
type MagazineCmsCopy = {
  hero: HeroConfig | null;
  manifesto: ManifestoConfig | null;
  founder: FounderQuoteConfig | null;
  newsletter: NewsletterCopyConfig | null;
  support: SupportConfig | null;
};

const EMPTY_CMS_COPY: MagazineCmsCopy = {
  hero: null,
  manifesto: null,
  founder: null,
  newsletter: null,
  support: null,
};

async function fetchMagazineCmsCopy(): Promise<MagazineCmsCopy> {
  // GET /cms/pages/slug/{slug} is documented as public (no security in
  // OpenAPI). serverGet swallows failures so the page falls back to
  // i18n + legacy /magazines record on backend errors.
  const page = await serverGet<CmsPage | { data: CmsPage }>(
    `/cms/pages/slug/${MAGAZINE_PAGE_SLUG}`,
  );
  if (!page) return EMPTY_CMS_COPY;
  const unwrapped =
    (page as { data?: CmsPage }).data ?? (page as CmsPage);
  if (!unwrapped?.sections) return EMPTY_CMS_COPY;

  const pickVisible = (key: Parameters<typeof findSection>[1]) => {
    const s = findSection(unwrapped, key);
    return s && s.is_visible ? s : undefined;
  };

  return {
    hero: pickVisible("hero") ? parseHeroConfig(pickVisible("hero")) : null,
    manifesto: pickVisible("manifesto")
      ? parseManifestoConfig(pickVisible("manifesto"))
      : null,
    founder: pickVisible("founderQuote")
      ? parseFounderConfig(pickVisible("founderQuote"))
      : null,
    newsletter: pickVisible("newsletterCopy")
      ? parseNewsletterConfig(pickVisible("newsletterCopy"))
      : null,
    support: pickVisible("supportCuration")
      ? parseSupportConfig(pickVisible("supportCuration"))
      : null,
  };
}

function toWriterItem(w: WriterProfile): FollowWriterItem {
  return {
    id: w.id,
    userId: w.user_id ?? w.user?.id ?? null,
    name: writerDisplayName(w) || "Writer",
    title: w.bio?.slice(0, 80) || writerDisplayName(w) || null,
    edition: w.edition ?? null,
    // Real role from the backend (writer / musician / visual_artist /
    // filmmaker) instead of a hardcoded "Editors" pill. Null lets the card
    // fall back to its i18n placeholder.
    role: w.creator_kind ? prettifyCategory(w.creator_kind) : null,
    avatar: writerAvatar(w),
  };
}

// ─── Page ───────────────────────────────────────────────────────────

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function MagazinePreviewPage({ params }: PageProps) {
  const { locale } = await params;

  // Parallel fetch — all six endpoints fire in one round trip; each
  // resolves to an empty array on failure (serverGet swallows errors)
  // so the page always renders, even with the backend offline.
  const [
    latestArticles,
    writers,
    issues,
    collaborations,
    magazineMeta,
    cmsCopy,
    heroOverrideUrl,
  ] = await Promise.all([
    fetchLatestBooks(locale),
    fetchWriters(locale),
    fetchMagazineIssues(locale),
    fetchCollaborations(locale),
    fetchMagazineMeta(),
    fetchMagazineCmsCopy(),
    getPageHero("magazine-landing"),
  ]);

  // Priority for every section: Media Library page-hero override (admin) →
  // CMS (admin-edited, per-locale) → legacy backend record → component
  // i18n defaults.
  const cmsHeroLocale = cmsCopy.hero ? pickHeroLocale(cmsCopy.hero, locale) : {};
  const heroArtwork =
    heroOverrideUrl || cmsCopy.hero?.artwork || magazineMeta.hero?.image;
  const heroTitle = cmsHeroLocale.title || magazineMeta.hero?.title;
  const heroSubtitle = cmsHeroLocale.subtitle || magazineMeta.hero?.subtitle;
  const heroPrimaryCta = cmsHeroLocale.primaryCtaLabel;
  const heroSecondaryCta = cmsHeroLocale.secondaryCtaLabel;
  const heroPrimaryHref =
    cmsCopy.hero?.primaryHref || "/magazine#magazine-content";
  const heroSecondaryHref =
    cmsCopy.hero?.secondaryHref || "/magazine#newsletter-heading";

  const manifestoLocale = cmsCopy.manifesto
    ? pickManifestoLocale(cmsCopy.manifesto, locale)
    : {};
  const newsletterLocale = cmsCopy.newsletter
    ? pickNewsletterLocale(cmsCopy.newsletter, locale)
    : {};
  const supportLocale = cmsCopy.support
    ? pickSupportLocale(cmsCopy.support, locale)
    : {};

  return (
    <main
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{ backgroundColor: "var(--tott-home-surface)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-35 overflow-hidden"
        style={{ opacity: "var(--tott-dash-hex-opacity, 1)" }}
      >
        <HexBackground />
      </div>

      <div className="relative">
        <MagazineHero
          fontScale={cmsCopy.hero?.fontScale}
          artwork={heroArtwork}
          title={heroTitle}
          subtitle={heroSubtitle}
          primaryCtaLabel={heroPrimaryCta}
          secondaryCtaLabel={heroSecondaryCta}
          primaryHref={heroPrimaryHref}
          secondaryHref={heroSecondaryHref}
        />
        {/* MagazineBody is a thin client wrapper that owns the active
            tab state so the Newsletter section below can swap its
            copy when the Editorial Board tab is active. */}
        <div id="magazine-content" />
        <MagazineBody
          tabs={{
            manifesto: (
              <MagazineManifesto
                fontScale={cmsCopy.manifesto?.fontScale}
                textAlign={cmsCopy.manifesto?.textAlign}
                philosophyHeadingOverride={manifestoLocale.philosophyHeading}
                philosophyQuoteOverride={manifestoLocale.philosophyQuote}
                visionHeadingOverride={manifestoLocale.visionHeading}
                visionBodyOverride={manifestoLocale.visionBody}
                missionHeadingOverride={manifestoLocale.missionHeading}
                missionBodyOverride={manifestoLocale.missionBody}
                valuesHeadingOverride={manifestoLocale.valuesHeading}
                closingQuoteOverride={manifestoLocale.closingQuote}
                bannerOverride={cmsCopy.manifesto?.banner}
                bannerHidden={cmsCopy.manifesto?.bannerHidden}
              />
            ),
            publications:
              latestArticles.length > 0 ? (
                <MagazineLatestPublished items={latestArticles} />
              ) : undefined,
            issues: <MagazineIssues items={issues} />,
            editorialBoard:
              writers.length > 0 ? (
                <MagazineEditorialBoardV2 writers={writers} />
              ) : undefined,
            support:
              collaborations.length > 0 ? (
                <MagazineSupport
                  fontScale={cmsCopy.support?.fontScale}
                  collaborations={collaborations}
                  headingOverride={supportLocale.heading}
                  subheadingOverride={supportLocale.subheading}
                />
              ) : undefined,
            standalone: {
              publications: (
                <MagazineLatestPublishedV2 items={latestArticles} />
              ),
              issues: <MagazineIssuesV2 items={issues} />,
              editorialBoard: <MagazineEditorialBoardV2 writers={writers} />,
              support: <MagazineSupportV2 issues={issues} />,
            },
          }}
          newsletter={{
            locale,
            magazineId: magazineMeta.magazineId,
            titleOverride: newsletterLocale.title,
            bodyOverride: newsletterLocale.body,
            fontScale: cmsCopy.newsletter?.fontScale,
          }}
        />
      </div>
    </main>
  );
}

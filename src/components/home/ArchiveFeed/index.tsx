import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { serverGet } from "@/lib/api/isomorphic-fetch";
import { previewHrefForContentType } from "@/lib/content/public-article-preview-href";
import {
  isUsableArticleMediaRef,
  resolveArticleMediaSrc,
} from "@/lib/content/article-media-url";
import { formatArticleListDate } from "@/lib/dashboard/map-articles-list";
import { StaggerContainer } from "@/components/motion/StaggerContainer";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { SectionShell } from "../SectionShell";
import { MaskReveal } from "./MaskReveal";

/**
 * "Latest from the archive" — one featured article (is_featured flag, falling
 * back to newest) + a mixed-rhythm grid of recent pieces, all fetched
 * server-side. serverGet swallows errors → null → the section collapses to
 * whatever data exists (never empty boxes).
 */

type RawArticle = {
  id: string;
  title: string;
  slug?: string | null;
  excerpt?: string | null;
  cover_image?: string | null;
  content_type?: string | null;
  published_at?: string | null;
  author?: {
    full_name?: string | null;
    username?: string | null;
    profile?: { display_name?: string | null } | null;
  } | null;
};

type Envelope<T> = { data?: T[] };

/** The content types that actually exist on /articles rows (no "testimony"). */
type ArchiveTypeKey = "article" | "video" | "audio" | "gallery" | "thread";
const TYPE_KEYS: readonly ArchiveTypeKey[] = [
  "article",
  "video",
  "audio",
  "gallery",
  "thread",
];

function typeKeyOf(contentType: string | null | undefined): ArchiveTypeKey {
  const key = (contentType ?? "article").toLowerCase().replace(/-/g, "_");
  return TYPE_KEYS.includes(key as ArchiveTypeKey)
    ? (key as ArchiveTypeKey)
    : "article";
}

function pickAuthorName(author: RawArticle["author"]): string | null {
  return (
    author?.profile?.display_name?.trim() ||
    author?.full_name?.trim() ||
    author?.username?.trim() ||
    null
  );
}

function publishedTs(row: RawArticle): number {
  const ts = Date.parse(row.published_at ?? "");
  return Number.isNaN(ts) ? 0 : ts;
}

async function fetchArchive(locale: string) {
  const base = { status: "published", dedupe: "group", viewer_lang: locale };
  // dedupe=group ignores sortBy/order (backend hardcodes createdAt DESC), so
  // fetch a small buffer and re-sort by published_at here.
  const [featuredRaw, latestRaw] = await Promise.all([
    serverGet<Envelope<RawArticle>>("/articles", {
      ...base,
      is_featured: "true",
      limit: 1,
    }),
    serverGet<Envelope<RawArticle>>("/articles", { ...base, limit: 8 }),
  ]);
  const latest = [...(latestRaw?.data ?? [])].sort(
    (a, b) => publishedTs(b) - publishedTs(a),
  );
  const featured = featuredRaw?.data?.[0] ?? latest[0] ?? null;
  const rest = latest.filter((row) => row.id !== featured?.id).slice(0, 6);
  return { featured, rest };
}

type ArchiveItem = {
  id: string;
  title: string;
  href: string;
  image: string | null;
  typeLabel: string;
  excerpt: string | null;
  meta: string | null;
};

const KICKER_CLASS =
  "block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--tott-gold-muted)]";

export async function ArchiveFeed() {
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations("HomeNext"),
  ]);
  const { featured, rest } = await fetchArchive(locale);

  const toItem = (row: RawArticle): ArchiveItem => {
    const authorName = pickAuthorName(row.author);
    const dateLabel = row.published_at
      ? formatArticleListDate(row.published_at, locale, t("archive.justNow"))
      : null;
    return {
      id: row.id,
      title: row.title,
      href: previewHrefForContentType(row.content_type ?? undefined, row.id, row.slug),
      image: isUsableArticleMediaRef(row.cover_image)
        ? resolveArticleMediaSrc(row.cover_image)
        : null,
      typeLabel: t(`archive.types.${typeKeyOf(row.content_type)}`),
      excerpt: row.excerpt?.trim() || null,
      meta: [authorName, dateLabel].filter(Boolean).join(" · ") || null,
    };
  };

  const feat = featured ? toItem(featured) : null;
  const gridItems = rest.map(toItem);

  return (
    <SectionShell
      id="archive"
      eyebrow={t("archive.eyebrow")}
      title={t("archive.title")}
      standfirst={t("archive.standfirst")}
    >
      <div className="space-y-14">
        {feat ? (
          <Link
            href={feat.href}
            className="tott-archive-card group grid gap-8 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--tott-gold-bright)] lg:grid-cols-2 lg:items-center"
          >
            {feat.image ? (
              <MaskReveal>
                <span className="relative block aspect-[16/10] overflow-hidden bg-[var(--tott-panel-bg)]">
                  <Image
                    src={feat.image}
                    alt=""
                    fill
                    unoptimized
                    sizes="(min-width: 1024px) 560px, 100vw"
                    className="tott-archive-cover object-cover"
                  />
                </span>
              </MaskReveal>
            ) : null}
            <div>
              <span className={KICKER_CLASS}>{feat.typeLabel}</span>
              <h3
                className="mt-3 line-clamp-2 font-display text-2xl text-[var(--tott-home-text-warm)] sm:text-3xl lg:text-4xl"
                style={{
                  lineHeight: "var(--tott-display-leading)",
                  letterSpacing: "var(--tott-display-tracking)",
                }}
              >
                {feat.title}
              </h3>
              <span aria-hidden className="tott-archive-underline mt-2" />
              {feat.excerpt ? (
                <p className="mt-4 line-clamp-3 max-w-xl text-base leading-relaxed text-[var(--tott-salt)]">
                  {feat.excerpt}
                </p>
              ) : null}
              {feat.meta ? (
                <span className="mt-5 block text-sm tabular-nums text-[var(--tott-salt)]">
                  {feat.meta}
                </span>
              ) : null}
            </div>
          </Link>
        ) : null}

        {gridItems.length > 0 ? (
          <StaggerContainer className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {gridItems.map((item, index) => {
              // Mixed rhythm: image-top on even slots (when a cover exists),
              // text-only otherwise — a gold hairline marks those deliberate.
              const withImage = index % 2 === 0 && item.image !== null;
              return (
                <StaggerItem key={item.id} className="h-full">
                  <Link
                    href={item.href}
                    className="tott-archive-card group flex h-full flex-col border border-[color-mix(in_srgb,var(--tott-salt)_25%,transparent)] bg-[var(--tott-elevated)] transition-colors hover:border-[var(--tott-gold-muted)] hover:bg-[var(--tott-elevated-hover)] focus-visible:border-[var(--tott-gold-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tott-gold-bright)]"
                  >
                    {withImage && item.image ? (
                      <span className="relative block aspect-[16/10] overflow-hidden bg-[var(--tott-panel-bg)]">
                        <Image
                          src={item.image}
                          alt=""
                          fill
                          unoptimized
                          sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
                          className="tott-archive-cover object-cover"
                        />
                      </span>
                    ) : (
                      <span
                        aria-hidden
                        className="mx-6 mt-6 block h-px w-10 bg-[var(--tott-gold-muted)]"
                      />
                    )}
                    <div className="flex flex-1 flex-col p-6">
                      <span className={KICKER_CLASS}>{item.typeLabel}</span>
                      <h3
                        className="mt-2 line-clamp-2 font-display text-xl text-[var(--tott-home-text-warm)]"
                        style={{
                          lineHeight: "var(--tott-display-leading)",
                          letterSpacing: "var(--tott-display-tracking)",
                        }}
                      >
                        {item.title}
                      </h3>
                      <span aria-hidden className="tott-archive-underline mt-1.5" />
                      {!withImage && item.excerpt ? (
                        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[var(--tott-salt)]">
                          {item.excerpt}
                        </p>
                      ) : null}
                      {item.meta ? (
                        <span className="mt-auto block pt-5 text-xs tabular-nums text-[var(--tott-salt)]">
                          {item.meta}
                        </span>
                      ) : null}
                    </div>
                  </Link>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        ) : null}

        <div className="flex justify-end">
          <Link
            href="/content"
            className="tott-archive-viewall group inline-flex items-center gap-2 text-sm font-medium text-[var(--tott-gold-primary)] transition-colors hover:text-[var(--tott-gold-bright)] focus-visible:text-[var(--tott-gold-bright)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--tott-gold-bright)]"
          >
            {t("archive.viewAll")}
            <svg
              aria-hidden
              className="tott-archive-arrow"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M2 8h11M9 3.5 13.5 8 9 12.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </div>
    </SectionShell>
  );
}

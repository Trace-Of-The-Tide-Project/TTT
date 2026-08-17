import type { Metadata } from "next";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import HexBackground from "@/components/ui/HexBackground";
import { ChamferedSurface } from "@/components/ui/ChamferedSurface";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { StaggerContainer } from "@/components/motion/StaggerContainer";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { serverGet } from "@/lib/api/isomorphic-fetch";
import { previewHrefForContentType } from "@/lib/content/public-article-preview-href";
import { safeImage } from "@/components/content/hub/atrium-image";
import { getFramingsServer } from "@/services/image-framing.service";
import { ARTICLE_COVER_FRAMING } from "@/lib/framing-placements";
import { framingStyle } from "@/lib/image-framing";
import { formatDuration } from "./atrium-types";

const PAGE_SIZE = 24;

type RawArticle = {
  id: string;
  title: string;
  slug?: string | null;
  cover_image?: string | null;
  reading_time?: number | null;
  media_duration?: number | null;
  content_type?: string | null;
  published_at?: string | null;
  author?: {
    full_name?: string | null;
    username?: string | null;
    profile?: { display_name?: string | null } | null;
  } | null;
};

type Envelope = {
  data?: RawArticle[];
  meta?: { total: number; page: number; limit: number; totalPages: number };
};

function authorName(author: RawArticle["author"]): string {
  return (
    author?.profile?.display_name?.trim() ||
    author?.full_name?.trim() ||
    author?.username?.trim() ||
    ""
  );
}

function metaLine(row: RawArticle, name: string): string | null {
  const duration = formatDuration(row.media_duration);
  const secondary = duration ?? (row.reading_time ? `${row.reading_time} min` : null);
  return [name || null, secondary].filter(Boolean).join(" · ") || null;
}

/** Gold hairline rule either side of the eyebrow — same idiom as ComingSoon/home hero. */
function EyebrowRule({ toLeft }: { toLeft: boolean }) {
  return (
    <span
      aria-hidden
      className="h-px w-10"
      style={{
        background: `linear-gradient(to ${toLeft ? "left" : "right"}, transparent, var(--tott-gold-muted))`,
      }}
    />
  );
}

/** Chevron arrow reusing the site's `.tott-archive-arrow` hover-nudge idiom (RTL-mirrored, reduced-motion-safe). */
function ArrowIcon({ flip }: { flip?: boolean }) {
  return (
    <svg
      aria-hidden
      className="tott-archive-arrow"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      <path
        d="M2 8h11M9 3.5 13.5 8 9 12.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Translation key namespace (under "Content") for one listing page's copy. */
export type ListingKeyPrefix = "allArticles" | "allAudio" | "allVideo" | "allGallery" | "allOpinion";

export async function buildListingMetadata(keyPrefix: ListingKeyPrefix): Promise<Metadata> {
  const t = await getTranslations("Content");
  return { title: t(`${keyPrefix}.heading`) };
}

/**
 * Shared "browse all X" listing page — paginated grid over `/articles`
 * filtered by `content_type`. Used by /content/article, /content/audio, etc.
 * (each is its own route file so Next's file-based routing + generateMetadata
 * still work; this holds the one real implementation). Cards reuse the same
 * `.tott-archive-*` hover idiom as the homepage archive rail so the whole
 * site reads as one system.
 */
export async function AllContentListingPage({
  contentType,
  routePath,
  keyPrefix,
  searchParams,
}: {
  contentType: string;
  routePath: string;
  keyPrefix: ListingKeyPrefix;
  searchParams: Promise<{ page?: string }>;
}) {
  const [locale, t, { page: pageParam }] = await Promise.all([
    getLocale(),
    getTranslations("Content"),
    searchParams,
  ]);
  const page = Math.max(1, Number(pageParam) || 1);

  const raw = await serverGet<Envelope>("/articles", {
    content_type: contentType,
    status: "published",
    dedupe: "group",
    viewer_lang: locale,
    page,
    limit: PAGE_SIZE,
  });
  const rows = raw?.data ?? [];
  const total = raw?.meta?.total ?? rows.length;
  const totalPages = raw?.meta?.totalPages ?? (rows.length > 0 ? page : 1);

  const framings = await getFramingsServer(
    ARTICLE_COVER_FRAMING.entity,
    rows.map((r) => r.id),
    ARTICLE_COVER_FRAMING.field,
  );

  const [lead, ...rest] = rows;
  const showLead = page === 1 && lead;

  const cardHref = (row: RawArticle) =>
    previewHrefForContentType(row.content_type ?? contentType, row.id, row.slug);
  const cardCover = (row: RawArticle) => {
    const cover = safeImage(row.cover_image);
    if (!cover) return null;
    return { ...cover, framing: framings[row.id]?.[ARTICLE_COVER_FRAMING.field] };
  };

  return (
    <main
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{ backgroundColor: "var(--tott-home-surface)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-32 overflow-hidden"
        style={{
          opacity: "var(--tott-dash-hex-opacity, 1)",
          maskImage: "linear-gradient(to bottom, black, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, black, transparent)",
        }}
      >
        <HexBackground twinkle />
      </div>

      <div className="relative mx-auto w-full max-w-[1392px] px-4 py-16 sm:px-6 md:px-8">
        <RevealOnScroll>
          <div className="flex items-center gap-4">
            <EyebrowRule toLeft={false} />
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: "var(--tott-gold-muted)" }}
            >
              {t("browseEyebrow")}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <h1
              className="font-display text-3xl sm:text-4xl lg:text-5xl"
              style={{
                color: "var(--tott-home-text-warm, var(--tott-home-text-strong))",
                lineHeight: "var(--tott-display-leading)",
                letterSpacing: "var(--tott-display-tracking)",
              }}
            >
              {t(`${keyPrefix}.heading`)}
            </h1>
            {total > 0 ? (
              <span
                className="shrink-0 rounded-full px-3 py-1 text-xs font-medium tabular-nums"
                style={{
                  color: "var(--tott-gold-primary)",
                  border: "1px solid color-mix(in srgb, var(--tott-gold-muted) 45%, transparent)",
                }}
              >
                {t("itemCount", { count: total })}
              </span>
            ) : null}
          </div>

          <p className="mt-3 max-w-xl text-sm sm:text-base" style={{ color: "var(--tott-salt)" }}>
            {t(`${keyPrefix}.subtitle`)}
          </p>
        </RevealOnScroll>

        {rows.length === 0 ? (
          <div
            className="mt-14 flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center"
            style={{ borderColor: "color-mix(in srgb, var(--tott-gold-muted) 35%, transparent)" }}
          >
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: "var(--tott-gold-muted)" }}
            >
              {t("comingSoonEyebrow")}
            </span>
            <p className="max-w-md text-sm sm:text-base" style={{ color: "var(--tott-salt)" }}>
              {t(`${keyPrefix}.empty`)}
            </p>
          </div>
        ) : (
          <div className="mt-12 space-y-5">
            {showLead ? (
              <Link
                href={cardHref(lead)}
                className="tott-archive-card group grid gap-8 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--tott-gold-bright)] lg:grid-cols-2 lg:items-center"
              >
                {(() => {
                  const cover = cardCover(lead);
                  return cover ? (
                    <ChamferedSurface
                      chamfer={28}
                      borderColor="color-mix(in srgb, var(--tott-gold-muted) 45%, transparent)"
                      className="relative block aspect-[16/10] bg-[var(--tott-panel-bg)]"
                    >
                      <Image
                        src={cover.src}
                        alt=""
                        fill
                        unoptimized={cover.unoptimized}
                        sizes="(min-width: 1024px) 560px, 100vw"
                        className="tott-archive-cover object-cover"
                        style={framingStyle(cover.framing)}
                      />
                    </ChamferedSurface>
                  ) : (
                    <div
                      className="aspect-[16/10] rounded-2xl"
                      style={{ backgroundColor: "var(--tott-panel-bg)" }}
                    />
                  );
                })()}
                <div>
                  <h2
                    className="line-clamp-2 font-display text-2xl sm:text-3xl lg:text-4xl"
                    style={{
                      color: "var(--tott-home-text-warm, var(--tott-home-text-strong))",
                      lineHeight: "var(--tott-display-leading)",
                      letterSpacing: "var(--tott-display-tracking)",
                    }}
                  >
                    {lead.title}
                  </h2>
                  <span aria-hidden className="tott-archive-underline mt-2" />
                  {(() => {
                    const meta = metaLine(lead, authorName(lead.author));
                    return meta ? (
                      <span className="mt-4 block text-sm tabular-nums" style={{ color: "var(--tott-salt)" }}>
                        {meta}
                      </span>
                    ) : null;
                  })()}
                </div>
              </Link>
            ) : null}

            {rest.length > 0 ? (
              <StaggerContainer className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {rest.map((row) => {
                  const cover = cardCover(row);
                  const meta = metaLine(row, authorName(row.author));
                  return (
                    <StaggerItem key={row.id} className="h-full">
                      <Link
                        href={cardHref(row)}
                        className="tott-archive-card group block h-full [--archive-bg:var(--tott-elevated)] [--archive-border:color-mix(in_srgb,var(--tott-salt)_25%,transparent)] hover:[--archive-bg:var(--tott-elevated-hover)] hover:[--archive-border:var(--tott-gold-muted)] focus-visible:[--archive-bg:var(--tott-elevated-hover)] focus-visible:[--archive-border:var(--tott-gold-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tott-gold-bright)]"
                      >
                        <ChamferedSurface
                          chamfer={20}
                          borderColor="var(--archive-border)"
                          innerFill="var(--archive-bg)"
                          className="flex h-full flex-col"
                        >
                          <span className="relative block aspect-[16/10] overflow-hidden bg-[var(--tott-panel-bg)]">
                            {cover ? (
                              <Image
                                src={cover.src}
                                alt=""
                                fill
                                unoptimized={cover.unoptimized}
                                sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
                                className="tott-archive-cover object-cover"
                                style={framingStyle(cover.framing)}
                              />
                            ) : null}
                          </span>
                          <div className="relative flex flex-1 flex-col p-6">
                            <h3
                              className="line-clamp-2 font-display text-xl"
                              style={{
                                color: "var(--tott-home-text-warm, var(--tott-home-text-strong))",
                                lineHeight: "var(--tott-display-leading)",
                                letterSpacing: "var(--tott-display-tracking)",
                              }}
                            >
                              {row.title}
                            </h3>
                            <span aria-hidden className="tott-archive-underline mt-1.5" />
                            {meta ? (
                              <span className="mt-auto block pt-5 text-xs tabular-nums" style={{ color: "var(--tott-salt)" }}>
                                {meta}
                              </span>
                            ) : null}
                          </div>
                        </ChamferedSurface>
                      </Link>
                    </StaggerItem>
                  );
                })}
              </StaggerContainer>
            ) : null}
          </div>
        )}

        {totalPages > 1 && (
          <nav
            className="mt-14 flex items-center justify-center gap-8"
            aria-label={t(`${keyPrefix}.heading`)}
          >
            <Link
              href={{ pathname: routePath, query: { page: String(Math.max(1, page - 1)) } }}
              aria-disabled={page <= 1}
              className="tott-archive-viewall group inline-flex items-center gap-2 text-sm font-medium transition-colors"
              style={{
                color: page <= 1 ? "var(--tott-muted)" : "var(--tott-gold-primary)",
                pointerEvents: page <= 1 ? "none" : "auto",
              }}
            >
              <ArrowIcon flip />
              {t(`${keyPrefix}.prev`)}
            </Link>
            <span className="text-xs tabular-nums" style={{ color: "var(--tott-salt)" }}>
              {t(`${keyPrefix}.pageOf`, { page, totalPages })}
            </span>
            <Link
              href={{ pathname: routePath, query: { page: String(Math.min(totalPages, page + 1)) } }}
              aria-disabled={page >= totalPages}
              className="tott-archive-viewall group inline-flex items-center gap-2 text-sm font-medium transition-colors"
              style={{
                color: page >= totalPages ? "var(--tott-muted)" : "var(--tott-gold-primary)",
                pointerEvents: page >= totalPages ? "none" : "auto",
              }}
            >
              {t(`${keyPrefix}.next`)}
              <ArrowIcon />
            </Link>
          </nav>
        )}
      </div>
    </main>
  );
}

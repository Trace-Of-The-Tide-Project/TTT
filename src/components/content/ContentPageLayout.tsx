import { useTranslations } from "next-intl";
import { theme } from "@/lib/theme";
import { dirFor } from "@/i18n/dir";
import { SpringLink } from "@/components/motion/SpringLink";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import HexBackground from "@/components/ui/HexBackground";
import { ShareYourStory } from "@/components/contribute/ShareYourStory";
import { ContentBreadcrumb } from "./related/ContentBreadcrumb";
import { ContentMediaPlayer } from "./media/ContentMediaPlayer";
import { ContentArticleHeader } from "./article/ContentArticleHeader";
import { ContentLanguageNotice } from "./ContentLanguageNotice";
import { ContentArticleBody, type ContentArticleSection } from "./article/ContentArticleBody";
import ArticlePreviewCTA from "./ArticlePreviewCTA";
import PremiumGate from "./PremiumGate";
import ArticleBuyGate from "./ArticleBuyGate";
import GiftGate from "@/components/gifting/GiftGate";
import { GiftWindowPanel } from "@/components/gifting/GiftWindowPanel";
import type { TranslationVersion } from "@/services/translations.service";
import { ContentAuthorCard } from "./sidebar/ContentAuthorCard";
import { ContentContributors } from "./sidebar/ContentContributors";
import { ContentCollection } from "./sidebar/ContentCollection";
import { RelatedContent } from "./related/RelatedContent";
import { ReadingProgressBar } from "./article/ReadingProgressBar";
import { FinishedReadingBadge } from "./article/FinishedReadingBadge";
import {
  ArticleTableOfContents,
  tocEntriesFromSections,
} from "./article/ArticleTableOfContents";
import type { RelatedContentCardData } from "./related/RelatedContentCard";

export type ContentPageLayoutProps = {
  articleId?: string;
  openCallId?: string;
  contentType?: string;
  breadcrumbs: { label: string; href?: string }[];
  media: {
    type: "video" | "audio" | "image" | "gallery";
    src?: string;
    thumbnail?: string;
    duration?: string;
    title?: string;
    /** Shown on hero image (e.g. article cover). */
    coverLabel?: string;
    /** Connects this hero image to a RelatedContentCard image via shared-layout morph. */
    layoutId?: string;
    items?: {
      type: "image" | "video" | "audio";
      src: string;
      thumbnail?: string;
      title?: string;
      duration?: string;
    }[];
  };
  article: {
    title: string;
    edition?: string;
    category?: string;
    publishedDate?: string;
    readingTime?: string;
    /** Shown in article header (e.g. after POST /articles/:id/view). */
    viewCount?: number;
    /** Language this version is written in — drives the language notice. */
    language?: string;
    /** Sibling versions already fetched with the article (avoids a second
     * /translations request in ContentLanguageNotice). */
    availableLanguages?: TranslationVersion[];
    sections: ContentArticleSection[];
  };
  author: {
    id?: string;
    name: string;
    initials: string;
    link?: string;
    color?: string;
    avatarUrl?: string | null;
  };
  contributors: {
    name: string;
    role: string;
    initials: string;
    color?: string;
    avatarUrl?: string | null;
  }[];
  collection: {
    articleCount: number;
    duration: string;
    items: {
      image: string;
      title: string;
      author: string;
      date: string;
      description: string;
    }[];
  };
  relatedContent: RelatedContentCardData[];
  /** Present only when the viewer does not have access to the rest of the
   * body (subscriber/paid gating). Absent for 'open' and 'preview' — a
   * preview is readable, so it never sets this. */
  gate?: {
    accessLevel: "subscriber" | "paid";
    articleId: string;
    price?: number | null;
    currency?: string | null;
    /** Gifting model (§1.4): when set, render GiftGate instead of the plain
     * buy gate — the piece is gifted, not sold at a fixed price. */
    giftMode?: boolean;
    giftValueInitial?: number | null;
    giftCurrency?: string | null;
    /** Why the gate is up — SUBSCRIPTION_REQUIRED/PURCHASE_REQUIRED/GIFT_WINDOW_ACTIVE/etc. */
    denyReason?: string | null;
    /** Gift window still open — commons_at is in the future. Shown as a
     * countdown + progress bar instead of the plain buy/gift CTA. */
    giftCommonsAt?: string | null;
    giftRaisedTotal?: number | null;
  };
  /** access_level='preview': true when blocks were truncated server-side —
   * shows the continue-reading CTA under the visible blocks. */
  previewTruncated?: boolean;
  totalBlockCount?: number;
  /** Gifting model (§1.4): set when the piece has already transitioned to
   * commons (gift window closed) — shown as a note, never a gate. */
  commonsAt?: string | null;
};

export function ContentPageLayout({
  articleId,
  openCallId,
  contentType,
  breadcrumbs,
  media,
  article,
  author,
  contributors,
  collection,
  relatedContent,
  gate,
  previewTruncated,
  commonsAt,
}: ContentPageLayoutProps) {
  const t = useTranslations("Content");
  const isOpenCall =
    contentType === "open_call" || contentType === "open-call" || contentType === "opencall";
  const isAudio = media.type === "audio";
  const tocEntries = tocEntriesFromSections(article.sections);
  return (
    <div className="relative min-h-screen w-full" style={{ backgroundColor: theme.homeSurface }}>
      <ReadingProgressBar />
      {isAudio && media.thumbnail ? (
        /* Audio hero band — a full-bleed blurred cover image behind the
           breadcrumb + player, darkened by a dual gradient that vignettes the
           edges and fades into the page surface at the bottom. Replaces the hex
           backdrop on the audio page (see Audio Figma). */
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-20 h-[432px] overflow-hidden"
        >
          <div
            className="absolute inset-0 scale-110"
            style={{
              backgroundImage: `url(${media.thumbnail})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(20px)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(270deg, rgba(var(--tott-home-surface-rgb), 0.96) 0%, rgba(var(--tott-home-surface-rgb), 0.4) 25%, rgba(var(--tott-home-surface-rgb), 0.24) 50%, rgba(var(--tott-home-surface-rgb), 0.4) 75%, rgba(var(--tott-home-surface-rgb), 0.96) 100%), linear-gradient(180deg, rgba(var(--tott-home-surface-rgb), 0.96) 0%, rgba(var(--tott-home-surface-rgb), 0.4) 25%, rgba(var(--tott-home-surface-rgb), 0.24) 50%, rgba(var(--tott-home-surface-rgb), 0.4) 75%, var(--tott-home-surface) 100%)",
            }}
          />
        </div>
      ) : (
        /* Hex-cell backdrop behind the hero — the same pattern the home and auth
            pages use; sits behind the (absolute) navbar and the breadcrumb so the
            top of the page reads as the rest of the site. */
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-35 overflow-hidden"
          style={{ opacity: "var(--tott-dash-hex-opacity, 1)" }}
        >
          <HexBackground twinkle />
        </div>
      )}

      {/* Hero content — lifted above the cells and padded clear of the
          absolute navbar so the breadcrumb no longer tucks under it. */}
      <div className="relative z-10">
        {/* Breadcrumb */}
        <div className="mx-auto max-w-7xl px-6 pt-24 sm:px-10 sm:pt-28">
          <ContentBreadcrumb items={breadcrumbs} />
        </div>

        {/* Media */}
        <div className="mx-auto max-w-7xl px-6 pb-4 pt-4 sm:px-10 sm:pb-6">
          <ContentMediaPlayer {...media} />
        </div>

        {/* Article title */}
        <div className="mx-auto max-w-7xl px-6 pb-4 sm:px-10">
          <ContentArticleHeader
            title={article.title}
            edition={article.edition}
            category={article.category}
            publishedDate={article.publishedDate}
            readingTime={article.readingTime}
            viewCount={article.viewCount}
            articleId={articleId}
            authorName={author.name}
          />
          {/* Tell the reader when this version isn't in their UI language
              (fed by the article's own `available_languages` — no extra
              request), or quietly list siblings when languages match. */}
          {articleId ? (
            <ContentLanguageNotice
              contentType="article"
              contentId={articleId}
              contentLanguage={article.language}
              preloadedVersions={article.availableLanguages}
              className="mt-3"
            />
          ) : null}
        </div>
      </div>

      {/* Two-column: article body + sidebar */}
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-8 sm:px-10 sm:pb-10 sm:pt-8">
        <div className="flex flex-col gap-10 md:flex-row md:gap-8">
          {/* Left — article body. dir/lang follow the CONTENT language, which
              can differ from the UI locale (e.g. Arabic piece on English UI). */}
          <div
            className="flex min-w-0 flex-1 flex-col gap-8"
            dir={dirFor(article.language)}
            lang={article.language}
          >
            {gate ? (
              // Subscriber/paid: the backend ships zero blocks, so there is
              // nothing real to blur — render a ghost skeleton body instead
              // of blurring an empty <div>, then wrap it in the paywall.
              gate.denyReason === "GIFT_WINDOW_ACTIVE" && gate.giftCommonsAt ? (
                // Still within the gift window — no lock icon (SRS §6.2):
                // one unified panel with countdown, progress, and the gift CTA.
                <GiftWindowPanel
                  scopeType="contribution"
                  scopeId={gate.articleId}
                  commonsAt={gate.giftCommonsAt}
                  giftValueInitial={gate.giftValueInitial}
                  giftRaisedTotal={gate.giftRaisedTotal}
                  giftCurrency={gate.giftCurrency}
                />
              ) : gate.accessLevel === "paid" && gate.giftMode ? (
                <GiftGate
                  scopeType="contribution"
                  scopeId={gate.articleId}
                  suggestedAmount={gate.giftValueInitial}
                  currency={gate.giftCurrency}
                >
                  <GhostBody />
                </GiftGate>
              ) : gate.accessLevel === "paid" ? (
                <ArticleBuyGate
                  articleId={gate.articleId}
                  price={gate.price}
                  currency={gate.currency}
                >
                  <GhostBody />
                </ArticleBuyGate>
              ) : (
                <PremiumGate feature="archive">
                  <GhostBody />
                </PremiumGate>
              )
            ) : (
              <>
                {commonsAt ? (
                  <p className="rounded-lg bg-[var(--tott-panel-bg)] px-4 py-2 text-center text-xs text-[var(--tott-home-text-muted)]">
                    {t("giftGate.commonsNotice")}
                  </p>
                ) : null}
                <ContentArticleBody sections={article.sections} />
                {previewTruncated ? <ArticlePreviewCTA /> : null}
              </>
            )}
            <div id="article-body-end" aria-hidden className="h-px" />
            {isOpenCall && (openCallId || articleId) && (
              <SpringLink
                href={`/open-calls/${openCallId || articleId}`}
                className="inline-flex w-fit items-center gap-2 rounded-lg px-8 py-3 text-sm font-semibold text-[var(--tott-on-accent)]"
                style={{ backgroundColor: theme.accentGold }}
              >
                Join Call
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </SpringLink>
            )}
          </div>

          {/* Right — sidebar */}
          <aside className="flex w-full shrink-0 flex-col gap-6 md:w-[24rem]">
            {tocEntries.length >= 2 ? (
              <div className="md:sticky md:top-6">
                <ArticleTableOfContents entries={tocEntries} title={t("onThisPage")} />
                <FinishedReadingBadge />
              </div>
            ) : null}
            <div
              className="rounded-2xl border border-[var(--tott-card-border)] p-5"
              style={{ backgroundColor: theme.homeSurface }}
            >
              <ContentAuthorCard {...author} authorId={author.id} />
              <div className="my-5 h-px bg-[var(--tott-card-border)]" />
              <ContentContributors contributors={contributors} />
            </div>
            <ContentCollection {...collection} />
          </aside>
        </div>
      </div>

      {/* Related content */}
      <RevealOnScroll>
        <RelatedContent items={relatedContent} />
      </RevealOnScroll>

      {/* Share your story */}
      <ShareYourStory surface={theme.homeSurface} />
    </div>
  );
}

// Ghost paragraph skeleton for a gated (subscriber/paid) body — the backend
// strips all blocks for an unentitled viewer, so there is no real content to
// blur; this stands in for it under the gate overlay.
const GHOST_BODY_WIDTHS = ["100%", "96%", "88%", "100%", "70%"];
function GhostBody() {
  return (
    <div aria-hidden className="space-y-3">
      {GHOST_BODY_WIDTHS.map((w, i) => (
        <div
          key={i}
          className="h-4 animate-pulse rounded-full"
          style={{ width: w, backgroundColor: "var(--tott-panel-bg)" }}
        />
      ))}
    </div>
  );
}

import { theme } from "@/lib/theme";
import { SpringLink } from "@/components/motion/SpringLink";
import HexBackground from "@/components/ui/HexBackground";
import { ShareYourStory } from "@/components/contribute/ShareYourStory";
import { ContentBreadcrumb } from "./related/ContentBreadcrumb";
import { ContentMediaPlayer } from "./media/ContentMediaPlayer";
import { ContentArticleHeader } from "./article/ContentArticleHeader";
import { ContentArticleBody, type ContentArticleSection } from "./article/ContentArticleBody";
import { ContentAuthorCard } from "./sidebar/ContentAuthorCard";
import { ContentContributors } from "./sidebar/ContentContributors";
import { ContentCollection } from "./sidebar/ContentCollection";
import { RelatedContent } from "./related/RelatedContent";
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
    sections: ContentArticleSection[];
  };
  author: {
    id?: string;
    name: string;
    initials: string;
    link?: string;
    color?: string;
  };
  contributors: {
    name: string;
    role: string;
    initials: string;
    color?: string;
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
}: ContentPageLayoutProps) {
  const isOpenCall =
    contentType === "open_call" || contentType === "open-call" || contentType === "opencall";
  const isAudio = media.type === "audio";
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden" style={{ backgroundColor: theme.homeSurface }}>
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
          <HexBackground />
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
          />
        </div>
      </div>

      {/* Two-column: article body + sidebar */}
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-8 sm:px-10 sm:pb-10 sm:pt-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-8">
          {/* Left — article body */}
          <div className="flex min-w-0 flex-1 flex-col gap-8">
            <ContentArticleBody sections={article.sections} />
            {isOpenCall && (openCallId || articleId) && (
              <SpringLink
                href={`/open-calls/${openCallId || articleId}`}
                className="inline-flex w-fit items-center gap-2 rounded-lg px-8 py-3 text-sm font-semibold text-black"
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
          <aside className="flex w-full shrink-0 flex-col gap-6 lg:sticky lg:top-6 lg:w-[24rem] lg:self-start">
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
      <RelatedContent items={relatedContent} />

      {/* Share your story */}
      <ShareYourStory surface={theme.homeSurface} />
    </div>
  );
}
